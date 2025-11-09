import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useColorModeValue,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Badge,
  Icon,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter
} from '@chakra-ui/react'
import { FileText, Plus, Save, Edit2, Trash2, Copy, MoreVertical, Sparkles, Search, UserPlus } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ReactMarkdown from 'react-markdown'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'
import { ALL_BUILT_IN_TEMPLATES, BuiltInTemplate } from '../config/templateLibrary'
import { useNavigate } from 'react-router-dom'

interface TemplateFormData {
  title: string
  description: string
  difficulty: string
  script: string
}

function Admin() {
  const { organization } = useProfile()
  const navigate = useNavigate()
  
  // Load form data from localStorage or use defaults
  const loadFormData = (): TemplateFormData => {
    try {
      const saved = localStorage.getItem('templateFormData')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error loading form data from localStorage:', error)
    }
    return {
      title: '',
      description: '',
      difficulty: '',
      script: ''
    }
  }

  const [formData, setFormData] = useState<TemplateFormData>(loadFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  
  // Load editing state from localStorage
  const loadEditingTemplate = (): Template | null => {
    try {
      const saved = localStorage.getItem('editingTemplate')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error loading editing template from localStorage:', error)
    }
    return null
  }

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(loadEditingTemplate)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  // Template library state
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [selectedViewTemplate, setSelectedViewTemplate] = useState<BuiltInTemplate | Template | null>(null)
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.750')

  // Save form data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('templateFormData', JSON.stringify(formData))
  }, [formData])

  // Save editing template to localStorage whenever it changes
  React.useEffect(() => {
    if (editingTemplate) {
      localStorage.setItem('editingTemplate', JSON.stringify(editingTemplate))
    } else {
      localStorage.removeItem('editingTemplate')
    }
  }, [editingTemplate])

  // Fetch templates when org is available
  React.useEffect(() => {
    fetchTemplates()
  }, [organization?.id])

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true)
      const query = supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      // Only show templates for this organization
      if (organization?.id) {
        query.eq('org', organization.id)
      } else {
        // If org is not ready yet, keep list empty
        setTemplates([])
        setIsLoadingTemplates(false)
        return
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching templates:', error)
        toast({
          title: 'Error loading templates',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleInputChange = (field: keyof TemplateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateScript = async () => {
    // Validate required fields for generation
    if (!formData.title || !formData.description || !formData.difficulty) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in Title, Description, and Difficulty Level before generating a script.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      })
      return
    }

    setIsGeneratingScript(true)

    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          insuranceType: 'life', // Hardcoded to life insurance
          difficulty: formData.difficulty
        })
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error('Server error - please check if OpenAI API key is configured')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script')
      }

      // Update the script field with generated content
      setFormData(prev => ({ ...prev, script: data.script }))

      toast({
        title: 'Script Generated!',
        description: `AI generated a ${formData.difficulty} difficulty script for life insurance.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

    } catch (error) {
      console.error('Error generating script:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate script. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.difficulty || !formData.script) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingTemplate) {
        // Update existing template
        const response = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            insuranceType: 'life', // Hardcoded to life insurance
            difficulty: formData.difficulty,
            script: formData.script
          })
        })

        if (!response.ok) throw new Error('Failed to update template')

        toast({
          title: 'Template updated!',
          description: `${formData.title} has been successfully updated`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        setEditingTemplate(null)
      } else {
        // Create new template
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            insuranceType: 'life', // Hardcoded to life insurance
            difficulty: formData.difficulty,
            script: formData.script,
            org: organization?.id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create template')
        }

        toast({
          title: 'Template created!',
          description: `${formData.title} has been successfully created`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }

      // Reset form and clear localStorage
      const emptyForm = {
        title: '',
        description: '',
        difficulty: '',
        script: ''
      }
      setFormData(emptyForm)
      localStorage.removeItem('templateFormData')
      
      // Refresh templates list
      fetchTemplates()

    } catch (error) {
      console.error(`Error ${editingTemplate ? 'updating' : 'creating'} template:`, error)
      toast({
        title: `Error ${editingTemplate ? 'updating' : 'creating'} template`,
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTemplate = async (template: Template) => {
    setFormData({
      title: template.title,
      description: template.description,
      difficulty: template.difficulty,
      script: template.script
    })
    setEditingTemplate(template)
  }

  const handleDuplicateTemplate = (template: Template) => {
    setFormData({
      title: `${template.title} (Copy)`,
      description: template.description,
      difficulty: template.difficulty,
      script: template.script
    })
    setEditingTemplate(null)
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete template')

      toast({
        title: 'Template deleted',
        description: `${templateToDelete.title} has been deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Error deleting template',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setTemplateToDelete(null)
      onDeleteClose()
    }
  }

  const confirmDelete = (template: Template) => {
    setTemplateToDelete(template)
    onDeleteOpen()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green'
      case 'medium': return 'yellow'
      case 'hard': return 'orange'
      case 'expert': return 'red'
      default: return 'gray'
    }
  }

  // Template library functions
  const filterBuiltInTemplates = (templates: BuiltInTemplate[]) => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter
      
      return matchesSearch && matchesDifficulty
    })
  }

  const filterCustomTemplates = (templates: Template[]) => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter
      
      return matchesSearch && matchesDifficulty
    })
  }

  const basicTemplates = filterBuiltInTemplates(ALL_BUILT_IN_TEMPLATES.filter(t => t.category === 'basic'))
  const advancedTemplates = filterBuiltInTemplates(ALL_BUILT_IN_TEMPLATES.filter(t => t.category === 'advanced'))
  const filteredCustom = filterCustomTemplates(templates)

  const handleViewTemplate = (template: BuiltInTemplate | Template) => {
    setSelectedViewTemplate(template)
    onViewOpen()
  }

  const isBuiltInTemplate = (template: any): template is BuiltInTemplate => {
    return 'isBuiltIn' in template && template.isBuiltIn === true
  }

  const handleAssignTemplate = async (template: BuiltInTemplate | Template) => {
    // Check if this is a built-in template
    if (isBuiltInTemplate(template)) {
      // Check if this built-in template exists in the database
      const { data: dbTemplates, error } = await supabase
        .from('templates')
        .select('id, title')
        .eq('title', template.title)
        .limit(1)
      
      if (error || !dbTemplates || dbTemplates.length === 0) {
        toast({
          title: 'Built-in template not found in database',
          description: 'Please run the insert_built_in_templates.sql script first to add built-in templates to your database. Check the project root folder for this file.',
          status: 'error',
          duration: 8000,
          isClosable: true,
        })
        return
      }
      
      // Use the database ID for the built-in template
      navigate('/assignments', {
        state: {
          prefillTemplate: {
            id: dbTemplates[0].id.toString(),
            title: template.title,
            description: template.description,
            difficulty: template.difficulty
          }
        }
      })
    } else {
      // Custom template - use its database ID directly
      navigate('/assignments', {
        state: {
          prefillTemplate: {
            id: template.id.toString(),
            title: template.title,
            description: template.description,
            difficulty: template.difficulty
          }
        }
      })
    }
  }

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const headerBg = useColorModeValue('white', 'gray.800')
  const accentColor = useColorModeValue('#f26f25', '#ff7d31')

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Template Creation */}
        <Panel 
          defaultSize={50} 
          minSize={30}
          maxSize={60}
        >
          <Box 
            bg={cardBg} 
            h="full"
            borderRight="1px" 
            borderColor={borderColor} 
            overflow="hidden" 
            display="flex" 
            flexDirection="column"
            borderRadius="xl"
            borderTopRightRadius="0"
            borderBottomRightRadius="0"
          >
          {/* Sidebar Header */}
          <Box 
            px={6}
            py={4}
            borderBottom="1px"
            borderColor={borderColor}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                size="md" 
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
              >
                Template Creation
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.600', 'gray.400')}
              >
                Create custom training scenarios with AI personas
              </Text>
            </VStack>
          </Box>
          
          {/* Sidebar Content */}
          <Box flex={1} overflowY="auto" p={6}>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Box>
                <Heading 
                  size="md" 
                  mb={4}
                  color={useColorModeValue('gray.900', 'white')}
                  fontWeight="600"
                  letterSpacing="-0.01em"
                >
                  Basic Information
                </Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel 
                      fontSize="sm" 
                      color={useColorModeValue('gray.700', 'gray.300')} 
                      fontWeight="semibold"
                      mb={2}
                    >
                      Template Title
                    </FormLabel>
                    <Input
                      placeholder="e.g., Skeptical Business Owner"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.100', 'gray.750')}
                      borderRadius="xl"
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.600')
                      }}
                      _focus={{
                        borderColor: accentColor,
                        boxShadow: `0 0 0 1px ${accentColor}`
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      fontSize="sm" 
                      color={useColorModeValue('gray.700', 'gray.300')} 
                      fontWeight="semibold"
                      mb={2}
                    >
                      Description
                    </FormLabel>
                    <Textarea
                      placeholder="Brief description of the customer persona and scenario..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.100', 'gray.750')}
                      borderRadius="xl"
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.600')
                      }}
                      _focus={{
                        borderColor: accentColor,
                        boxShadow: `0 0 0 1px ${accentColor}`
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      fontSize="sm" 
                      color={useColorModeValue('gray.700', 'gray.300')} 
                      fontWeight="semibold"
                      mb={2}
                    >
                      Difficulty Level
                    </FormLabel>
                    <Select
                      placeholder="Select difficulty"
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.100', 'gray.750')}
                      borderRadius="xl"
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.600')
                      }}
                      _focus={{
                        borderColor: accentColor,
                        boxShadow: `0 0 0 1px ${accentColor}`
                      }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </Select>
                  </FormControl>

                  {/* Preview of selected options */}
                  {formData.difficulty && (
                    <Flex gap={2} mt={2}>
                      <Badge colorScheme="orange" textTransform="capitalize">
                        Life Insurance
                      </Badge>
                      <Badge colorScheme={getDifficultyColor(formData.difficulty)} textTransform="capitalize">
                        {formData.difficulty}
                      </Badge>
                    </Flex>
                  )}
                </VStack>
              </Box>

              {/* Script Input */}
              <Box>
                <HStack justify="space-between" align="center" mb={3}>
                  <FormLabel 
                    fontSize="sm" 
                    color={useColorModeValue('gray.700', 'gray.300')} 
                    fontWeight="semibold"
                    mb={0}
                  >
                    Training Script
                  </FormLabel>
                  <Button
                    size="sm"
                    bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                    color="white"
                    leftIcon={<Icon as={Sparkles} boxSize="4" />}
                    onClick={generateScript}
                    isLoading={isGeneratingScript}
                    loadingText="Generating..."
                    isDisabled={!formData.title || !formData.description || !formData.difficulty}
                    _hover={{
                      bg: "linear-gradient(135deg, #d95e1e, #b84e19)",
                      transform: 'translateY(-1px)',
                      shadow: 'lg'
                    }}
                    borderRadius="xl"
                    fontWeight="600"
                    px={4}
                    shadow="sm"
                  >
                    Generate Script
                  </Button>
                </HStack>
                
                <FormControl isRequired>
                  <Textarea
                    placeholder="Enter your training script here.

Use markdown formatting:
# Main Title
## Section Headers
**Bold text** for emphasis
Speaker: Clear dialogue format"
                    value={formData.script}
                    onChange={(e) => handleInputChange('script', e.target.value)}
                    rows={18}
                    fontFamily="monospace"
                    fontSize="sm"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.100', 'gray.750')}
                    borderRadius="xl"
                    _hover={{
                      borderColor: useColorModeValue('gray.300', 'gray.600')
                    }}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`
                    }}
                  />
                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mt={2}>
                    <strong>Formatting Tips:</strong> Use # for headers, ## for sections, **bold** for emphasis, and clear Speaker: labels for dialogue
                  </Text>
                </FormControl>
              </Box>

              {/* Action Buttons */}
              <VStack spacing={3} align="stretch">
                <Button
                  bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                  color="white"
                  size="md"
                  leftIcon={<Icon as={Save} boxSize="4" />}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText={editingTemplate ? "Updating..." : "Creating..."}
                  w="full"
                  _hover={{
                    bg: "linear-gradient(135deg, #d95e1e, #b84e19)",
                    transform: 'translateY(-1px)',
                    shadow: 'lg'
                  }}
                  borderRadius="xl"
                  fontWeight="600"
                  py={6}
                  shadow="md"
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
                
                <HStack spacing={3}>
                  <Button
                    variant="outline"
                    size="md"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    color={useColorModeValue('gray.700', 'gray.300')}
                    borderRadius="xl"
                    _hover={{
                      bg: useColorModeValue('gray.50', 'gray.700'),
                      borderColor: useColorModeValue('gray.300', 'gray.500')
                    }}
                    onClick={() => {
                      const emptyForm = {
                        title: '',
                        description: '',
                        difficulty: '',
                        script: ''
                      }
                      setFormData(emptyForm)
                      setEditingTemplate(null)
                      localStorage.removeItem('templateFormData')
                      localStorage.removeItem('editingTemplate')
                    }}
                    flex={1}
                  >
                    Clear Fields
                  </Button>
                  
                  {editingTemplate && (
                    <Button
                      variant="outline"
                      size="md"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      color={useColorModeValue('gray.700', 'gray.300')}
                      borderRadius="xl"
                      _hover={{
                        bg: useColorModeValue('gray.50', 'gray.700'),
                        borderColor: useColorModeValue('gray.300', 'gray.500')
                      }}
                      onClick={() => {
                        setEditingTemplate(null)
                        const emptyForm = {
                          title: '',
                          description: '',
                          difficulty: '',
                          script: ''
                        }
                        setFormData(emptyForm)
                        localStorage.removeItem('templateFormData')
                        localStorage.removeItem('editingTemplate')
                      }}
                      flex={1}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </HStack>
              </VStack>
            </VStack>
          </Box>
          </Box>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle>
          <Box 
            w="1px" 
            h="full" 
            bg={useColorModeValue('gray.100', 'gray.750')}
            _hover={{ 
              bg: accentColor,
              w: "3px",
              shadow: 'lg'
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="col-resize"
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* Decorative handle dots */}
            <Box 
              position="absolute"
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="full"
              p={1}
              shadow="sm"
              opacity={0.7}
              _hover={{ opacity: 1 }}
              transition="opacity 0.2s"
            >
              <VStack spacing={0.5}>
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
              </VStack>
            </Box>
          </Box>
        </PanelResizeHandle>

        {/* Right Panel - Template Management */}
        <Panel 
          defaultSize={50} 
          minSize={40}
        >
          <Box 
            bg={cardBg} 
            h="full" 
            overflow="hidden" 
            display="flex" 
            flexDirection="column"
            borderRadius="xl"
            borderTopLeftRadius="0"
            borderBottomLeftRadius="0"
          >
          {/* Right Panel Header */}
          <Box 
            px={6}
            py={4}
            borderBottom="1px"
            borderColor={borderColor}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                size="md" 
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
              >
                Template Library
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.600', 'gray.400')}
              >
                Browse built-in personas and manage your custom templates
              </Text>
            </VStack>
          </Box>
          
          {/* Template Library Content with Tabs */}
          <Box flex={1} overflowY="auto" p={6}>
            <VStack spacing={6} align="stretch">
              {/* Search and Filters */}
              <VStack align="stretch" spacing={4}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} color={useColorModeValue('gray.400', 'gray.500')} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="xl"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`
                    }}
                  />
                </InputGroup>

                <HStack spacing={4}>
                  <Select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    size="md"
                    borderRadius="xl"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`
                    }}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </Select>
                </HStack>
              </VStack>

              {/* Tabs for Built-In vs Custom */}
              <Tabs colorScheme="orange" size="lg">
                <TabList borderBottom="2px solid" borderColor={borderColor}>
                  <Tab 
                    fontWeight="600"
                    _selected={{
                      color: accentColor,
                      borderColor: accentColor
                    }}
                  >
                    Basic ({basicTemplates.length})
                  </Tab>
                  <Tab 
                    fontWeight="600"
                    _selected={{
                      color: accentColor,
                      borderColor: accentColor
                    }}
                  >
                    Advanced ({advancedTemplates.length})
                  </Tab>
                  <Tab 
                    fontWeight="600"
                    _selected={{
                      color: accentColor,
                      borderColor: accentColor
                    }}
                  >
                    Custom ({filteredCustom.length})
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Basic Templates */}
                  <TabPanel px={0} py={6}>
                    {basicTemplates.length === 0 ? (
                      <Text color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" py={8}>
                        No basic templates match your search
                      </Text>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {basicTemplates.map((template) => (
                          <Card 
                            key={template.id}
                            bg={cardBg}
                            border="2px solid"
                            borderColor={borderColor}
                            borderRadius="2xl"
                            backdropFilter="blur(10px)"
                            _hover={{
                              borderColor: useColorModeValue('orange.300', 'orange.600'),
                              shadow: 'xl',
                              transform: 'translateY(-2px) scale(1.01)'
                            }}
                            transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                            shadow="lg"
                            cursor="pointer"
                            onClick={() => handleViewTemplate(template)}
                          >
                            <CardBody p={6}>
                              <VStack align="stretch" spacing={3}>
                                <Heading 
                                  size="md" 
                                  color={useColorModeValue('gray.900', 'white')}
                                  fontWeight="600"
                                  letterSpacing="-0.01em"
                                >
                                  {template.title}
                                </Heading>
                                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} lineHeight="1.5">
                                  {template.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge 
                                    bgGradient={
                                      template.difficulty === 'easy' ? 'linear(to-r, green.400, teal.400)' : 
                                      template.difficulty === 'medium' ? 'linear(to-r, yellow.400, orange.400)' : 
                                      template.difficulty === 'hard' ? 'linear(to-r, orange.400, red.400)' : 
                                      'linear(to-r, red.500, pink.500)'
                                    }
                                    color="white"
                                    textTransform="capitalize"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    fontWeight="600"
                                    shadow="sm"
                                  >
                                    {template.difficulty}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </TabPanel>

                  {/* Advanced Templates */}
                  <TabPanel px={0} py={6}>
                    {advancedTemplates.length === 0 ? (
                      <Text color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" py={8}>
                        No advanced templates match your search
                      </Text>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {advancedTemplates.map((template) => (
                          <Card 
                            key={template.id}
                            bg={cardBg}
                            border="2px solid"
                            borderColor={borderColor}
                            borderRadius="2xl"
                            backdropFilter="blur(10px)"
                            _hover={{
                              borderColor: useColorModeValue('orange.300', 'orange.600'),
                              shadow: 'xl',
                              transform: 'translateY(-2px) scale(1.01)'
                            }}
                            transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                            shadow="lg"
                            cursor="pointer"
                            onClick={() => handleViewTemplate(template)}
                          >
                            <CardBody p={6}>
                              <VStack align="stretch" spacing={3}>
                                <Heading 
                                  size="md" 
                                  color={useColorModeValue('gray.900', 'white')}
                                  fontWeight="600"
                                  letterSpacing="-0.01em"
                                >
                                  {template.title}
                                </Heading>
                                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} lineHeight="1.5">
                                  {template.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge 
                                    bgGradient={
                                      template.difficulty === 'easy' ? 'linear(to-r, green.400, teal.400)' : 
                                      template.difficulty === 'medium' ? 'linear(to-r, yellow.400, orange.400)' : 
                                      template.difficulty === 'hard' ? 'linear(to-r, orange.400, red.400)' : 
                                      'linear(to-r, red.500, pink.500)'
                                    }
                                    color="white"
                                    textTransform="capitalize"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    fontWeight="600"
                                    shadow="sm"
                                  >
                                    {template.difficulty}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </TabPanel>

                  {/* Custom Templates */}
                  <TabPanel px={0} py={6}>
                    {isLoadingTemplates ? (
                      <VStack spacing={4} justify="center" py={12}>
                        <Spinner size="xl" color={accentColor} thickness="4px" />
                        <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Loading templates...
                        </Text>
                      </VStack>
                    ) : filteredCustom.length === 0 ? (
                      <VStack spacing={4} justify="center" py={12} color={useColorModeValue('gray.400', 'gray.500')}>
                        <Box 
                          w="16"
                          h="16"
                          borderRadius="full"
                          bg={useColorModeValue('gray.100', 'gray.700')}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={FileText} boxSize={8} />
                        </Box>
                        <VStack spacing={1} textAlign="center">
                          <Text fontSize="lg" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')}>
                            {searchQuery || difficultyFilter !== 'all' ? 'No templates match your search' : 'No custom templates yet'}
                          </Text>
                          {!searchQuery && difficultyFilter === 'all' && (
                            <Text fontSize="sm">
                              Create your first template using the form on the left
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {filteredCustom.map((template) => (
                          <Card 
                            key={template.id} 
                            bg={cardBg}
                            border="2px solid"
                            borderColor={borderColor}
                            borderRadius="2xl"
                            _hover={{
                              borderColor: useColorModeValue('orange.300', 'orange.600'),
                              shadow: 'xl',
                              transform: 'translateY(-2px) scale(1.01)'
                            }}
                            transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                            shadow="lg"
                          >
                            <CardBody p={5}>
                              <Flex justify="space-between" align="flex-start" mb={4}>
                                <Box flex={1} onClick={() => handleViewTemplate(template)} cursor="pointer">
                                  <HStack justify="space-between" align="flex-start" mb={3}>
                                    <Heading 
                                      size="md" 
                                      color={useColorModeValue('gray.900', 'white')}
                                      fontWeight="600"
                                      letterSpacing="-0.01em"
                                    >
                                      {template.title}
                                    </Heading>
                                    <Badge 
                                      bgGradient="linear(to-r, orange.500, orange.600)"
                                      color="white"
                                      borderRadius="full" 
                                      px={3}
                                      py={1}
                                      fontWeight="600"
                                      shadow="sm"
                                    >
                                      Custom
                                    </Badge>
                                  </HStack>
                                  
                                  <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} mb={4} lineHeight="1.5">
                                    {template.description}
                                  </Text>
                                  
                                  <HStack spacing={3} mb={4}>
                                    <Badge 
                                      bgGradient={
                                        template.difficulty === 'easy' ? 'linear(to-r, green.400, teal.400)' : 
                                        template.difficulty === 'medium' ? 'linear(to-r, yellow.400, orange.400)' : 
                                        template.difficulty === 'hard' ? 'linear(to-r, orange.400, red.400)' : 
                                        'linear(to-r, red.500, pink.500)'
                                      }
                                      color="white"
                                      textTransform="capitalize"
                                      borderRadius="full"
                                      px={3}
                                      py={1}
                                      fontWeight="600"
                                      shadow="sm"
                                    >
                                      {template.difficulty}
                                    </Badge>
                                    <Badge 
                                      colorScheme="orange" 
                                      variant="outline"
                                      textTransform="capitalize"
                                      borderRadius="full"
                                      px={3}
                                      py={1}
                                      fontWeight="500"
                                    >
                                      {template.type}
                                    </Badge>
                                  </HStack>
                                  
                                  <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')} fontWeight="500">
                                    Created {new Date(template.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Text>
                                </Box>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<Icon as={MoreVertical} />}
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Template actions"
                                    borderRadius="lg"
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <MenuList borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
                                    <MenuItem 
                                      icon={<Icon as={Edit2} />}
                                      onClick={() => handleEditTemplate(template)}
                                      borderRadius="lg"
                                      _hover={{ bg: useColorModeValue('orange.50', 'orange.900/30') }}
                                    >
                                      Edit
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<Icon as={Copy} />}
                                      onClick={() => handleDuplicateTemplate(template)}
                                      borderRadius="lg"
                                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                    >
                                      Duplicate
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<Icon as={Trash2} />}
                                      onClick={() => confirmDelete(template)}
                                      color="red.500"
                                      borderRadius="lg"
                                      _hover={{ bg: useColorModeValue('red.50', 'red.900/30') }}
                                    >
                                      Delete
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </Flex>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </Box>
          </Box>
        </Panel>
      </PanelGroup>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Template
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{templateToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteTemplate} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Template View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader 
            borderBottom="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            py={6}
          >
            <VStack align="stretch" spacing={3}>
              <Heading size="lg" fontWeight="600">
                {selectedViewTemplate?.title}
              </Heading>
              <HStack spacing={3}>
                {selectedViewTemplate && isBuiltInTemplate(selectedViewTemplate) && (
                  <Badge colorScheme="orange" borderRadius="full" px={3} py={1} fontWeight="600">
                    Built-In
                  </Badge>
                )}
                {selectedViewTemplate && !isBuiltInTemplate(selectedViewTemplate) && (
                  <Badge 
                    bgGradient="linear(to-r, orange.500, orange.600)"
                    color="white"
                    borderRadius="full" 
                    px={3}
                    py={1}
                    fontWeight="600"
                  >
                    Custom
                  </Badge>
                )}
                <Badge 
                  bgGradient={
                    selectedViewTemplate?.difficulty === 'easy' ? 'linear(to-r, green.400, teal.400)' : 
                    selectedViewTemplate?.difficulty === 'medium' ? 'linear(to-r, yellow.400, orange.400)' : 
                    selectedViewTemplate?.difficulty === 'hard' ? 'linear(to-r, orange.400, red.400)' : 
                    'linear(to-r, red.500, pink.500)'
                  }
                  color="white"
                  textTransform="capitalize"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="600"
                >
                  {selectedViewTemplate?.difficulty}
                </Badge>
              </HStack>
              <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
                {selectedViewTemplate?.description}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="60vh" overflowY="auto" py={6}>
            {selectedViewTemplate && (
              <Box
                bg={useColorModeValue('gray.50', 'gray.900')}
                p={6}
                borderRadius="xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <Heading as="h1" size="xl" mt={4} mb={2} {...props} />,
                    h2: ({ node, ...props }) => <Heading as="h2" size="lg" mt={6} mb={3} {...props} />,
                    h3: ({ node, ...props }) => <Heading as="h3" size="md" mt={4} mb={2} {...props} />,
                    p: ({ node, ...props }) => <Text mb={3} lineHeight="1.7" {...props} />,
                    ul: ({ node, ...props }) => <Box as="ul" pl={6} mb={3} {...props} />,
                    ol: ({ node, ...props }) => <Box as="ol" pl={6} mb={3} {...props} />,
                    li: ({ node, ...props }) => <Box as="li" mb={1} {...props} />,
                    strong: ({ node, ...props }) => <Box as="strong" fontWeight="bold" color={useColorModeValue('#f26f25', '#ff7d31')} {...props} />,
                    em: ({ node, ...props }) => <Box as="em" fontStyle="italic" {...props} />,
                    code: ({ node, ...props }) => (
                      <Box
                        as="code"
                        bg={useColorModeValue('gray.100', 'gray.800')}
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                        fontFamily="monospace"
                        {...props}
                      />
                    ),
                  }}
                >
                  {selectedViewTemplate.script}
                </ReactMarkdown>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
            <Button
              colorScheme="orange"
              leftIcon={<Icon as={UserPlus} />}
              onClick={() => {
                if (selectedViewTemplate) {
                  handleAssignTemplate(selectedViewTemplate)
                }
              }}
              size="lg"
              borderRadius="xl"
              fontWeight="600"
              mr={3}
            >
              Assign to Team
            </Button>
            <Button variant="outline" onClick={onViewClose} borderRadius="xl">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Admin
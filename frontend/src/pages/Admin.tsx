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
  IconButton
} from '@chakra-ui/react'
import { FileText, Plus, Save, Edit2, Trash2, Copy, MoreVertical, Sparkles } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'

interface TemplateFormData {
  title: string
  description: string
  insuranceType: string
  difficulty: string
  script: string
}

function Admin() {
  const { organization } = useProfile()
  
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
      insuranceType: '',
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
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
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
    if (!formData.title || !formData.description || !formData.insuranceType || !formData.difficulty) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in Title, Description, Insurance Type, and Difficulty Level before generating a script.',
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
          insuranceType: formData.insuranceType,
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
        description: `AI generated a ${formData.difficulty} difficulty script for ${formData.insuranceType} insurance.`,
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
    if (!formData.title || !formData.description || !formData.insuranceType || !formData.difficulty || !formData.script) {
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
            insuranceType: formData.insuranceType,
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
            insuranceType: formData.insuranceType,
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
        insuranceType: '',
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
      insuranceType: template.type,
      difficulty: template.difficulty,
      script: template.script
    })
    setEditingTemplate(template)
  }

  const handleDuplicateTemplate = (template: Template) => {
    setFormData({
      title: `${template.title} (Copy)`,
      description: template.description,
      insuranceType: template.type,
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

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const headerBg = useColorModeValue('gray.50/80', 'gray.800/80')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

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
            bg={headerBg}
            backdropFilter="blur(10px)"
            borderBottom="1px"
            borderColor={borderColor}
            px={6}
            py={5}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                size="lg" 
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
                letterSpacing="-0.02em"
              >
                Template Creation
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
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

                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel 
                        fontSize="sm" 
                        color={useColorModeValue('gray.700', 'gray.300')} 
                        fontWeight="semibold"
                        mb={2}
                      >
                        Insurance Type
                      </FormLabel>
                      <Select
                        placeholder="Select insurance type"
                        value={formData.insuranceType}
                        onChange={(e) => handleInputChange('insuranceType', e.target.value)}
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
                        <option value="health">Health Insurance</option>
                        <option value="life">Life Insurance</option>
                        <option value="auto">Auto Insurance</option>
                        <option value="business">Business Insurance</option>
                        <option value="home">Home Insurance</option>
                        <option value="disability">Disability Insurance</option>
                      </Select>
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
                  </VStack>

                  {/* Preview of selected options */}
                  {(formData.insuranceType || formData.difficulty) && (
                    <Flex gap={2} mt={2}>
                      {formData.insuranceType && (
                        <Badge colorScheme="blue" textTransform="capitalize">
                          {formData.insuranceType}
                        </Badge>
                      )}
                      {formData.difficulty && (
                        <Badge colorScheme={getDifficultyColor(formData.difficulty)} textTransform="capitalize">
                          {formData.difficulty}
                        </Badge>
                      )}
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
                    bg="linear-gradient(135deg, #9333ea, #7c3aed)"
                    color="white"
                    leftIcon={<Icon as={Sparkles} boxSize="4" />}
                    onClick={generateScript}
                    isLoading={isGeneratingScript}
                    loadingText="Generating..."
                    isDisabled={!formData.title || !formData.description || !formData.insuranceType || !formData.difficulty}
                    _hover={{
                      bg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
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
                  bg="linear-gradient(135deg, #3b82f6, #2563eb)"
                  color="white"
                  size="md"
                  leftIcon={<Icon as={Save} boxSize="4" />}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText={editingTemplate ? "Updating..." : "Creating..."}
                  w="full"
                  _hover={{
                    bg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
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
                        insuranceType: '',
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
                          insuranceType: '',
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
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="24px"
              h="48px"
              bg={cardBg}
              border="1px solid"
              borderColor={useColorModeValue('gray.100', 'gray.750')}
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={0}
              _hover={{ opacity: 1, shadow: 'md' }}
              transition="all 0.3s"
              backdropFilter="blur(10px)"
            >
              <VStack spacing="2px">
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
            bg={headerBg}
            backdropFilter="blur(10px)"
            borderBottom="1px"
            borderColor={useColorModeValue('gray.100', 'gray.750')}
            px={6}
            py={5}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                size="lg" 
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
                letterSpacing="-0.02em"
              >
                Template Library
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
              >
                Manage and preview your training templates
              </Text>
            </VStack>
          </Box>
          
          {/* Template List Content */}
          <Box flex={1} overflowY="auto" p={6}>
            <VStack spacing={4} align="stretch">
              {isLoadingTemplates ? (
                <VStack spacing={4} justify="center" py={12}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                    Loading templates...
                  </Text>
                </VStack>
              ) : templates.length === 0 ? (
                <VStack spacing={4} justify="center" py={12} color={useColorModeValue('gray.400', 'gray.500')}>
                  <Box
                    w="16"
                    h="16"
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    display="flex"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FileText} boxSize={8} />
                  </Box>
                  <VStack spacing={1} textAlign="center">
                    <Text fontSize="lg" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')}>
                      No templates yet
                    </Text>
                    <Text fontSize="sm">
                      Create your first template using the form on the left
                    </Text>
                  </VStack>
                </VStack>
              ) : (
                templates.map((template) => (
                  <Card 
                    key={template.id} 
                    bg={cardBg}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.100', 'gray.750')}
                    borderRadius="2xl"
                    _hover={{
                      borderColor: useColorModeValue('gray.300', 'gray.600'),
                      shadow: 'lg',
                      transform: 'translateY(-1px)'
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    shadow="sm"
                  >
                    <CardBody p={5}>
                      <Flex justify="space-between" align="flex-start" mb={4}>
                        <Box flex={1}>
                          <HStack justify="space-between" align="flex-start" mb={3}>
                            <Heading 
                              size="md" 
                              color={useColorModeValue('gray.900', 'white')}
                              fontWeight="600"
                              letterSpacing="-0.01em"
                            >
                              {template.title}
                            </Heading>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<Icon as={MoreVertical} />}
                                variant="ghost"
                                size="sm"
                                aria-label="Template actions"
                                borderRadius="lg"
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                              />
                              <MenuList borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
                                <MenuItem 
                                  icon={<Icon as={Edit2} />}
                                  onClick={() => handleEditTemplate(template)}
                                  borderRadius="lg"
                                  _hover={{ bg: useColorModeValue('blue.50', 'blue.900/30') }}
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
                          </HStack>
                          
                          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} mb={4} lineHeight="1.5">
                            {template.description}
                          </Text>
                          
                          <HStack spacing={3} mb={4}>
                            <Badge 
                              colorScheme={getDifficultyColor(template.difficulty)} 
                              variant="subtle"
                              textTransform="capitalize"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontWeight="500"
                            >
                              {template.difficulty}
                            </Badge>
                            <Badge 
                              colorScheme="blue" 
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
                      </Flex>
                    </CardBody>
                  </Card>
                ))
              )}
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
    </Box>
  )
}

export default Admin
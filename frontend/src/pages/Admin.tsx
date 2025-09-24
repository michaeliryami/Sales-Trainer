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
import { FileText, Plus, Save, Edit2, Trash2, Copy, MoreVertical } from 'lucide-react'
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
  const [formData, setFormData] = useState<TemplateFormData>({
    title: '',
    description: '',
    insuranceType: '',
    difficulty: '',
    script: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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

      // Reset form
      setFormData({
        title: '',
        description: '',
        insuranceType: '',
        difficulty: '',
        script: ''
      })
      
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

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Template Creation */}
        <Panel 
          defaultSize={40} 
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
          >
          {/* Sidebar Header */}
          <Flex p={4} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center" bg={cardBg}>
            <Box flex={1}>
              <HStack justify="space-between" align="center" mb={1}>
                <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                  Template Creation
                </Heading>
              </HStack>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Create custom training scenarios with AI personas
              </Text>
            </Box>
          </Flex>
          
          {/* Sidebar Content */}
          <Box flex={1} overflowY="auto" p={4}>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Box>
                <Heading size="md" mb={4}>Basic Information</Heading>
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
                      bg={useColorModeValue('white', 'gray.700')}
                      border="2px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.500')
                      }}
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
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
                      bg={useColorModeValue('white', 'gray.700')}
                      border="2px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.500')
                      }}
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
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
                        bg={useColorModeValue('white', 'gray.700')}
                        border="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        _hover={{
                          borderColor: useColorModeValue('gray.300', 'gray.500')
                        }}
                        _focus={{
                          borderColor: "blue.400",
                          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
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
                        bg={useColorModeValue('white', 'gray.700')}
                        border="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        _hover={{
                          borderColor: useColorModeValue('gray.300', 'gray.500')
                        }}
                        _focus={{
                          borderColor: "blue.400",
                          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
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
                <FormLabel 
                  fontSize="sm" 
                  color={useColorModeValue('gray.700', 'gray.300')} 
                  fontWeight="semibold"
                  mb={3}
                >
                  Training Script
                </FormLabel>
                
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
                    bg={useColorModeValue('white', 'gray.700')}
                    border="2px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{
                      borderColor: useColorModeValue('gray.300', 'gray.500')
                    }}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
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
                  colorScheme="blue"
                  size="md"
                  leftIcon={<Icon as={Save} />}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText={editingTemplate ? "Updating..." : "Creating..."}
                  w="full"
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
                
                <HStack spacing={3}>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        insuranceType: '',
                        difficulty: '',
                        script: ''
                      })
                      setEditingTemplate(null)
                    }}
                    flex={1}
                  >
                    Clear Fields
                  </Button>
                  
                  {editingTemplate && (
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      size="md"
                      onClick={() => {
                        setEditingTemplate(null)
                        setFormData({
                          title: '',
                          description: '',
                          insuranceType: '',
                          difficulty: '',
                          script: ''
                        })
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
            w="2px" 
            h="full" 
            bg={borderColor}
            _hover={{ bg: useColorModeValue('gray.400', 'gray.500'), w: "4px" }}
            transition="all 0.2s"
            cursor="col-resize"
            position="relative"
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="20px"
              h="40px"
              bg={useColorModeValue('gray.300', 'gray.600')}
              borderRadius="full"
              opacity={0}
              _hover={{ opacity: 1 }}
              transition="opacity 0.2s"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                w="3px"
                h="16px"
                bg={useColorModeValue('gray.500', 'gray.400')}
                borderRadius="full"
                mr="2px"
              />
              <Box
                w="3px"
                h="16px"
                bg={useColorModeValue('gray.500', 'gray.400')}
                borderRadius="full"
              />
            </Box>
          </Box>
        </PanelResizeHandle>

        {/* Right Panel - Template Management */}
        <Panel 
          defaultSize={60} 
          minSize={40}
        >
          <Box bg={cardBg} h="full" overflow="hidden" display="flex" flexDirection="column">
          {/* Right Panel Header */}
          <Flex p={4} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center" bg={cardBg}>
            <Box flex={1}>
              <HStack justify="space-between" align="center" mb={1}>
                <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                  Template Library
                </Heading>
              </HStack>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Manage and preview your training templates
              </Text>
            </Box>
          </Flex>
          
          {/* Template List Content */}
          <Box flex={1} overflowY="auto" p={4}>
            <VStack spacing={4} align="stretch">
              {isLoadingTemplates ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                  <Spinner size="lg" color="blue.500" />
                  <Text ml={3} color={useColorModeValue('gray.600', 'gray.400')}>
                    Loading templates...
                  </Text>
                </Box>
              ) : templates.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FileText} boxSize={12} color={useColorModeValue('gray.400', 'gray.500')} mb={4} />
                  <Text color={useColorModeValue('gray.500', 'gray.400')} fontSize="lg" mb={2}>
                    No templates yet
                  </Text>
                  <Text color={useColorModeValue('gray.400', 'gray.500')} fontSize="sm">
                    Create your first template using the form on the left
                  </Text>
                </Box>
              ) : (
                templates.map((template) => (
                  <Card 
                    key={template.id} 
                    bg={useColorModeValue('white', 'gray.700')}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{
                      borderColor: useColorModeValue('gray.300', 'gray.500'),
                      shadow: 'md'
                    }}
                    transition="all 0.2s"
                  >
                    <CardBody p={4}>
                      <Flex justify="space-between" align="flex-start" mb={3}>
                        <Box flex={1}>
                          <HStack justify="space-between" align="flex-start" mb={2}>
                            <Heading size="sm" color={useColorModeValue('gray.900', 'white')}>
                              {template.title}
                            </Heading>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<Icon as={MoreVertical} />}
                                variant="ghost"
                                size="sm"
                                aria-label="Template actions"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<Icon as={Edit2} />}
                                  onClick={() => handleEditTemplate(template)}
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem 
                                  icon={<Icon as={Copy} />}
                                  onClick={() => handleDuplicateTemplate(template)}
                                >
                                  Duplicate
                                </MenuItem>
                                <MenuItem 
                                  icon={<Icon as={Trash2} />}
                                  onClick={() => confirmDelete(template)}
                                  color="red.500"
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                          
                          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                            {template.description}
                          </Text>
                          
                          <HStack spacing={2} mb={3}>
                            <Badge 
                              colorScheme={getDifficultyColor(template.difficulty)} 
                              variant="subtle"
                              textTransform="capitalize"
                            >
                              {template.difficulty}
                            </Badge>
                            <Badge 
                              colorScheme="blue" 
                              variant="outline"
                              textTransform="capitalize"
                            >
                              {template.type}
                            </Badge>
                          </HStack>
                          
                          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="medium">
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
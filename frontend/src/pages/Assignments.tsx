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
  CardBody,
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
  Checkbox,
  CheckboxGroup,
  Stack,
  Avatar,
} from '@chakra-ui/react'
import { FileText, Save, Edit2, Trash2, Copy, MoreVertical, Eye } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'
import { Profile } from '../types/database'
import { useNavigate, useLocation } from 'react-router-dom'
import { GENERAL_LIFE_INSURANCE_RUBRIC } from '../config/rubricLibrary'

interface Assignment {
  id: number
  title: string
  description: string
  template: number // template ID
  rubric: number // rubric ID
  assigned: string // JSON string of user IDs
  due: string
  created_at: string
  status: 'not started' | 'in progress' | 'complete'
}

interface AssignmentFormData {
  title: string
  description: string
  templateId: string
  assignedUsers: string[]
  dueDate: string
}


// Assignment Card Component
interface AssignmentCardProps {
  assignment: Assignment
  users: Profile[]
  templates: Template[]
  onEdit: (assignment: Assignment) => void
  onDuplicate: (assignment: Assignment) => void
  onDelete: (assignment: Assignment) => void
  cardBg: string
  accentColor: string
}

function AssignmentCard({ 
  assignment, 
  users, 
  templates, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  cardBg, 
}: AssignmentCardProps) {
  const navigate = useNavigate()

  const getAssignedUsers = (assignment: Assignment): string[] => {
    try {
      return JSON.parse(assignment.assigned || '[]')
    } catch (error) {
      console.warn('Error parsing assigned users:', error)
      return []
    }
  }

  const handleViewPerformance = () => {
    // Navigate to analytics page with assignment filter
    navigate(`/analytics?assignment=${assignment.id}`)
  }

  const getTemplateName = (templateId: number) => {
    const template = templates.find(t => t.id === templateId)
    return template?.title || 'Unknown Template'
  }

  const assignedUserIds = getAssignedUsers(assignment)

  return (
    <Card 
      bg={cardBg}
      border="1px solid"
      borderColor={useColorModeValue('gray.100', 'gray.750')}
      borderRadius="xl"
      _hover={{
        borderColor: useColorModeValue('gray.200', 'gray.600'),
        transform: 'translateY(-1px)',
        boxShadow: useColorModeValue(
          '0 4px 12px rgba(0, 0, 0, 0.05)',
          '0 4px 12px rgba(0, 0, 0, 0.3)'
        )
      }}
      transition="all 0.2s"
    >
      <CardBody p={5}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="start">
            <Box flex={1}>
              <Heading 
                size="md" 
                mb={2}
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
              >
                {assignment.title}
              </Heading>
              
              {assignment.description && (
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                  {assignment.description}
                </Text>
              )}
              
              <HStack spacing={3} mb={4}>
                <Badge 
                  colorScheme="orange" 
                  variant="subtle"
                  textTransform="capitalize"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="500"
                >
                  {assignedUserIds.length} Users
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
                  {getTemplateName(assignment.template)}
                </Badge>
                {assignment.due && (
                  <Badge 
                    colorScheme="green" 
                    variant="outline"
                    textTransform="capitalize"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontWeight="500"
                  >
                    Due: {new Date(assignment.due).toLocaleDateString()}
                  </Badge>
                )}
              </HStack>
            </Box>
            
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<Icon as={MoreVertical} />}
                variant="ghost"
                size="sm"
                color={useColorModeValue('gray.500', 'gray.400')}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  color: useColorModeValue('gray.700', 'gray.200')
                }}
              />
              <MenuList
                bg={cardBg}
                border="1px solid"
                borderColor={useColorModeValue('gray.100', 'gray.750')}
                borderRadius="xl"
                boxShadow={useColorModeValue(
                  '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '0 4px 12px rgba(0, 0, 0, 0.4)'
                )}
              >
                <MenuItem
                  icon={<Icon as={Edit2} boxSize={4} />}
                  onClick={() => onEdit(assignment)}
                  _hover={{
                    bg: useColorModeValue('orange.50', 'orange.900/20')
                  }}
                >
                  Edit Assignment
                </MenuItem>
                <MenuItem
                  icon={<Icon as={Copy} boxSize={4} />}
                  onClick={() => onDuplicate(assignment)}
                  _hover={{
                    bg: useColorModeValue('green.50', 'green.900/20')
                  }}
                >
                  Duplicate
                </MenuItem>
                <MenuItem
                  icon={<Icon as={Trash2} boxSize={4} />}
                  onClick={() => onDelete(assignment)}
                  color="red.500"
                  _hover={{
                    bg: useColorModeValue('red.50', 'red.900/20')
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          {/* Action Buttons */}
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={Eye} />}
              size="sm"
              variant="outline"
              colorScheme="orange"
              onClick={handleViewPerformance}
              borderRadius="lg"
            >
              View Performance
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

function Assignments() {
  const { organization } = useProfile()
  const location = useLocation()
  
  // Load form data from localStorage or use defaults
  const loadFormData = (): AssignmentFormData => {
    try {
      const saved = localStorage.getItem('assignmentFormData')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error loading form data from localStorage:', error)
    }
    return {
      title: '',
      description: '',
      templateId: '',
      assignedUsers: [],
      dueDate: ''
    }
  }

  const [formData, setFormData] = useState<AssignmentFormData>(loadFormData)
  
  // Handle prefilled template from navigation state
  React.useEffect(() => {
    const state = location.state as any
    if (state?.prefillTemplate) {
      const prefill = state.prefillTemplate
      setFormData(prev => ({
        ...prev,
        title: `${prefill.title} Assignment`,
        description: prefill.description,
        templateId: prefill.id
      }))
      // Clear the navigation state
      window.history.replaceState({}, document.title)
    }
  }, [location])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  
  // Real data from Supabase
  const [templates, setTemplates] = useState<Template[]>([])
  
  // Real users data from organization
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)
  
  // Load editing state from localStorage
  const loadEditingAssignment = (): Assignment | null => {
    try {
      const saved = localStorage.getItem('editingAssignment')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error loading editing assignment from localStorage:', error)
    }
    return null
  }

  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(loadEditingAssignment)
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const toast = useToast()

  // Save form data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('assignmentFormData', JSON.stringify(formData))
  }, [formData])

  // Save editing assignment to localStorage whenever it changes
  React.useEffect(() => {
    if (editingAssignment) {
      localStorage.setItem('editingAssignment', JSON.stringify(editingAssignment))
    } else {
      localStorage.removeItem('editingAssignment')
    }
  }, [editingAssignment])

  // Fetch all data when component mounts
  React.useEffect(() => {
    if (organization?.id) {
      fetchAssignments()
      fetchTemplates()
      fetchUsers()
    }
  }, [organization?.id])

  const fetchAssignments = async () => {
    try {
      setIsLoadingAssignments(true)
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching assignments:', error)
        toast({
          title: 'Error loading assignments',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      setAssignments(data || [])
      // Set first assignment as selected if none selected
      if (data && data.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      // Fetch both global templates (org IS NULL) and organization-specific templates
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`org.is.null,org.eq.${organization?.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching templates:', error)
        return
      }

      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('org', organization?.id)
        .order('display_name', { ascending: true })

      if (error) {
        console.error('Error fetching users:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.templateId || formData.assignedUsers.length === 0) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields and assign to at least one user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        template: parseInt(formData.templateId),
        rubric: parseInt(GENERAL_LIFE_INSURANCE_RUBRIC.id), // Always use default rubric
        assigned: JSON.stringify(formData.assignedUsers), // Convert array to JSON string
        due: formData.dueDate || null
      }

      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update(assignmentData)
          .eq('id', editingAssignment.id)

        if (error) throw error

        toast({
          title: 'Assignment updated!',
          description: `${formData.title} has been successfully updated`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        setEditingAssignment(null)
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('assignments')
          .insert([assignmentData])

        if (error) throw error

        toast({
          title: 'Assignment created!',
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
        templateId: '',
        assignedUsers: [],
        dueDate: ''
      }
      setFormData(emptyForm)
      localStorage.removeItem('assignmentFormData')
      
      // Refresh assignments list
      fetchAssignments()

    } catch (error) {
      console.error(`Error ${editingAssignment ? 'updating' : 'creating'} assignment:`, error)
      toast({
        title: `Error ${editingAssignment ? 'updating' : 'creating'} assignment`,
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAssignment = (assignment: Assignment) => {
    let assignedUsers: string[] = []
    try {
      assignedUsers = JSON.parse(assignment.assigned || '[]')
    } catch (error) {
      console.warn('Error parsing assigned users:', error)
    }

    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      templateId: assignment.template.toString(),
      assignedUsers: assignedUsers,
      dueDate: assignment.due || ''
    })
    setEditingAssignment(assignment)
  }

  const handleDuplicateAssignment = (assignment: Assignment) => {
    let assignedUsers: string[] = []
    try {
      assignedUsers = JSON.parse(assignment.assigned || '[]')
    } catch (error) {
      console.warn('Error parsing assigned users:', error)
    }

    setFormData({
      title: `${assignment.title} (Copy)`,
      description: assignment.description || '',
      templateId: assignment.template.toString(),
      assignedUsers: assignedUsers,
      dueDate: assignment.due || ''
    })
    setEditingAssignment(null)
  }

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentToDelete.id)

      if (error) throw error

      toast({
        title: 'Assignment deleted',
        description: `${assignmentToDelete.title} has been deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      fetchAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast({
        title: 'Error deleting assignment',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setAssignmentToDelete(null)
      onDeleteClose()
    }
  }

  const confirmDelete = (assignment: Assignment) => {
    setAssignmentToDelete(assignment)
    onDeleteOpen()
  }

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)')
  const accentColor = useColorModeValue('#f26f25', '#ff7d31')

  return (
    <Box 
      bgGradient={useColorModeValue('linear(to-br, orange.50, white, orange.50)', 'linear(to-br, gray.900, gray.800)')}
      h="calc(100vh - 88px)" 
      overflow="hidden"
    >
      <PanelGroup direction="horizontal">
        {/* Left Panel - Assignment Creation */}
        <Panel 
          defaultSize={50} 
          minSize={30}
          maxSize={60}
        >
          <Box 
            bg={cardBg} 
            h="full"
            overflow="hidden" 
            display="flex" 
            flexDirection="column"
            backdropFilter="blur(20px)"
            shadow="xl"
          >
          {/* Sidebar Header */}
          <Box 
            px={6}
            py={4}
            borderBottom="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                size="md" 
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
              >
                Assignment Creation
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.600', 'gray.400')}
              >
                Create and manage training assignments for your team
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
                      Assignment Title
                    </FormLabel>
                    <Input
                      placeholder="e.g., Cold Calling Practice Session"
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

                  <FormControl>
                    <FormLabel 
                      fontSize="sm" 
                      color={useColorModeValue('gray.700', 'gray.300')} 
                      fontWeight="semibold"
                      mb={2}
                    >
                      Description
                    </FormLabel>
                    <Textarea
                      placeholder="Describe the assignment objectives and expectations..."
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

                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel 
                        fontSize="sm" 
                        color={useColorModeValue('gray.700', 'gray.300')} 
                        fontWeight="semibold"
                        mb={2}
                      >
                        Template
                      </FormLabel>
                      <Select
                        placeholder="Select template"
                        value={formData.templateId}
                        onChange={(e) => handleInputChange('templateId', e.target.value)}
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
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title} ({template.difficulty})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel 
                      fontSize="sm" 
                      color={useColorModeValue('gray.700', 'gray.300')} 
                      fontWeight="semibold"
                      mb={2}
                    >
                      Due Date
                    </FormLabel>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
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
                </VStack>
              </Box>

              {/* User Assignment */}
              <Box>
                <Heading 
                  size="md" 
                  mb={4}
                  color={useColorModeValue('gray.900', 'white')}
                  fontWeight="600"
                  letterSpacing="-0.01em"
                >
                  Assign Users
                </Heading>
                <Card 
                  bg={cardBg}
                  border="1px solid"
                  borderColor={useColorModeValue('gray.100', 'gray.750')}
                  borderRadius="xl"
                >
                  <CardBody p={4}>
                    {isLoadingUsers ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <Spinner size="sm" />
                        <Text ml={2} fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                          Loading users...
                        </Text>
                      </Box>
                    ) : users.length === 0 ? (
                      <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" py={4}>
                        No users found in your organization
                      </Text>
                    ) : (
                      <CheckboxGroup 
                        value={formData.assignedUsers} 
                        onChange={(values) => handleInputChange('assignedUsers', values)}
                      >
                        <Stack spacing={3}>
                          {users.map((user) => (
                            <Checkbox key={user.id} value={user.id}>
                              <HStack spacing={3}>
                                <Avatar name={user.display_name || user.email} size="sm" />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="500">
                                    {user.display_name || 'Unnamed User'}
                                  </Text>
                                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                    {user.email}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Checkbox>
                          ))}
                        </Stack>
                      </CheckboxGroup>
                    )}
                  </CardBody>
                </Card>
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
                  loadingText={editingAssignment ? "Updating..." : "Creating..."}
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
                  {editingAssignment ? "Update Assignment" : "Create Assignment"}
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
                        templateId: '',
                        assignedUsers: [],
                        dueDate: ''
                      }
                      setFormData(emptyForm)
                      setEditingAssignment(null)
                      localStorage.removeItem('assignmentFormData')
                      localStorage.removeItem('editingAssignment')
                    }}
                    flex={1}
                  >
                    Clear Fields
                  </Button>
                  
                  {editingAssignment && (
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
                        setEditingAssignment(null)
                        const emptyForm = {
                          title: '',
                          description: '',
                          templateId: '',
                          assignedUsers: [],
                          dueDate: ''
                        }
                        setFormData(emptyForm)
                        localStorage.removeItem('assignmentFormData')
                        localStorage.removeItem('editingAssignment')
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

        {/* Right Panel - Assignment Management & Performance */}
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
            backdropFilter="blur(20px)"
            shadow="xl"
          >
          {/* Right Panel Header */}
          <Box 
            px={6}
            py={4}
            borderBottom="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                size="md" 
                color={useColorModeValue('gray.900', 'white')}
                fontWeight="600"
              >
                Assignment Management
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.600', 'gray.400')}
              >
                View assignments and track user performance
              </Text>
            </VStack>
          </Box>
          
          {/* Assignment List */}
          <Box flex={1} overflowY="auto" p={6}>
            {isLoadingAssignments ? (
              <VStack spacing={4} justify="center" py={8}>
                <Spinner size="lg" color={accentColor} thickness="4px" />
                <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                  Loading assignments...
                </Text>
              </VStack>
            ) : assignments.length === 0 ? (
              <VStack spacing={4} justify="center" align="center" py={8} color={useColorModeValue('gray.400', 'gray.500')}>
                <Icon as={FileText} boxSize={12} />
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="lg" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')}>
                    No assignments yet
                  </Text>
                  <Text fontSize="sm">
                    Create your first assignment using the form on the left
                  </Text>
                </VStack>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch">
                {assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    users={users}
                    templates={templates}
                    onEdit={handleEditAssignment}
                    onDuplicate={handleDuplicateAssignment}
                    onDelete={confirmDelete}
                    cardBg={cardBg}
                    accentColor={accentColor}
                  />
                ))}
              </VStack>
            )}
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
              Delete Assignment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{assignmentToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAssignment} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default Assignments
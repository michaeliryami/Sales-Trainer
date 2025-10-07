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
import { FileText, Save, Edit2, Trash2, Copy, MoreVertical, Eye, Download, FileDown } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'
import { Profile } from '../types/database'

interface Assignment {
  id: number
  title: string
  description: string
  template: number // template ID
  rubric: number // rubric ID
  assigned: string // JSON string of user IDs
  due: string
  created_at: string
}

interface Rubric {
  id: number
  title: string
  grading: any[]
  created_at: string
}

interface AssignmentFormData {
  title: string
  description: string
  templateId: string
  rubricId: string
  assignedUsers: string[]
  dueDate: string
}


// Assignment Card Component
interface AssignmentCardProps {
  assignment: Assignment
  users: Profile[]
  templates: Template[]
  rubrics: Rubric[]
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
  rubrics, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  cardBg, 
}: AssignmentCardProps) {
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingGrades, setEditingGrades] = useState<{[userId: string]: number}>({})

  const getAssignedUsers = (assignment: Assignment): string[] => {
    try {
      return JSON.parse(assignment.assigned || '[]')
    } catch (error) {
      console.warn('Error parsing assigned users:', error)
      return []
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.display_name || user?.email || 'Unknown User'
  }

  const getTemplateName = (templateId: number) => {
    const template = templates.find(t => t.id === templateId)
    return template?.title || 'Unknown Template'
  }

  const getRubricName = (rubricId: number) => {
    const rubric = rubrics.find(r => r.id === rubricId)
    return rubric?.title || 'Unknown Rubric'
  }

  // Mock performance data for each assigned user
  const getUserPerformance = (userId: string) => {
    const performances = [
      { status: 'completed', score: 85, completedAt: '2024-01-10' },
      { status: 'in_progress', score: null, completedAt: null },
      { status: 'completed', score: 92, completedAt: '2024-01-08' },
      { status: 'overdue', score: null, completedAt: null },
      { status: 'not_started', score: null, completedAt: null }
    ]
    // Use userId hash to get consistent mock data
    const index = parseInt(userId.slice(-1)) % performances.length
    return performances[index]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green'
      case 'in_progress': return 'orange'
      case 'overdue': return 'red'
      case 'not_started': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in_progress': return 'In Progress'
      case 'overdue': return 'Overdue'
      case 'not_started': return 'Not Started'
      default: return 'Unknown'
    }
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
                  colorScheme="blue" 
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
                  colorScheme="purple" 
                  variant="outline"
                  textTransform="capitalize"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="500"
                >
                  {getTemplateName(assignment.template)}
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
                  {getRubricName(assignment.rubric)}
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
                    bg: useColorModeValue('blue.50', 'blue.900/20')
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
              colorScheme="blue"
              onClick={() => setIsViewOpen(!isViewOpen)}
              borderRadius="lg"
            >
              {isViewOpen ? 'Hide' : 'View'} Performance
            </Button>
          </HStack>

          {/* User Performance Cards (Collapsible) */}
          {isViewOpen && (
            <VStack spacing={3} align="stretch" pt={2}>
              <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')}>
                User Performance ({assignedUserIds.length} assigned)
              </Text>
              
              {assignedUserIds.map((userId) => {
                const performance = getUserPerformance(userId)
                const currentGrade = editingGrades[userId] ?? performance.score ?? 0
                
                return (
                  <Card 
                    key={userId}
                    bg={useColorModeValue('gray.50', 'gray.800')}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.100', 'gray.700')}
                    borderRadius="lg"
                    size="sm"
                  >
                    <CardBody p={4}>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Avatar name={getUserName(userId)} size="sm" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                              {getUserName(userId)}
                            </Text>
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                              {performance.completedAt ? `Completed: ${performance.completedAt}` : 'Not completed'}
                            </Text>
                          </VStack>
                        </HStack>
                        
                        <VStack spacing={3} align="end">
                          <HStack spacing={3}>
                            <Badge 
                              colorScheme={getStatusColor(performance.status)}
                              variant="subtle"
                              textTransform="capitalize"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontWeight="500"
                            >
                              {getStatusLabel(performance.status)}
                            </Badge>
                            
                            {/* Editable Grade */}
                            <HStack spacing={2}>
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                Grade:
                              </Text>
                              <Input
                                size="xs"
                                w="60px"
                                type="number"
                                min="0"
                                max="100"
                                value={currentGrade}
                                onChange={(e) => setEditingGrades(prev => ({
                                  ...prev,
                                  [userId]: parseInt(e.target.value) || 0
                                }))}
                                bg={cardBg}
                                border="1px solid"
                                borderColor={useColorModeValue('gray.200', 'gray.600')}
                                borderRadius="md"
                                fontSize="xs"
                              />
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                %
                              </Text>
                            </HStack>
                          </HStack>
                          
                          <HStack spacing={2}>
                            <Button
                              leftIcon={<Icon as={Download} />}
                              size="xs"
                              variant="outline"
                              colorScheme="blue"
                              borderRadius="lg"
                            >
                              Download Report
                            </Button>
                            <Button
                              leftIcon={<Icon as={FileDown} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              borderRadius="lg"
                            >
                              Transcript
                            </Button>
                          </HStack>
                        </VStack>
                      </Flex>
                    </CardBody>
                  </Card>
                )
              })}
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}

function Assignments() {
  const { organization } = useProfile()
  
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
      rubricId: '',
      assignedUsers: [],
      dueDate: ''
    }
  }

  const [formData, setFormData] = useState<AssignmentFormData>(loadFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  
  // Real data from Supabase
  const [templates, setTemplates] = useState<Template[]>([])
  
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  
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
  const borderColor = useColorModeValue('gray.100', 'gray.750')

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
      fetchRubrics()
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
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('org', organization?.id)
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

  const fetchRubrics = async () => {
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching rubrics:', error)
        return
      }

      setRubrics(data || [])
    } catch (error) {
      console.error('Error fetching rubrics:', error)
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
    if (!formData.title || !formData.templateId || !formData.rubricId || formData.assignedUsers.length === 0) {
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
        rubric: parseInt(formData.rubricId),
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
        rubricId: '',
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
      rubricId: assignment.rubric.toString(),
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
      rubricId: assignment.rubric.toString(),
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

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const headerBg = useColorModeValue('gray.50/80', 'gray.800/80')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
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
                Assignment Creation
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
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
                            {template.title}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel 
                        fontSize="sm" 
                        color={useColorModeValue('gray.700', 'gray.300')} 
                        fontWeight="semibold"
                        mb={2}
                      >
                        Rubric
                      </FormLabel>
                      <Select
                        placeholder="Select rubric"
                        value={formData.rubricId}
                        onChange={(e) => handleInputChange('rubricId', e.target.value)}
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
                        {rubrics.map((rubric) => (
                          <option key={rubric.id} value={rubric.id}>
                            {rubric.title}
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
                  bg="linear-gradient(135deg, #3b82f6, #2563eb)"
                  color="white"
                  size="md"
                  leftIcon={<Icon as={Save} boxSize="4" />}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText={editingAssignment ? "Updating..." : "Creating..."}
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
                        rubricId: '',
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
                          rubricId: '',
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
                Assignment Management
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
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
                    rubrics={rubrics}
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
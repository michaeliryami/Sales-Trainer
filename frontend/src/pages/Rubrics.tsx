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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { FileText, Plus, Save, Edit2, Trash2, Copy, MoreVertical, X } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { supabase } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'

interface RubricItem {
  id: string
  title: string
  description: string
  maxPoints: number
}

interface Rubric {
  id: number
  title: string
  grading: RubricItem[]
  created_at: string
}

interface RubricFormData {
  title: string
  items: RubricItem[]
}

function Rubrics() {
  const { organization } = useProfile()
  
  // Load form data from localStorage or use defaults
  const loadFormData = (): RubricFormData => {
    try {
      const saved = localStorage.getItem('rubricFormData')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error loading form data from localStorage:', error)
    }
    return {
      title: '',
      items: []
    }
  }

  const [formData, setFormData] = useState<RubricFormData>(loadFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [isLoadingRubrics, setIsLoadingRubrics] = useState(true)
  
  // Load editing state from localStorage
  const loadEditingRubric = (): Rubric | null => {
    try {
      const saved = localStorage.getItem('editingRubric')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error loading editing rubric from localStorage:', error)
    }
    return null
  }

  const [editingRubric, setEditingRubric] = useState<Rubric | null>(loadEditingRubric)
  const [rubricToDelete, setRubricToDelete] = useState<Rubric | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.750')

  // Save form data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('rubricFormData', JSON.stringify(formData))
  }, [formData])

  // Save editing rubric to localStorage whenever it changes
  React.useEffect(() => {
    if (editingRubric) {
      localStorage.setItem('editingRubric', JSON.stringify(editingRubric))
    } else {
      localStorage.removeItem('editingRubric')
    }
  }, [editingRubric])

  // Fetch rubrics when org is available
  React.useEffect(() => {
    fetchRubrics()
  }, [organization?.id])

  const fetchRubrics = async () => {
    try {
      setIsLoadingRubrics(true)
      const query = supabase
        .from('rubrics')
        .select('*')
        .order('created_at', { ascending: false })

      // Only show rubrics for this organization
      if (organization?.id) {
        // Add org filter when you implement it in Supabase
        // query.eq('org', organization.id)
      } else {
        // If org is not ready yet, keep list empty
        setRubrics([])
        setIsLoadingRubrics(false)
        return
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching rubrics:', error)
        toast({
          title: 'Error loading rubrics',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      setRubrics(data || [])
    } catch (error) {
      console.error('Error fetching rubrics:', error)
    } finally {
      setIsLoadingRubrics(false)
    }
  }

  const handleInputChange = (field: keyof RubricFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addRubricItem = () => {
    const newItem: RubricItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      maxPoints: 100
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateRubricItem = (id: string, field: keyof RubricItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeRubricItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const getTotalPoints = () => {
    return formData.items.reduce((total, item) => total + (item.maxPoints || 0), 0)
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || formData.items.length === 0) {
      toast({
        title: 'Missing fields',
        description: 'Please add a title and at least one rubric item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Validate all items have titles
    const invalidItems = formData.items.filter(item => !item.title.trim())
    if (invalidItems.length > 0) {
      toast({
        title: 'Incomplete items',
        description: 'Please add titles to all rubric items',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const rubricData = {
        title: formData.title,
        grading: formData.items
      }

      if (editingRubric) {
        // Update existing rubric
        const { error } = await supabase
          .from('rubrics')
          .update(rubricData)
          .eq('id', editingRubric.id)

        if (error) throw error

        toast({
          title: 'Rubric updated!',
          description: `${formData.title} has been successfully updated`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        setEditingRubric(null)
      } else {
        // Create new rubric
        const { error } = await supabase
          .from('rubrics')
          .insert([rubricData])

        if (error) throw error

        toast({
          title: 'Rubric created!',
          description: `${formData.title} has been successfully created`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }

      // Reset form and clear localStorage
      const emptyForm = {
        title: '',
        items: []
      }
      setFormData(emptyForm)
      localStorage.removeItem('rubricFormData')
      
      // Refresh rubrics list
      fetchRubrics()

    } catch (error) {
      console.error(`Error ${editingRubric ? 'updating' : 'creating'} rubric:`, error)
      toast({
        title: `Error ${editingRubric ? 'updating' : 'creating'} rubric`,
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRubric = async (rubric: Rubric) => {
    setFormData({
      title: rubric.title,
      items: rubric.grading || []
    })
    setEditingRubric(rubric)
  }

  const handleDuplicateRubric = (rubric: Rubric) => {
    setFormData({
      title: `${rubric.title} (Copy)`,
      items: rubric.grading || []
    })
    setEditingRubric(null)
  }

  const handleDeleteRubric = async () => {
    if (!rubricToDelete) return

    try {
      const { error } = await supabase
        .from('rubrics')
        .delete()
        .eq('id', rubricToDelete.id)

      if (error) throw error

      toast({
        title: 'Rubric deleted',
        description: `${rubricToDelete.title} has been deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      fetchRubrics()
    } catch (error) {
      console.error('Error deleting rubric:', error)
      toast({
        title: 'Error deleting rubric',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setRubricToDelete(null)
      onDeleteClose()
    }
  }

  const confirmDelete = (rubric: Rubric) => {
    setRubricToDelete(rubric)
    onDeleteOpen()
  }

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const headerBg = useColorModeValue('gray.50/80', 'gray.800/80')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Rubric Creation */}
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
                Rubric Creation
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
              >
                Create evaluation rubrics with custom grading criteria
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
                      Rubric Title
                    </FormLabel>
                    <Input
                      placeholder="e.g., Sales Call Quality Assessment"
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
                </VStack>
              </Box>

              {/* Rubric Items */}
              <Box>
                <HStack justify="space-between" align="center" mb={4}>
                  <Heading 
                    size="md" 
                    color={useColorModeValue('gray.900', 'white')}
                    fontWeight="600"
                    letterSpacing="-0.01em"
                  >
                    Grading Criteria
                  </Heading>
                  <Button
                    size="sm"
                    leftIcon={<Icon as={Plus} boxSize="4" />}
                    onClick={addRubricItem}
                    colorScheme="blue"
                    borderRadius="xl"
                    fontWeight="500"
                  >
                    Add Item
                  </Button>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {formData.items.map((item, index) => (
                    <Card 
                      key={item.id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.100', 'gray.750')}
                      borderRadius="xl"
                    >
                      <CardBody p={4}>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')}>
                              Item {index + 1}
                            </Text>
                            <IconButton
                              aria-label="Remove item"
                              icon={<Icon as={X} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeRubricItem(item.id)}
                            />
                          </HStack>
                          
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                              Title
                            </FormLabel>
                            <Input
                              placeholder="e.g., Opening & Introduction"
                              value={item.title}
                              onChange={(e) => updateRubricItem(item.id, 'title', e.target.value)}
                              size="sm"
                              borderRadius="lg"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                              Description
                            </FormLabel>
                            <Textarea
                              placeholder="Describe what this criteria evaluates..."
                              value={item.description}
                              onChange={(e) => updateRubricItem(item.id, 'description', e.target.value)}
                              size="sm"
                              rows={2}
                              borderRadius="lg"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                              Max Points
                            </FormLabel>
                            <NumberInput
                              value={item.maxPoints}
                              onChange={(_, value) => updateRubricItem(item.id, 'maxPoints', value || 0)}
                              min={1}
                              max={100}
                              size="sm"
                            >
                              <NumberInputField borderRadius="lg" />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}

                  {formData.items.length === 0 && (
                    <Card 
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      border="2px dashed"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      borderRadius="xl"
                    >
                      <CardBody p={8} textAlign="center">
                        <VStack spacing={2}>
                          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                            No grading criteria added yet
                          </Text>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={Plus} boxSize="4" />}
                            onClick={addRubricItem}
                            colorScheme="blue"
                            variant="outline"
                            borderRadius="xl"
                          >
                            Add First Item
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>

                {formData.items.length > 0 && (
                  <Box mt={4} p={4} bg={useColorModeValue('blue.50', 'blue.900/20')} borderRadius="xl">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color={useColorModeValue('blue.700', 'blue.300')}>
                        Total Points:
                      </Text>
                      <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
                        {getTotalPoints()} points
                      </Badge>
                    </HStack>
                  </Box>
                )}
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
                  loadingText={editingRubric ? "Updating..." : "Creating..."}
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
                  {editingRubric ? "Update Rubric" : "Create Rubric"}
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
                        items: []
                      }
                      setFormData(emptyForm)
                      setEditingRubric(null)
                      localStorage.removeItem('rubricFormData')
                      localStorage.removeItem('editingRubric')
                    }}
                    flex={1}
                  >
                    Clear Fields
                  </Button>
                  
                  {editingRubric && (
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
                        setEditingRubric(null)
                        const emptyForm = {
                          title: '',
                          items: []
                        }
                        setFormData(emptyForm)
                        localStorage.removeItem('rubricFormData')
                        localStorage.removeItem('editingRubric')
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

        {/* Right Panel - Rubric Management */}
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
                Rubric Library
              </Heading>
              <Text 
                fontSize="sm" 
                color={useColorModeValue('gray.500', 'gray.400')}
                fontWeight="400"
              >
                Manage and preview your evaluation rubrics
              </Text>
            </VStack>
          </Box>
          
          {/* Rubric List Content */}
          <Box flex={1} overflowY="auto" p={6}>
            <VStack spacing={4} align="stretch">
              {isLoadingRubrics ? (
                <VStack spacing={4} justify="center" py={12}>
                  <Spinner size="xl" color={accentColor} thickness="4px" />
                  <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                    Loading rubrics...
                  </Text>
                </VStack>
              ) : rubrics.length === 0 ? (
                <VStack spacing={4} justify="center" align="center" py={12} h="full" color={useColorModeValue('gray.400', 'gray.500')}>
                  <Flex
                    w="16"
                    h="16"
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FileText} boxSize={8} />
                  </Flex>
                  <VStack spacing={1} textAlign="center">
                    <Text fontSize="lg" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')}>
                      No rubrics yet
                    </Text>
                    <Text fontSize="sm">
                      Create your first rubric using the form on the left
                    </Text>
                  </VStack>
                </VStack>
              ) : (
                rubrics.map((rubric) => (
                  <Card 
                    key={rubric.id} 
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
                              {rubric.title}
                            </Heading>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<Icon as={MoreVertical} />}
                                variant="ghost"
                                size="sm"
                                aria-label="Rubric actions"
                                borderRadius="lg"
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                              />
                              <MenuList borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
                                <MenuItem 
                                  icon={<Icon as={Edit2} />}
                                  onClick={() => handleEditRubric(rubric)}
                                  borderRadius="lg"
                                  _hover={{ bg: useColorModeValue('blue.50', 'blue.900/30') }}
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem 
                                  icon={<Icon as={Copy} />}
                                  onClick={() => handleDuplicateRubric(rubric)}
                                  borderRadius="lg"
                                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                >
                                  Duplicate
                                </MenuItem>
                                <MenuItem 
                                  icon={<Icon as={Trash2} />}
                                  onClick={() => confirmDelete(rubric)}
                                  color="red.500"
                                  borderRadius="lg"
                                  _hover={{ bg: useColorModeValue('red.50', 'red.900/30') }}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                          
                          <VStack align="start" spacing={3}>
                            <HStack spacing={3}>
                              <Badge 
                                colorScheme="blue" 
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontWeight="500"
                              >
                                {rubric.grading?.length || 0} Items
                              </Badge>
                              <Badge 
                                colorScheme="green" 
                                variant="outline"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontWeight="500"
                              >
                                {rubric.grading?.reduce((total, item) => total + (item.maxPoints || 0), 0) || 0} Points
                              </Badge>
                            </HStack>

                            {rubric.grading && rubric.grading.length > 0 && (
                              <VStack align="start" spacing={2} w="full">
                                <Text fontSize="xs" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')}>
                                  Criteria:
                                </Text>
                                {rubric.grading.slice(0, 3).map((item, index) => (
                                  <HStack key={index} justify="space-between" w="full">
                                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                      {item.title}
                                    </Text>
                                    <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')}>
                                      {item.maxPoints}pts
                                    </Text>
                                  </HStack>
                                ))}
                                {rubric.grading.length > 3 && (
                                  <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')}>
                                    +{rubric.grading.length - 3} more items
                                  </Text>
                                )}
                              </VStack>
                            )}
                            
                            <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')} fontWeight="500">
                              Created {new Date(rubric.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Text>
                          </VStack>
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
              Delete Rubric
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{rubricToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteRubric} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default Rubrics

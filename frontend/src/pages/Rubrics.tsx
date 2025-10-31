import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  useToast,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Flex
} from '@chakra-ui/react'
import { PlusCircle, BookOpen, Trash2, Edit2, Star } from 'lucide-react'
import { ALL_BUILT_IN_RUBRICS, BuiltInRubric, RubricCategory } from '../config/rubricLibrary'
import { supabase } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'

interface CustomRubric {
  id: number
  title: string
  description: string
  categories: RubricCategory[]
  org_id: string
  created_by: string
  created_at: string
}

function Rubrics() {
  const { organization, profile, userRole } = useProfile()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [customRubrics, setCustomRubrics] = useState<CustomRubric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRubric, setSelectedRubric] = useState<BuiltInRubric | CustomRubric | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state for creating new rubric
  const [rubricTitle, setRubricTitle] = useState('')
  const [rubricDescription, setRubricDescription] = useState('')
  const [categories, setCategories] = useState<RubricCategory[]>([
    { name: '', description: '', weight: 25, maxScore: 10 }
  ])

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  // Only allow admins
  useEffect(() => {
    if (userRole !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can manage rubrics.',
        status: 'error',
        duration: 3000
      })
    }
  }, [userRole, toast])

  useEffect(() => {
    if (organization?.id) {
      fetchCustomRubrics()
    }
  }, [organization])

  const fetchCustomRubrics = async () => {
    if (!organization?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomRubrics(data || [])
    } catch (error) {
      console.error('Error fetching custom rubrics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load custom rubrics',
        status: 'error',
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRubric = async () => {
    if (!organization?.id || !profile?.id) return

    // Validation
    if (!rubricTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a rubric title',
        status: 'warning',
        duration: 3000
      })
      return
    }

    const validCategories = categories.filter(c => c.name.trim() && c.description.trim())
    if (validCategories.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one category',
        status: 'warning',
        duration: 3000
      })
      return
    }

    // Check that weights add up to 100
    const totalWeight = validCategories.reduce((sum, c) => sum + c.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.1) {
      toast({
        title: 'Validation Error',
        description: `Category weights must add up to 100% (currently ${totalWeight}%)`,
        status: 'warning',
        duration: 3000
      })
      return
    }

    setIsCreating(true)
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .insert({
          title: rubricTitle,
          description: rubricDescription,
          categories: validCategories,
          org_id: organization.id,
          created_by: profile.id
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Rubric Created',
        description: `"${rubricTitle}" has been created successfully`,
        status: 'success',
        duration: 3000
      })

      // Reset form
      setRubricTitle('')
      setRubricDescription('')
      setCategories([{ name: '', description: '', weight: 25, maxScore: 10 }])
      onClose()
      fetchCustomRubrics()
    } catch (error) {
      console.error('Error creating rubric:', error)
      toast({
        title: 'Error',
        description: 'Failed to create rubric',
        status: 'error',
        duration: 3000
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteRubric = async (rubricId: number) => {
    if (!confirm('Are you sure you want to delete this rubric?')) return

    try {
      const { error } = await supabase
        .from('rubrics')
        .delete()
        .eq('id', rubricId)

      if (error) throw error

      toast({
        title: 'Rubric Deleted',
        status: 'success',
        duration: 3000
      })
      fetchCustomRubrics()
    } catch (error) {
      console.error('Error deleting rubric:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete rubric',
        status: 'error',
        duration: 3000
      })
    }
  }

  const addCategory = () => {
    setCategories([...categories, { name: '', description: '', weight: 10, maxScore: 10 }])
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const updateCategory = (index: number, field: keyof RubricCategory, value: any) => {
    const updated = [...categories]
    updated[index] = { ...updated[index], [field]: value }
    setCategories(updated)
  }

  const isBuiltInRubric = (rubric: any): rubric is BuiltInRubric => {
    return 'isBuiltIn' in rubric && rubric.isBuiltIn === true
  }

  const RubricCard = ({ rubric, isCustom = false }: { rubric: BuiltInRubric | CustomRubric, isCustom?: boolean }) => (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl'
      }}
      transition="all 0.3s ease"
      cursor="pointer"
      onClick={() => setSelectedRubric(rubric)}
    >
      <CardBody p={6}>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" width="100%">
            <HStack spacing={3}>
              <Icon
                as={isCustom ? Edit2 : Star}
                color={accentColor}
                boxSize={5}
              />
              <Heading size="md">{rubric.title}</Heading>
            </HStack>
            {!isCustom && (
              <Badge colorScheme="purple" borderRadius="full" px={3}>
                Built-In
              </Badge>
            )}
          </HStack>

          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
            {rubric.description}
          </Text>

          <Divider />

          <SimpleGrid columns={2} spacing={4} width="100%">
            <Stat>
              <StatLabel fontSize="xs">Categories</StatLabel>
              <StatNumber fontSize="2xl">{rubric.categories.length}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize="xs">Total Weight</StatLabel>
              <StatNumber fontSize="2xl">
                {rubric.categories.reduce((sum, c) => sum + c.weight, 0)}%
              </StatNumber>
            </Stat>
          </SimpleGrid>

          {isCustom && (
            <HStack spacing={2} width="100%">
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                leftIcon={<Icon as={Trash2} />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteRubric((rubric as CustomRubric).id)
                }}
              >
                Delete
              </Button>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )

  if (userRole !== 'admin') {
    return (
      <Box minH="100vh" bg={bg} p={8}>
        <VStack spacing={4}>
          <Heading>Access Denied</Heading>
          <Text>Only administrators can access this page.</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg={bg} p={8}>
      <VStack spacing={8} align="stretch" maxW="1400px" mx="auto">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg">Rubric Management</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Manage evaluation rubrics for your training sessions
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={PlusCircle} />}
            colorScheme="blue"
            size="lg"
            onClick={onOpen}
            borderRadius="xl"
          >
            Create Rubric
          </Button>
        </HStack>

        {/* Built-In Rubrics */}
        <Box>
          <HStack mb={4} spacing={3}>
            <Icon as={BookOpen} boxSize={5} color={accentColor} />
            <Heading size="md">Built-In Rubrics</Heading>
            <Badge colorScheme="purple" borderRadius="full">
              {ALL_BUILT_IN_RUBRICS.length}
            </Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {ALL_BUILT_IN_RUBRICS.map((rubric) => (
              <RubricCard key={rubric.id} rubric={rubric} isCustom={false} />
            ))}
          </SimpleGrid>
        </Box>

        {/* Custom Rubrics */}
        <Box>
          <HStack mb={4} spacing={3}>
            <Icon as={Edit2} boxSize={5} color={accentColor} />
            <Heading size="md">Custom Rubrics</Heading>
            <Badge colorScheme="blue" borderRadius="full">
              {customRubrics.length}
            </Badge>
          </HStack>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : customRubrics.length === 0 ? (
            <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={8}>
              <VStack spacing={4}>
                <Icon as={Edit2} boxSize={12} color={useColorModeValue('gray.400', 'gray.600')} />
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  No custom rubrics yet. Create one to get started!
                </Text>
              </VStack>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {customRubrics.map((rubric) => (
                <RubricCard key={rubric.id} rubric={rubric} isCustom={true} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      {/* Create Rubric Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Rubric</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Rubric Title</FormLabel>
                <Input
                  value={rubricTitle}
                  onChange={(e) => setRubricTitle(e.target.value)}
                  placeholder="e.g., Advanced Sales Evaluation"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={rubricDescription}
                  onChange={(e) => setRubricDescription(e.target.value)}
                  placeholder="Brief description of this rubric's purpose"
                  rows={3}
                />
              </FormControl>

              <Divider />

              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="sm">Categories</Heading>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    Total Weight: {categories.reduce((sum, c) => sum + c.weight, 0)}%
                  </Text>
                </HStack>

                {categories.map((category, index) => (
                  <Card key={index} bg={cardBg} border="1px solid" borderColor={borderColor} p={4}>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="xs">Category {index + 1}</Heading>
                        {categories.length > 1 && (
                          <IconButton
                            aria-label="Remove category"
                            icon={<Icon as={Trash2} />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeCategory(index)}
                          />
                        )}
                      </HStack>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Name</FormLabel>
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(index, 'name', e.target.value)}
                          placeholder="e.g., Tonality & Control"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Description</FormLabel>
                        <Textarea
                          value={category.description}
                          onChange={(e) => updateCategory(index, 'description', e.target.value)}
                          placeholder="What to evaluate in this category"
                          size="sm"
                          rows={2}
                        />
                      </FormControl>

                      <HStack spacing={4}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Weight (%)</FormLabel>
                          <NumberInput
                            value={category.weight}
                            onChange={(_, value) => updateCategory(index, 'weight', value)}
                            min={0}
                            max={100}
                            size="sm"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Max Score</FormLabel>
                          <NumberInput
                            value={category.maxScore}
                            onChange={(_, value) => updateCategory(index, 'maxScore', value)}
                            min={1}
                            max={100}
                            size="sm"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </HStack>
                    </VStack>
                  </Card>
                ))}

                <Button
                  leftIcon={<Icon as={PlusCircle} />}
                  onClick={addCategory}
                  variant="outline"
                  size="sm"
                >
                  Add Category
                </Button>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateRubric}
              isLoading={isCreating}
            >
              Create Rubric
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Rubric Details Modal */}
      <Modal
        isOpen={!!selectedRubric}
        onClose={() => setSelectedRubric(null)}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text>{selectedRubric?.title}</Text>
                {selectedRubric && !isBuiltInRubric(selectedRubric) && (
                  <Badge colorScheme="blue">Custom</Badge>
                )}
                {selectedRubric && isBuiltInRubric(selectedRubric) && (
                  <Badge colorScheme="purple">Built-In</Badge>
                )}
              </HStack>
              <Text fontSize="sm" fontWeight="normal" color={useColorModeValue('gray.600', 'gray.400')}>
                {selectedRubric?.description}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedRubric?.categories.map((category, index) => (
                <Card key={index} bg={cardBg} border="1px solid" borderColor={borderColor} p={4}>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" width="100%">
                      <Heading size="sm">{category.name}</Heading>
                      <Badge colorScheme="blue">{category.weight}%</Badge>
                    </HStack>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      {category.description}
                    </Text>
                    <HStack spacing={4} fontSize="xs" color={useColorModeValue('gray.500', 'gray.500')}>
                      <Text>Max Score: {category.maxScore}</Text>
                    </HStack>
                  </VStack>
                </Card>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setSelectedRubric(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Rubrics


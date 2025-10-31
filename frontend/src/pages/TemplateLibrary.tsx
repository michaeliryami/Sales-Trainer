import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Divider,
  Spinner
} from '@chakra-ui/react'
import { Search, FileText, Filter, UserPlus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ALL_BUILT_IN_TEMPLATES, BuiltInTemplate } from '../config/templateLibrary'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'
import { useNavigate } from 'react-router-dom'

function TemplateLibrary() {
  const { organization, userRole } = useProfile()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<BuiltInTemplate | Template | null>(null)
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [isLoadingCustom, setIsLoadingCustom] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  useEffect(() => {
    fetchCustomTemplates()
  }, [organization?.id])

  const fetchCustomTemplates = async () => {
    if (!organization?.id) {
      setIsLoadingCustom(false)
      return
    }

    try {
      setIsLoadingCustom(true)
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('org', organization.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomTemplates(data || [])
    } catch (error) {
      console.error('Error fetching custom templates:', error)
    } finally {
      setIsLoadingCustom(false)
    }
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
  const filteredCustom = filterCustomTemplates(customTemplates)

  const handleViewTemplate = (template: BuiltInTemplate | Template) => {
    setSelectedTemplate(template)
    onOpen()
  }

  const isBuiltInTemplate = (template: any): template is BuiltInTemplate => {
    return 'isBuiltIn' in template && template.isBuiltIn === true
  }

  const handleAssignTemplate = (template: BuiltInTemplate | Template) => {
    // Navigate to assignments page with template data in state
    navigate('/assignments', {
      state: {
        prefillTemplate: {
          id: isBuiltInTemplate(template) ? template.id : template.id.toString(),
          title: template.title,
          description: template.description,
          difficulty: template.difficulty
        }
      }
    })
  }

  const TemplateCard = ({ template, isCustom = false }: { template: BuiltInTemplate | Template, isCustom?: boolean }) => (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      _hover={{
        borderColor: useColorModeValue('gray.300', 'gray.600'),
        shadow: 'lg',
        transform: 'translateY(-2px)'
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      shadow="sm"
      cursor="pointer"
      onClick={() => handleViewTemplate(template)}
    >
      <CardBody p={5}>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="flex-start">
            <Heading 
              size="md" 
              color={useColorModeValue('gray.900', 'white')}
              fontWeight="600"
              letterSpacing="-0.01em"
              flex={1}
            >
              {template.title}
            </Heading>
            {isCustom && (
              <Badge colorScheme="purple" borderRadius="full" px={2}>Custom</Badge>
            )}
          </HStack>

          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} lineHeight="1.5">
            {template.description}
          </Text>

          <HStack spacing={2}>
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
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )

  return (
    <Box bg={bg} minH="calc(100vh - 88px)" p={6}>
      <VStack align="stretch" spacing={6} maxW="1400px" mx="auto">
        {/* Header */}
        <Box>
          <Heading 
            size="xl" 
            color={useColorModeValue('gray.900', 'white')}
            fontWeight="600"
            letterSpacing="-0.02em"
            mb={2}
          >
            Template Library
          </Heading>
          <Text color={useColorModeValue('gray.500', 'gray.400')}>
            Browse and select from our collection of hardcoded personas and your custom templates
          </Text>
        </Box>

        {/* Search and Filters */}
        <Card bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="sm">
          <CardBody p={5}>
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
                <HStack flex={1}>
                  <Icon as={Filter} color={useColorModeValue('gray.500', 'gray.400')} />
                  <Select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    borderRadius="xl"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </Select>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Template Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList gap={2}>
            <Tab fontWeight="600">Basic Personas ({basicTemplates.length})</Tab>
            <Tab fontWeight="600">Advanced Personas ({advancedTemplates.length})</Tab>
            <Tab fontWeight="600">Custom Templates ({filteredCustom.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Basic Templates */}
            <TabPanel px={0} pt={6}>
              {basicTemplates.length === 0 ? (
                <Card bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={8}>
                  <VStack spacing={2}>
                    <Icon as={FileText} boxSize={12} color={useColorModeValue('gray.400', 'gray.500')} />
                    <Text color={useColorModeValue('gray.500', 'gray.400')}>
                      No basic templates match your filters
                    </Text>
                  </VStack>
                </Card>
              ) : (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4}>
                  {basicTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Advanced Templates */}
            <TabPanel px={0} pt={6}>
              {advancedTemplates.length === 0 ? (
                <Card bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={8}>
                  <VStack spacing={2}>
                    <Icon as={FileText} boxSize={12} color={useColorModeValue('gray.400', 'gray.500')} />
                    <Text color={useColorModeValue('gray.500', 'gray.400')}>
                      No advanced templates match your filters
                    </Text>
                  </VStack>
                </Card>
              ) : (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4}>
                  {advancedTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Custom Templates */}
            <TabPanel px={0} pt={6}>
              {isLoadingCustom ? (
                <Card bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={8}>
                  <VStack spacing={4}>
                    <Spinner size="xl" color={accentColor} thickness="4px" />
                    <Text color={useColorModeValue('gray.500', 'gray.400')}>
                      Loading custom templates...
                    </Text>
                  </VStack>
                </Card>
              ) : filteredCustom.length === 0 ? (
                <Card bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={8}>
                  <VStack spacing={2}>
                    <Icon as={FileText} boxSize={12} color={useColorModeValue('gray.400', 'gray.500')} />
                    <Text color={useColorModeValue('gray.500', 'gray.400')}>
                      No custom templates found
                    </Text>
                  </VStack>
                </Card>
              ) : (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4}>
                  {filteredCustom.map(template => (
                    <TemplateCard key={template.id} template={template} isCustom />
                  ))}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Template Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" maxH="85vh">
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
            <VStack align="stretch" spacing={2}>
              <Heading size="lg" fontWeight="600">
                {selectedTemplate?.title}
              </Heading>
              <HStack spacing={2}>
                {selectedTemplate && (
                  <>
                    <Badge 
                      colorScheme={getDifficultyColor(selectedTemplate.difficulty)} 
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {selectedTemplate.difficulty}
                    </Badge>
                  </>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="600" mb={2} color={useColorModeValue('gray.700', 'gray.300')}>
                  Description
                </Text>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  {selectedTemplate?.description}
                </Text>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="600" mb={3} color={useColorModeValue('gray.700', 'gray.300')}>
                  Template Script
                </Text>
                <Box
                  p={4}
                  bg={useColorModeValue('gray.50', 'gray.900')}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  sx={{
                    '& h1': { fontSize: '2xl', fontWeight: 'bold', mb: 3, mt: 2 },
                    '& h2': { fontSize: 'xl', fontWeight: 'semibold', mb: 2, mt: 3 },
                    '& h3': { fontSize: 'lg', fontWeight: 'semibold', mb: 2, mt: 2 },
                    '& p': { mb: 2 },
                    '& ul': { ml: 4, mb: 2 },
                    '& li': { mb: 1 },
                    '& strong': { fontWeight: 'bold' }
                  }}
                >
                  <ReactMarkdown>
                    {selectedTemplate?.script || ''}
                  </ReactMarkdown>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
          
          {/* Modal Footer with Assign Button for Admins */}
          {userRole.isAdmin && selectedTemplate && (
            <ModalFooter borderTop="1px solid" borderColor={borderColor}>
              <Button
                leftIcon={<Icon as={UserPlus} />}
                colorScheme="blue"
                onClick={() => {
                  handleAssignTemplate(selectedTemplate)
                  onClose()
                }}
                size="md"
              >
                Create Assignment from Template
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default TemplateLibrary


import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Flex,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  SimpleGrid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award,
  Calendar,
  Activity,
  Zap,
  FileDown,
  RefreshCw,
  FileText,
  ClipboardList,
  Volume2
} from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useProfile } from '../contexts/ProfileContext'
import { useLocation, useNavigate } from 'react-router-dom'
import apiFetch from '../utils/api'

const Analytics: React.FC = () => {
  const { organization } = useProfile()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionGrade, setSessionGrade] = useState<any>(null)
  const [sessionTranscript, setSessionTranscript] = useState<any>(null)
  const [sessionSummary, setSessionSummary] = useState<string | null>(null)
  const [loadingGrade, setLoadingGrade] = useState(false)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [filterAssignmentId, setFilterAssignmentId] = useState<number | null>(null)
  const [activeView, setActiveView] = useState<'transcript' | 'grade' | 'summary' | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [selectedCriterion, setSelectedCriterion] = useState<any>(null)
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const toast = useToast()
  
  // Cache TTL: 2 minutes
  const CACHE_TTL = 2 * 60 * 1000
  
  // Get assignment filter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const assignmentId = params.get('assignment')
    if (assignmentId) {
      setFilterAssignmentId(parseInt(assignmentId))
    }
  }, [location.search])
  
  // Auto-expand first session when filtered by assignment
  useEffect(() => {
    if (filterAssignmentId && analyticsData?.recentSessions) {
      const assignmentSessions = analyticsData.recentSessions.filter(
        (s: any) => s.assignmentId === filterAssignmentId && s.sessionType === 'assignment'
      )
      if (assignmentSessions.length > 0 && !selectedSession) {
        handleSessionClick(assignmentSessions[0])
      }
    }
  }, [filterAssignmentId, analyticsData])

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('white', 'gray.800')
  const accentColor = useColorModeValue('#f26f25', '#ff7d31')

  // Fetch real analytics data from API with caching
  const fetchAnalytics = async (isBackground = false) => {
    if (!organization?.id) return
    
    // If background refresh, don't show loading spinner
    if (!isBackground) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    
    try {
      const cacheKey = `analytics_${organization.id}_${timeRange}`
      const now = Date.now()
      
      // Check cache first (only for initial load, not background refresh)
      if (!isBackground) {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (now - timestamp < CACHE_TTL) {
            console.log('Loading analytics from cache')
            setAnalyticsData(data)
            setLastFetch(timestamp)
            setLoading(false)
            return
          }
        }
      }
      
      // Fetch fresh data
      const response = await apiFetch(`/api/analytics/admin/${organization.id}?period=${timeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result.data)
        setLastFetch(now)
        
        // Update cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result.data,
          timestamp: now
        }))
      } else {
        console.error('Failed to fetch analytics:', result.error)
        // Set empty data on error
        setAnalyticsData({
          totalSessions: 0,
          totalUsers: 0,
          avgSessionDuration: 0,
          completionRate: 0,
          avgScore: 0,
          topTemplates: [],
          recentSessions: [],
          topPerformers: [],
          weeklyTrends: { sessions: [], completion: [] }
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set empty data on error
      setAnalyticsData({
        totalSessions: 0,
        totalUsers: 0,
        avgSessionDuration: 0,
        completionRate: 0,
        avgScore: 0,
        topTemplates: [],
        recentSessions: [],
        topPerformers: [],
        weeklyTrends: { sessions: [], completion: [] }
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, organization])
  
  // Background refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (organization?.id && analyticsData) {
        console.log('Background refresh analytics...')
        fetchAnalytics(true)
      }
    }, CACHE_TTL)
    
    return () => clearInterval(interval)
  }, [organization, timeRange, analyticsData])

  // Fetch grade details when session is selected
  const fetchSessionGrade = async (sessionId: number) => {
    setLoadingGrade(true)
    try {
      const response = await apiFetch(`/api/analytics/session-grade/${sessionId}`)
      const result = await response.json()
      
      if (result.success) {
        setSessionGrade(result.data)
      } else {
        setSessionGrade(null)
      }
    } catch (error) {
      console.error('Error fetching session grade:', error)
      setSessionGrade(null)
    } finally {
      setLoadingGrade(false)
    }
  }

  // Fetch transcript details when needed
  const fetchSessionTranscript = async (sessionId: number) => {
    setLoadingTranscript(true)
    try {
      const response = await apiFetch(`/api/analytics/session-transcript/${sessionId}`)
      const result = await response.json()
      
      if (result.success) {
        setSessionTranscript(result.data)
      } else {
        setSessionTranscript(null)
      }
    } catch (error) {
      console.error('Error fetching session transcript:', error)
      setSessionTranscript(null)
    } finally {
      setLoadingTranscript(false)
    }
  }

  // Generate AI summary for the call
  const generateSummary = async (sessionId: number) => {
    setLoadingSummary(true)
    try {
      const response = await apiFetch(`/api/analytics/session-summary/${sessionId}`)
      const result = await response.json()
      
      if (result.success) {
        setSessionSummary(result.data.summary)
      } else {
        setSessionSummary(null)
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      setSessionSummary(null)
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
    if (session.hasGrade && session.sessionType === 'assignment') {
      fetchSessionGrade(session.id)
    } else {
      setSessionGrade(null)
    }
  }

  const handleViewButtonClick = (view: 'transcript' | 'grade' | 'summary', session: any) => {
    // Toggle view - if clicking the same view, deselect it
    if (selectedSession?.id === session.id && activeView === view) {
      setActiveView(null)
      setSelectedSession(null)
      setSessionGrade(null)
      setSessionTranscript(null)
      setSessionSummary(null)
      return
    }
    
    // Set new selection
    setSelectedSession(session)
    setActiveView(view)
    
    // Fetch data based on view
    if (view === 'grade' && !sessionGrade) {
      fetchSessionGrade(session.id)
    }
    if (view === 'transcript' && !sessionTranscript) {
      fetchSessionTranscript(session.id)
    }
    if (view === 'summary') {
      if (!sessionTranscript) {
        fetchSessionTranscript(session.id)
      }
      if (!sessionSummary) {
        generateSummary(session.id)
      }
    }
  }

  const generatePdf = async () => {
    if (!selectedSession || !sessionGrade) return
    
    setGeneratingPdf(true)
    try {
      // Fetch the full session data from backend
      const sessionResponse = await apiFetch(`/api/analytics/session-data/${selectedSession.id}`)
      const sessionResult = await sessionResponse.json()
      
      if (!sessionResult.success) {
        throw new Error('Failed to fetch session data')
      }
      
      const session = sessionResult.data
      
      // Parse transcript if it's a string, otherwise use as-is
      let transcriptChunks = session.transcript
      if (typeof transcriptChunks === 'string') {
        transcriptChunks = JSON.parse(transcriptChunks)
      }
      
      // Prepare export data matching the format from CreateSession
      const exportData = {
        callId: session.call_id || session.vapi_call_id,
        templateTitle: selectedSession.template,
        templateDescription: '',
        startTime: session.start_time,
        endTime: session.end_time,
        duration: session.duration_seconds,
        chunks: transcriptChunks || [],
        script: '',
        userId: selectedSession.userId,
        orgId: session.org_id,
        templateId: session.template_id,
        assignmentId: session.assignment_id,
        assignmentTitle: selectedSession.template, // We don't have this separately
        rubricId: sessionGrade.rubric_id,
        rubricTitle: 'Assignment Rubric',
        rubricCriteria: sessionGrade.criteria_grades || []
      }

      const response = await apiFetch('/api/export/transcript-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `training-report-${selectedSession.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'PDF Generated',
          description: 'Your training report has been downloaded',
          status: 'success',
          duration: 3000,
        })
        
        // Refresh analytics to get updated pdfUrl
        if (organization?.id) {
          const response = await apiFetch(`/api/analytics/admin/${organization.id}?period=${timeRange}`)
          const result = await response.json()
          if (result.success) {
            setAnalyticsData(result.data)
          }
        }
      } else {
        const errorText = await response.text()
        console.error('PDF generation failed:', errorText)
        throw new Error('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate PDF report',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <Box bg={bg} h="calc(100vh - 88px)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
            Loading analytics...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Overview Stats */}
        <Panel defaultSize={50} minSize={20} maxSize={80}>
          <Box 
            bg={cardBg} 
            h="full"
            overflow="hidden" 
            display="flex" 
            flexDirection="column"
            borderRadius="xl"
            borderTopRightRadius="0"
            borderBottomRightRadius="0"
          >
            {/* Header */}
            <Box 
              px={6}
              py={4}
              borderBottom="1px"
              borderColor={borderColor}
            >
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1} flex={1}>
                  <Heading 
                    size="md" 
                    color={useColorModeValue('gray.900', 'white')}
                    fontWeight="600"
                  >
                    Analytics Dashboard
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.600', 'gray.400')}
                  >
                    {lastFetch > 0 && (
                      <>Last updated {new Date(lastFetch).toLocaleTimeString()}</>
                    )}
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<Icon as={RefreshCw} boxSize={4} />}
                    size="sm"
                    variant="ghost"
                    onClick={() => fetchAnalytics()}
                    isLoading={refreshing}
                    loadingText="Refreshing..."
                  >
                    Refresh
                  </Button>
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    size="sm"
                    bg={cardBg}
                    borderColor={borderColor}
                    borderRadius="xl"
                    w="120px"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </Select>
                </HStack>
              </Flex>
            </Box>

            {/* Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={6} align="stretch">
                {/* Key Metrics */}
                <SimpleGrid columns={{ base: 2, md: 2, lg: 5 }} spacing={4}>
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Total Sessions
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.totalSessions || 0}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          All completed training calls
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Active Users
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.totalUsers || 0}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Users with sessions
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Avg Duration
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.avgSessionDuration || 0}m
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Average call length
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Avg Score
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.avgScore || 0}%
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Overall performance
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Completion Rate
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.completionRate || 0}%
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Sessions completed
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Top Templates */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="md">
                  <CardBody p={6}>
                    <Heading 
                      size="md" 
                      color={useColorModeValue('gray.900', 'white')} 
                      mb={4}
                      fontWeight="600"
                      letterSpacing="-0.01em"
                    >
                      Top Performing Templates
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      {analyticsData?.topTemplates?.map((template: any, index: number) => (
                        <Box key={index} p={4} bg={useColorModeValue('gray.50/50', 'gray.800/50')} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                              {template.name}
                            </Text>
                            <Badge colorScheme="orange" variant="outline" borderRadius="full" px={3} py={1}>
                              {template.sessions} sessions
                            </Badge>
                          </Flex>
                          <HStack justify="space-between" align="center">
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                              Success Rate
                            </Text>
                            <HStack spacing={2}>
                              <Progress 
                                value={template.successRate} 
                                size="sm" 
                                colorScheme="green" 
                                borderRadius="full" 
                                w="100px"
                                bg={useColorModeValue('gray.200', 'gray.700')}
                              />
                              <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')}>
                                {template.successRate}%
                              </Text>
                            </HStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Top Performers */}
                {analyticsData?.topPerformers && analyticsData.topPerformers.length > 0 && (
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="md">
                    <CardBody p={6}>
                      <Heading 
                        size="md" 
                        color={useColorModeValue('gray.900', 'white')} 
                        mb={4}
                        fontWeight="600"
                        letterSpacing="-0.01em"
                      >
                        <HStack>
                          <Icon as={Award} boxSize={5} color={accentColor} />
                          <Text>Top Performers</Text>
                        </HStack>
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        {analyticsData.topPerformers.map((performer: any, index: number) => (
                          <Box key={index} p={4} bg={useColorModeValue('gray.50/50', 'gray.800/50')} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={3}>
                                <Box 
                                  bg={index === 0 ? 'yellow.100' : index === 1 ? 'gray.200' : 'orange.100'} 
                                  color={index === 0 ? 'yellow.800' : index === 1 ? 'gray.700' : 'orange.800'}
                                  w="32px"
                                  h="32px"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontWeight="700"
                                  fontSize="sm"
                                >
                                  {index + 1}
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                                    {performer.name}
                                  </Text>
                                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                    {performer.completedSessions} sessions • {performer.streak} day streak
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge 
                                colorScheme={performer.avgScore >= 85 ? 'green' : performer.avgScore >= 70 ? 'blue' : 'yellow'}
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="sm"
                                fontWeight="600"
                              >
                                {performer.avgScore}% avg
                              </Badge>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
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

        {/* Right Panel - Recent Activity */}
        <Panel defaultSize={50} minSize={20} maxSize={80}>
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
            {/* Header */}
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
                  Recent Activity
                </Heading>
                <Text 
                  fontSize="sm" 
                  color={useColorModeValue('gray.600', 'gray.400')}
                >
                  Latest training sessions
                </Text>
              </VStack>
            </Box>

            {/* Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={4} align="stretch">
                {/* Assignment Filter */}
                {filterAssignmentId && (
                  <Alert status="info" borderRadius="xl">
                    <AlertIcon />
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="600">Filtered by Assignment #{filterAssignmentId}</Text>
                    </Box>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setFilterAssignmentId(null)
                      navigate('/analytics')
                    }}>
                      Clear Filter
                    </Button>
                  </Alert>
                )}
                
                {analyticsData?.recentSessions
                  ?.filter((session: any) => !filterAssignmentId || session.assignmentId === filterAssignmentId)
                  .map((session: any, index: number) => (
                  <React.Fragment key={index}>
                  <Card 
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    shadow="sm"
                    _hover={{ shadow: 'md', borderColor: accentColor }}
                    transition="all 0.3s"
                  >
                    <CardBody p={4}>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')} fontSize="sm">
                              {session.user}
                            </Text>
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                              {session.template}
                            </Text>
                          </VStack>
                          <Badge 
                            colorScheme={session.score >= 85 ? 'green' : session.score >= 70 ? 'yellow' : 'red'}
                            variant="subtle"
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontSize="xs"
                          >
                            {session.score}%
                          </Badge>
                        </HStack>
                        
                        <HStack spacing={2}>
                          <HStack spacing={1}>
                            <Icon as={Clock} boxSize={3} color={useColorModeValue('gray.400', 'gray.500')} />
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                              {session.duration}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={Calendar} boxSize={3} color={useColorModeValue('gray.400', 'gray.500')} />
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                              {new Date(session.date).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </HStack>

                        {/* Action Buttons */}
                        {session.sessionType === 'assignment' && (
                          <HStack spacing={2}>
                            <Button
                              size="xs"
                              leftIcon={<Icon as={FileText} boxSize={3} />}
                              colorScheme="orange"
                              variant={selectedSession?.id === session.id && activeView === 'transcript' ? 'solid' : 'outline'}
                              onClick={() => handleViewButtonClick('transcript', session)}
                              flex={1}
                            >
                              Transcript
                            </Button>
                            <Button
                              size="xs"
                              leftIcon={<Icon as={ClipboardList} boxSize={3} />}
                              colorScheme="orange"
                              variant={selectedSession?.id === session.id && activeView === 'grade' ? 'solid' : 'outline'}
                              onClick={() => handleViewButtonClick('grade', session)}
                              flex={1}
                            >
                              Grade
                            </Button>
                            <Button
                              size="xs"
                              leftIcon={<Icon as={BarChart3} boxSize={3} />}
                              colorScheme="orange"
                              variant={selectedSession?.id === session.id && activeView === 'summary' ? 'solid' : 'outline'}
                              onClick={() => handleViewButtonClick('summary', session)}
                              flex={1}
                            >
                              Summary
                            </Button>
                            <Button
                              size="xs"
                              leftIcon={<Icon as={Volume2} boxSize={3} />}
                              colorScheme="orange"
                              variant="outline"
                              isDisabled
                              flex={1}
                            >
                              Audio
                            </Button>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  {/* Grade Report - Show as 2-column grid */}
                  {selectedSession?.id === session.id && activeView === 'grade' && sessionGrade && (
                    <Card bg={cardBg} border="2px solid" borderColor={accentColor} borderRadius="2xl" shadow="lg">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Header */}
                          <HStack justify="space-between" align="center">
                            <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                              Grade Report
                            </Heading>
                            <Badge 
                              colorScheme={sessionGrade.percentage >= 85 ? 'green' : sessionGrade.percentage >= 70 ? 'blue' : 'red'}
                              variant="solid"
                              borderRadius="full"
                              px={4}
                              py={2}
                              fontSize="lg"
                              fontWeight="700"
                            >
                              {Math.round(sessionGrade.percentage)}% ({sessionGrade.total_score}/{sessionGrade.max_possible_score})
                            </Badge>
                          </HStack>
                          
                          <Divider />
                          
                          {/* Criteria Grid - 2 columns */}
                          <SimpleGrid columns={2} spacing={3}>
                            {sessionGrade.criteria_grades?.map((criteria: any, idx: number) => (
                              <Box 
                                key={idx} 
                                p={3} 
                                bg={useColorModeValue('gray.50', 'gray.800')} 
                                borderRadius="lg" 
                                border="1px solid" 
                                borderColor={borderColor}
                                cursor="pointer"
                                _hover={{ 
                                  borderColor: accentColor, 
                                  shadow: 'md',
                                  transform: 'translateY(-2px)'
                                }}
                                transition="all 0.2s"
                                onClick={() => {
                                  setSelectedCriterion(criteria)
                                  onModalOpen()
                                }}
                              >
                                <VStack align="stretch" spacing={2}>
                                  <HStack justify="space-between" align="center">
                                    <Text fontWeight="700" color={useColorModeValue('gray.900', 'white')} fontSize="sm">
                                      {criteria.title}
                                    </Text>
                                    <Badge 
                                      colorScheme={
                                        (criteria.earnedPoints / criteria.maxPoints) >= 0.85 ? 'green' : 
                                        (criteria.earnedPoints / criteria.maxPoints) >= 0.70 ? 'blue' : 'orange'
                                      }
                                      borderRadius="full"
                                      px={2}
                                      py={1}
                                      fontSize="xs"
                                    >
                                      {criteria.earnedPoints}/{criteria.maxPoints}
                                    </Badge>
                                  </HStack>
                                  
                                  {/* Objections list for Objection Handling */}
                                  {criteria.title.toLowerCase().includes('objection') && criteria.evidence && criteria.evidence.length > 0 && (
                                    <VStack align="stretch" spacing={1} fontSize="xs">
                                      <Text fontWeight="600" color={useColorModeValue('blue.600', 'blue.300')}>
                                        Objections ({criteria.evidence.length}):
                                      </Text>
                                      {criteria.evidence.slice(0, 2).map((objection: string, i: number) => (
                                        <Text key={i} color={useColorModeValue('gray.600', 'gray.400')} noOfLines={1}>
                                          {i + 1}. "{objection}"
                                        </Text>
                                      ))}
                                      {criteria.evidence.length > 2 && (
                                        <Text color={useColorModeValue('gray.500', 'gray.500')} fontStyle="italic">
                                          +{criteria.evidence.length - 2} more
                                        </Text>
                                      )}
                                    </VStack>
                                  )}
                                  
                                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
                                    {criteria.reasoning}
                                  </Text>
                                  
                                  <Text fontSize="xs" color="blue.500" fontWeight="600" textAlign="center" mt={1}>
                                    Click for details →
                                  </Text>
                                </VStack>
                              </Box>
                            ))}
                          </SimpleGrid>
                          
                          {/* Download PDF Button */}
                          {selectedSession?.pdfUrl ? (
                            <Button
                              as="a"
                              href={selectedSession.pdfUrl}
                              download
                              leftIcon={<Icon as={FileDown} />}
                              size="sm"
                              colorScheme="orange"
                              width="full"
                            >
                              Download PDF Report
                            </Button>
                          ) : (
                            <Button
                              leftIcon={<Icon as={FileDown} />}
                              size="sm"
                              colorScheme="orange"
                              width="full"
                              onClick={generatePdf}
                              isLoading={generatingPdf}
                            >
                              Generate PDF Report
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                  
                  {/* Transcript View */}
                  {selectedSession?.id === session.id && activeView === 'transcript' && (
                    <Card bg={cardBg} border="2px solid" borderColor="blue.500" borderRadius="2xl" shadow="lg">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                            Call Transcript
                          </Heading>
                          {loadingTranscript ? (
                            <VStack py={8}>
                              <Spinner color="blue.500" />
                              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                                Loading transcript...
                              </Text>
                            </VStack>
                          ) : sessionTranscript?.transcript_clean ? (
                            <Box 
                              maxH="500px" 
                              overflowY="auto" 
                              p={4} 
                              bg={useColorModeValue('gray.50', 'gray.900')}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor={borderColor}
                            >
                              <VStack align="stretch" spacing={4} w="full">
                                {sessionTranscript.transcript_clean.split('\n').filter((line: string) => line.trim() !== '').map((line: string, idx: number) => {
                                  // Match landing page chat UI style
                                  if (line.startsWith('You:')) {
                                    const message = line.substring(4).trim()
                                    if (!message) return null
                                    return (
                                      <Box 
                                        key={idx} 
                                        bg={accentColor}
                                        color="white"
                                        p={4}
                                        rounded="2xl"
                                        roundedBottomRight="md"
                                        maxW="75%"
                                        alignSelf="flex-end"
                                      >
                                        <Text fontSize="sm">{message}</Text>
                                      </Box>
                                    )
                                  } else if (line.startsWith('AI Customer:')) {
                                    const message = line.substring(12).trim()
                                    if (!message) return null
                                    return (
                                      <Box 
                                        key={idx} 
                                        bg={useColorModeValue('gray.100', 'gray.700')}
                                        color={useColorModeValue('gray.700', 'white')}
                                        p={4}
                                        rounded="2xl"
                                        roundedBottomLeft="md"
                                        maxW="75%"
                                        alignSelf="flex-start"
                                      >
                                        <Text fontSize="sm">{message}</Text>
                                      </Box>
                                    )
                                  } else {
                                    // Display other lines centered
                                    return (
                                      <Box key={idx} p={2} alignSelf="center">
                                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.500')} fontStyle="italic">
                                          {line}
                                        </Text>
                                      </Box>
                                    )
                                  }
                                })}
                              </VStack>
                            </Box>
                          ) : (
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                              No transcript available
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                  
                  {/* Summary View */}
                  {selectedSession?.id === session.id && activeView === 'summary' && (
                    <Card bg={cardBg} border="2px solid" borderColor="green.500" borderRadius="2xl" shadow="lg">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                            AI Call Summary
                          </Heading>
                          {loadingSummary ? (
                            <VStack py={8}>
                              <Spinner color="green.500" />
                              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                                Generating AI summary...
                              </Text>
                            </VStack>
                          ) : sessionSummary ? (
                            <VStack align="stretch" spacing={3}>
                              <Box p={4} bg={useColorModeValue('green.50', 'green.900/20')} borderRadius="lg" border="2px solid" borderColor="green.200">
                                <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} whiteSpace="pre-wrap" lineHeight="1.8">
                                  {sessionSummary}
                                </Text>
                              </Box>
                              {sessionTranscript && (
                                <HStack spacing={4} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                                  <HStack spacing={1}>
                                    <Icon as={Clock} boxSize={4} />
                                    <Text>Duration: {Math.round(sessionTranscript.duration_seconds / 60)} min</Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Icon as={Calendar} boxSize={4} />
                                    <Text>{new Date(sessionTranscript.start_time).toLocaleString()}</Text>
                                  </HStack>
                                </HStack>
                              )}
                            </VStack>
                          ) : (
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                              No summary available
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                  
                  {/* Loading State */}
                  {selectedSession?.id === session.id && loadingGrade && (
                    <Card bg={cardBg} borderRadius="2xl" ml={4}>
                      <CardBody p={8}>
                        <VStack>
                          <Spinner color={accentColor} />
                          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                            Loading grade details...
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                  </React.Fragment>
                ))}
              </VStack>
            </Box>
          </Box>
        </Panel>
      </PanelGroup>

      {/* Criterion Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="800px" mx={4}>
          <ModalHeader pr={12}>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" fontWeight="700" color={useColorModeValue('gray.900', 'white')} pr={8}>
                {selectedCriterion?.title}
              </Text>
              {selectedCriterion && (
                <Badge 
                  colorScheme={
                    (selectedCriterion.earnedPoints / selectedCriterion.maxPoints) >= 0.85 ? 'green' : 
                    (selectedCriterion.earnedPoints / selectedCriterion.maxPoints) >= 0.70 ? 'blue' : 'orange'
                  }
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="sm"
                >
                  {selectedCriterion.earnedPoints}/{selectedCriterion.maxPoints} pts
                </Badge>
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />
          <ModalBody pb={6}>
            {selectedCriterion && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                    Description:
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
                    {selectedCriterion.description}
                  </Text>
                </Box>

                <Divider />

                {/* Special handling for Objection Handling - show all objections */}
                {selectedCriterion.title.toLowerCase().includes('objection') && selectedCriterion.evidence && selectedCriterion.evidence.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={useColorModeValue('blue.700', 'blue.300')} mb={2}>
                      All Objections Identified ({selectedCriterion.evidence.length}):
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedCriterion.evidence.map((objection: string, i: number) => (
                        <Box key={i} p={3} bg={useColorModeValue('blue.50', 'blue.900/20')} borderRadius="md" borderLeft="3px solid" borderColor="blue.500">
                          <HStack align="start" spacing={2}>
                            <Badge colorScheme="blue" fontSize="xs">{i + 1}</Badge>
                            <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} flex={1}>
                              "{objection}"
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Evidence for other criteria */}
                {!selectedCriterion.title.toLowerCase().includes('objection') && selectedCriterion.evidence && selectedCriterion.evidence.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')} mb={2}>
                      Evidence from Transcript:
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedCriterion.evidence.map((ev: string, i: number) => (
                        <Box key={i} p={3} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="md" borderLeft="3px solid" borderColor={borderColor}>
                          <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
                            "{ev}"
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                <Divider />

                <Box>
                  <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')} mb={2}>
                    AI Analysis:
                  </Text>
                  <Box p={3} bg={useColorModeValue('orange.50', 'orange.900/20')} borderRadius="md">
                    <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
                      {selectedCriterion.reasoning}
                    </Text>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Analytics

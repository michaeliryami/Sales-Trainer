import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
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
  Divider,
  Select,
  Spinner,
  Button,
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
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Clock,
  FileDown,
  FileText,
  ClipboardList,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useProfile } from '../contexts/ProfileContext'
import { useToast } from '@chakra-ui/react'
import apiFetch from '../utils/api'

const MyAnalytics: React.FC = () => {
  const { profile, userRole } = useProfile()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')
  const [statsFilter, setStatsFilter] = useState<'all' | 'practice' | 'assignment'>('all')
  const [sessionListFilter, setSessionListFilter] = useState<'all' | 'practice' | 'assignment'>('all')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionGrade, setSessionGrade] = useState<any>(null)
  const [sessionTranscript, setSessionTranscript] = useState<any>(null)
  const [sessionSummary, setSessionSummary] = useState<string | null>(null)
  const [loadingGrade, setLoadingGrade] = useState(false)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [activeView, setActiveView] = useState<'transcript' | 'grade' | 'summary' | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [selectedCriterion, setSelectedCriterion] = useState<any>(null)
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const { isOpen: isClosedModalOpen, onOpen: onClosedModalOpen, onClose: onClosedModalClose } = useDisclosure()
  const [selectedClosedSession, setSelectedClosedSession] = useState<any>(null)
  const [sessionOffset, setSessionOffset] = useState(0)
  const [hasMoreSessions, setHasMoreSessions] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const toast = useToast()

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('white', 'gray.800')
  const accentColor = useColorModeValue('#f26f25', '#ff7d31')

  // Fetch employee analytics data with caching
  const fetchAnalytics = React.useCallback(async (loadMore = false) => {
    if (!profile?.id) return

    const CACHE_TTL = 2 * 60 * 1000 // 2 minutes
    const cacheKey = `my_analytics_${profile.id}_${timeRange}`
    const cached = localStorage.getItem(cacheKey)
    const now = Date.now()
    const offset = loadMore ? sessionOffset : 0

    // If we have cached data (even if expired), refresh in background
    if (cached && !loadMore) {
      setRefreshing(true)
    } else if (!loadMore) {
      // No cache - show loading spinner
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const response = await apiFetch(`/api/analytics/employee/${profile.id}?period=${timeRange}&limit=10&offset=${offset}`)
      const result = await response.json()

      if (import.meta.env.DEV) console.log('📊 Analytics data received:', result)
      if (import.meta.env.DEV) console.log('📋 Recent sessions:', result?.data?.recentSessions)

      if (result.success) {
        if (loadMore) {
          // Append new sessions to existing ones
          setAnalyticsData((prev: any) => ({
            ...result.data,
            recentSessions: [...(prev?.recentSessions || []), ...(result.data.recentSessions || [])]
          }))
        } else {
          setAnalyticsData(result.data)
          setSessionOffset(0)
        }

        // Update pagination state
        setHasMoreSessions(result.pagination?.hasMore || false)
        setSessionOffset(offset + 10)

        // Update cache (only for initial load)
        if (!loadMore) {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: result.data,
            timestamp: now
          }))
        }
      } else {
        if (import.meta.env.DEV) console.error('Failed to fetch analytics:', result.error)
        // Only set null if we don't have cached data
        if (!cached && !loadMore) {
          setAnalyticsData(null)
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching analytics:', error)
      // Only set null if we don't have cached data
      if (!cached && !loadMore) {
        setAnalyticsData(null)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [profile?.id, timeRange, sessionOffset])

  useEffect(() => {
    if (!profile?.id) return

    const CACHE_TTL = 2 * 60 * 1000 // 2 minutes
    const cacheKey = `my_analytics_${profile.id}_${timeRange}`
    const cached = localStorage.getItem(cacheKey)
    const now = Date.now()

    // Load from cache immediately if available
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        setAnalyticsData(data)
        setLoading(false) // Stop loading since we have cached data

        // Check if cache is still fresh
        if (now - timestamp < CACHE_TTL) {
          // Cache is fresh - don't fetch
          return
        }
        // Cache expired - will fetch in background below
      } catch (e) {
        // Invalid cache - will fetch below
        setLoading(true) // Show loading since cache is invalid
      }
    }

    // No cache or cache expired - fetch
    fetchAnalytics()
  }, [timeRange, profile, fetchAnalytics])

  // Use pre-calculated stats from backend based on statsFilter
  const filteredAnalytics = React.useMemo(() => {
    if (!analyticsData) return null

    if (statsFilter === 'all') return analyticsData

    if (statsFilter === 'practice') {
      // Use practice stats calculated from ALL sessions by backend
      return {
        ...analyticsData,
        totalSessions: analyticsData.practiceStats?.totalSessions || 0,
        completedSessions: analyticsData.practiceStats?.completedSessions || 0,
        avgScore: analyticsData.practiceStats?.avgScore || 0,
        avgDuration: analyticsData.practiceStats?.avgDuration || 0,
        // Filter score trend to only practice sessions
        scoreTrend: (analyticsData.scoreTrend || []).filter((score: any) => {
          const session = analyticsData.recentSessions?.find((s: any) => s.id === score.sessionId)
          return session?.isPlayground === true
        }),
        improvementRate: 0 // Will recalculate below
      }
    }

    if (statsFilter === 'assignment') {
      // Use assignment stats calculated from ALL sessions by backend
      return {
        ...analyticsData,
        totalSessions: analyticsData.assignmentStats?.totalSessions || 0,
        completedSessions: analyticsData.assignmentStats?.completedSessions || 0,
        avgScore: analyticsData.assignmentStats?.avgScore || 0,
        avgDuration: analyticsData.assignmentStats?.avgDuration || 0,
        // Filter score trend to only assignment sessions
        scoreTrend: (analyticsData.scoreTrend || []).filter((score: any) => {
          const session = analyticsData.recentSessions?.find((s: any) => s.id === score.sessionId)
          return session?.isPlayground === false
        }),
        improvementRate: 0 // Will recalculate below
      }
    }

    return analyticsData
  }, [analyticsData, statsFilter])

  // Fetch grade details when session is selected
  const fetchSessionGrade = async (sessionId: number) => {
    setLoadingGrade(true)
    try {
      if (import.meta.env.DEV) console.log('Fetching grade for session ID:', sessionId)
      const response = await apiFetch(`/api/analytics/session-grade/${sessionId}`)
      const result = await response.json()

      if (import.meta.env.DEV) console.log('Grade fetch result:', result)

      if (result.success) {
        if (import.meta.env.DEV) console.log('Setting session grade:', result.data)
        setSessionGrade(result.data)
      } else {
        if (import.meta.env.DEV) console.log('No grade found in result')
        setSessionGrade(null)
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching session grade:', error)
      setSessionGrade(null)
    } finally {
      setLoadingGrade(false)
    }
  }

  // Fetch transcript for a session
  const fetchSessionTranscript = async (sessionId: number) => {
    setLoadingTranscript(true)
    try {
      const response = await apiFetch(`/api/analytics/session-transcript/${sessionId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setSessionTranscript(result.data)
      } else {
        setSessionTranscript(null)
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching session transcript:', error)
      setSessionTranscript(null)
    } finally {
      setLoadingTranscript(false)
    }
  }

  // Generate/fetch AI summary for a session
  const generateSummary = async (sessionId: number) => {
    setLoadingSummary(true)
    try {
      const response = await apiFetch(`/api/analytics/session-summary/${sessionId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setSessionSummary(result.data.summary)
      } else {
        setSessionSummary(null)
        toast({
          title: 'Failed to generate summary',
          description: result.error || 'Unknown error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error generating summary:', error)
      setSessionSummary(null)
      toast({
        title: 'Failed to generate summary',
        description: 'An error occurred while generating the summary',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoadingSummary(false)
    }
  }

  // Handle view button clicks (Transcript, Grade, Summary)
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

    // Clear old data when switching to a different session
    if (selectedSession?.id !== session.id) {
      setSessionGrade(null)
      setSessionTranscript(null)
      setSessionSummary(null)
    }

    // Always fetch data for the selected session
    if (view === 'grade') {
      fetchSessionGrade(session.id)
    }
    if (view === 'transcript') {
      fetchSessionTranscript(session.id)
    }
    if (view === 'summary') {
      fetchSessionTranscript(session.id)
      generateSummary(session.id)
    }
  }

  // Handle submitting practice session for review
  const handleSubmitForReview = async (session: any) => {
    try {
      const response = await apiFetch(`/api/analytics/submit-for-review/${session.id}`, {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Submitted for Review',
          description: 'Your practice session has been submitted and will be visible in Team Performance.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Refresh analytics to show updated status
        fetchAnalytics()
      } else {
        toast({
          title: 'Submission Failed',
          description: result.error || 'Failed to submit session',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error submitting for review:', error)
      toast({
        title: 'Submission Failed',
        description: 'An error occurred while submitting your session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle unsubmitting practice session from review
  const handleUnsubmitFromReview = async (session: any) => {
    try {
      const response = await apiFetch(`/api/analytics/unsubmit-from-review/${session.id}`, {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Unsubmitted from Review',
          description: 'Your practice session has been removed from Team Performance.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Refresh analytics to show updated status
        fetchAnalytics()
      } else {
        toast({
          title: 'Unsubmit Failed',
          description: result.error || 'Failed to unsubmit session',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error unsubmitting from review:', error)
      toast({
        title: 'Unsubmit Failed',
        description: 'An error occurred while unsubmitting your session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
        userId: profile?.id,
        orgId: session.org_id,
        templateId: session.template_id,
        assignmentId: session.assignment_id,
        assignmentTitle: selectedSession.template,
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
        if (profile?.id) {
          const response = await apiFetch(`/api/analytics/employee/${profile.id}?period=${timeRange}`)
          const result = await response.json()
          if (result.success) {
            setAnalyticsData(result.data)
          }
        }
      } else {
        const errorText = await response.text()
        if (import.meta.env.DEV) console.error('PDF generation failed:', errorText)
        throw new Error('Failed to generate PDF')
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error generating PDF:', error)
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
            Loading your analytics...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Performance Overview */}
        <Panel defaultSize={50} minSize={20} maxSize={80}>
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
            {/* Header */}
            <Box
              bg={headerBg}
              backdropFilter="blur(10px)"
              borderBottom="1px"
              borderColor={borderColor}
              px={6}
              py={5}
            >
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1} flex={1}>
                  <Heading
                    size="lg"
                    color={useColorModeValue('gray.900', 'white')}
                    fontWeight="600"
                    letterSpacing="-0.02em"
                  >
                    My Performance
                  </Heading>
                  <Text
                    fontSize="sm"
                    color={useColorModeValue('gray.500', 'gray.400')}
                    fontWeight="400"
                  >
                    Your training progress and achievements
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  <Select
                    value={statsFilter}
                    onChange={(e) => setStatsFilter(e.target.value as 'all' | 'practice' | 'assignment')}
                    size="sm"
                    bg={cardBg}
                    borderRadius="xl"
                    w="auto"
                    minW="140px"
                    border={`1px solid ${accentColor}`}
                    _hover={{ borderColor: accentColor }}
                    _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  >
                    <option value="all">All Sessions</option>
                    <option value="practice">Practice</option>
                    <option value="assignment">Assignments</option>
                  </Select>
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    size="sm"
                    bg={cardBg}
                    borderRadius="xl"
                    w="auto"
                    minW="120px"
                    border={`1px solid ${accentColor}`}
                    _hover={{ borderColor: accentColor }}
                    _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </Select>
                </HStack>
              </Flex>
            </Box>

            {/* Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={6} align="stretch">
                {/* Key Metrics */}
                <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4}>
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Total Sessions
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {filteredAnalytics?.totalSessions || 0}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {filteredAnalytics?.completedSessions || 0} completed
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Average Score
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {filteredAnalytics?.avgScore || 0}%
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {filteredAnalytics?.improvementRate > 0 ? '+' : ''}{filteredAnalytics?.improvementRate || 0}% change
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
                          {filteredAnalytics?.avgDuration || 0}m
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Per training session
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Cloze Rate
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {filteredAnalytics?.clozeRate || 0}%
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {filteredAnalytics?.closedSessions || 0} of {filteredAnalytics?.totalSessionsWithCloseStatus || 0} closed
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Playground Practice Stats */}
                {analyticsData?.playgroundStats && analyticsData.playgroundStats.length > 0 && (
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
                          <Icon as={Target} boxSize={5} color={accentColor} />
                          <Text>Practice History by Template</Text>
                        </HStack>
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        {analyticsData.playgroundStats.map((stat: any, index: number) => (
                          <Box
                            key={index}
                            p={4}
                            borderRadius="lg"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            borderWidth="1px"
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                          >
                            <Flex justify="space-between" align="start" mb={2}>
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.200')}>
                                  {stat.templateName}
                                </Text>
                                <HStack spacing={3}>
                                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                    {stat.count} {stat.count === 1 ? 'session' : 'sessions'}
                                  </Text>
                                  {stat.avgScore !== null && (
                                    <Badge colorScheme="orange" fontSize="xs">
                                      Avg: {stat.avgScore}%
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                {new Date(stat.lastPlayed).toLocaleDateString()}
                              </Text>
                            </Flex>
                            {stat.avgScore !== null && (
                              <Progress
                                value={stat.avgScore}
                                size="sm"
                                colorScheme={stat.avgScore >= 85 ? 'green' : stat.avgScore >= 70 ? 'orange' : 'yellow'}
                                borderRadius="full"
                                bg={useColorModeValue('gray.200', 'gray.600')}
                              />
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Skills Breakdown */}
                {filteredAnalytics?.skills && filteredAnalytics.skills.length > 0 && (
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
                          <Icon as={BarChart3} boxSize={5} color={accentColor} />
                          <Text>Skills Breakdown</Text>
                        </HStack>
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        {filteredAnalytics.skills.slice(0, 5).map((skill: any, index: number) => (
                          <Box key={index}>
                            <Flex justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="500" color={useColorModeValue('gray.600', 'gray.300')}>
                                {skill.skill}
                              </Text>
                              <Text fontSize="sm" fontWeight="600" color={skill.avgScore >= 85 ? 'green.500' : skill.avgScore >= 70 ? '#f26f25' : 'yellow.500'}>
                                {skill.avgScore}%
                              </Text>
                            </Flex>
                            <Progress
                              value={skill.avgScore}
                              size="sm"
                              colorScheme={skill.avgScore >= 85 ? 'green' : skill.avgScore >= 70 ? 'blue' : 'yellow'}
                              borderRadius="full"
                              bg={useColorModeValue('gray.200', 'gray.700')}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Score Trend */}
                {filteredAnalytics?.scoreTrend && filteredAnalytics.scoreTrend.length > 0 && (
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
                          <Icon as={TrendingUp} boxSize={5} color={accentColor} />
                          <Text>Score Trend</Text>
                        </HStack>
                      </Heading>
                      <VStack spacing={2} align="stretch">
                        {filteredAnalytics.scoreTrend.map((point: any, index: number) => (
                          <Flex key={index} justify="space-between" align="center" p={2}>
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                              {new Date(point.date).toLocaleDateString()}
                            </Text>
                            <Badge
                              colorScheme={point.score >= 85 ? 'green' : point.score >= 70 ? 'blue' : 'yellow'}
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {point.score}%
                            </Badge>
                          </Flex>
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

        {/* Right Panel - Recent Sessions */}
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
              bg={headerBg}
              backdropFilter="blur(10px)"
              borderBottom="1px"
              borderColor={borderColor}
              px={6}
              py={5}
            >
              <HStack justify="space-between" align="center" w="full">
                <VStack align="start" spacing={1}>
                  <Heading
                    size="lg"
                    color={useColorModeValue('gray.900', 'white')}
                    fontWeight="600"
                    letterSpacing="-0.02em"
                  >
                    Recent Sessions
                  </Heading>
                  <Text
                    fontSize="sm"
                    color={useColorModeValue('gray.500', 'gray.400')}
                    fontWeight="400"
                  >
                    Your training session history
                  </Text>
                </VStack>

                {/* Session Type Filter Dropdown (Right side, matches time filter) */}
                <Select
                  value={sessionListFilter}
                  onChange={(e) => setSessionListFilter(e.target.value as 'all' | 'practice' | 'assignment')}
                  size="sm"
                  w="auto"
                  minW="140px"
                  borderRadius="xl"
                  bg={cardBg}
                  border={`1px solid ${accentColor}`}
                  _hover={{ borderColor: accentColor }}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="all">All Sessions</option>
                  <option value="practice">Practice</option>
                  <option value="assignment">Assignments</option>
                </Select>
              </HStack>
            </Box>

            {/* Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={4} align="stretch">
                {analyticsData?.recentSessions && analyticsData.recentSessions
                  .filter((session: any) => {
                    if (sessionListFilter === 'all') return true
                    if (sessionListFilter === 'practice') return session.isPlayground === true
                    if (sessionListFilter === 'assignment') return session.isPlayground === false
                    return true
                  })
                  .length > 0 ? (
                  analyticsData.recentSessions
                    .filter((session: any) => {
                      if (sessionListFilter === 'all') return true
                      if (sessionListFilter === 'practice') return session.isPlayground === true
                      if (sessionListFilter === 'assignment') return session.isPlayground === false
                      return true
                    })
                    .map((session: any, index: number) => (
                      <React.Fragment key={index}>
                        <Card
                          bg={cardBg}
                          border="1px solid"
                          borderColor={selectedSession?.id === session.id ? accentColor : borderColor}
                          borderRadius="2xl"
                          shadow="sm"
                          _hover={{ shadow: 'md', borderColor: accentColor }}
                          transition="all 0.3s"
                        >
                          <CardBody p={4}>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between" align="start">
                                <VStack align="stretch" spacing={1} flex={1}>
                                  <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')} fontSize="sm">
                                    {session.template}
                                  </Text>
                                  <Flex gap={2} flexWrap="wrap" align="center">
                                    {session.closed !== null && (
                                      <Badge
                                        colorScheme={session.closed ? 'green' : 'red'}
                                        variant="subtle"
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Icon as={session.closed ? CheckCircle : XCircle} boxSize={3} />
                                        <Text>{session.closed ? 'Closed' : 'Not Closed'}</Text>
                                      </Badge>
                                    )}
                                    {session.isPlayground ? (
                                      <Badge
                                        colorScheme="orange"
                                        variant="subtle"
                                        fontSize="xs"
                                      >
                                        Practice
                                      </Badge>
                                    ) : (
                                      <Badge
                                        colorScheme={session.type === 'assignment' ? 'purple' : 'blue'}
                                        variant="subtle"
                                        fontSize="xs"
                                        textTransform="capitalize"
                                      >
                                        {session.type}
                                      </Badge>
                                    )}
                                    <Badge
                                      colorScheme={session.status === 'completed' ? 'green' : 'gray'}
                                      variant="subtle"
                                      fontSize="xs"
                                      textTransform="capitalize"
                                    >
                                      {session.status}
                                    </Badge>
                                    {session.submittedForReview && (
                                      <Badge
                                        colorScheme="purple"
                                        variant="solid"
                                        fontSize="xs"
                                      >
                                        Submitted
                                      </Badge>
                                    )}
                                  </Flex>
                                </VStack>
                                {session.score !== null && (
                                  <Badge
                                    colorScheme={session.score >= 85 ? 'green' : session.score >= 70 ? 'yellow' : 'red'}
                                    variant="subtle"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    fontSize="sm"
                                    fontWeight="600"
                                  >
                                    {session.score}%
                                  </Badge>
                                )}
                              </HStack>

                              <HStack justify="space-between" align="center">
                                <HStack spacing={4}>
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
                                {session.pdfUrl && (
                                  <Button
                                    as="a"
                                    href={session.pdfUrl}
                                    download
                                    size="xs"
                                    leftIcon={<Icon as={FileDown} boxSize={3} />}
                                    colorScheme="orange"
                                    variant="ghost"
                                  >
                                    PDF
                                  </Button>
                                )}
                              </HStack>

                              {/* Action Buttons */}
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
                              </HStack>
                              
                              {/* Submit/Unsubmit for Review Button - Only for practice sessions and non-admin users */}
                              {session.isPlayground && !userRole.isAdmin && (
                                <Button
                                  size="sm"
                                  colorScheme={session.submittedForReview ? 'red' : 'purple'}
                                  variant={session.submittedForReview ? 'outline' : 'solid'}
                                  onClick={() => session.submittedForReview ? handleUnsubmitFromReview(session) : handleSubmitForReview(session)}
                                  w="full"
                                  mt={2}
                                >
                                  {session.submittedForReview ? 'Unsubmit from Review' : 'Submit for Review'}
                                </Button>
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
                          <Card bg={cardBg} border="2px solid" borderColor={accentColor} borderRadius="2xl" shadow="lg">
                            <CardBody p={6}>
                              <VStack align="stretch" spacing={4}>
                                <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                                  Call Transcript
                                </Heading>
                                {loadingTranscript ? (
                                  <VStack py={8}>
                                    <Spinner color={accentColor} />
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
                          <Card bg={cardBg} border="2px solid" borderColor={accentColor} borderRadius="2xl" shadow="lg">
                            <CardBody p={6}>
                              <VStack align="stretch" spacing={4}>
                                <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                                  AI Call Summary
                                </Heading>
                                {loadingSummary ? (
                                  <VStack py={8}>
                                    <Spinner color={accentColor} />
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

                        {/* Loading indicator right after selected session */}
                        {selectedSession?.id === session.id && loadingGrade && (
                          <Card bg={cardBg} borderRadius="2xl">
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
                    ))
                ) : (
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                    <CardBody p={8}>
                      <VStack spacing={3}>
                        <Icon as={BarChart3} boxSize={12} color={useColorModeValue('gray.300', 'gray.600')} />
                        <Text color={useColorModeValue('gray.500', 'gray.400')}>
                          No sessions in this period
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Load More Button */}
                {hasMoreSessions && analyticsData?.recentSessions && analyticsData.recentSessions.length > 0 && (
                  <Button
                    onClick={() => fetchAnalytics(true)}
                    isLoading={loadingMore}
                    loadingText="Loading more..."
                    colorScheme="orange"
                    variant="outline"
                    size="md"
                    width="full"
                  >
                    Load More Sessions
                  </Button>
                )}
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

      {/* Closed Evidence Modal */}
      <Modal isOpen={isClosedModalOpen} onClose={onClosedModalClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent maxW="600px" mx={4}>
          <ModalHeader pr={12}>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" fontWeight="700" color={useColorModeValue('gray.900', 'white')} pr={8}>
                Close Status
              </Text>
              {selectedClosedSession && (
                <Badge
                  colorScheme={selectedClosedSession.closed ? 'green' : 'red'}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="sm"
                >
                  <HStack spacing={1}>
                    <Icon as={selectedClosedSession.closed ? CheckCircle : XCircle} boxSize={4} />
                    <Text>{selectedClosedSession.closed ? 'Call Closed' : 'Call Not Closed'}</Text>
                  </HStack>
                </Badge>
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />
          <ModalBody pb={6}>
            {selectedClosedSession && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                    AI Analysis:
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} whiteSpace="pre-wrap">
                    {selectedClosedSession.closedEvidence || 'No evidence available. The AI determined this call was ' + (selectedClosedSession.closed ? 'successfully closed' : 'not closed') + ' based on the conversation transcript.'}
                  </Text>
                </Box>
                {selectedClosedSession.template && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                        Template: {selectedClosedSession.template}
                      </Text>
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                        Date: {new Date(selectedClosedSession.date).toLocaleString()}
                      </Text>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClosedModalClose} colorScheme="orange">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default MyAnalytics


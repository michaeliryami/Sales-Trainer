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
  useToast
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
  FileDown
} from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useProfile } from '../contexts/ProfileContext'
import { useLocation, useNavigate } from 'react-router-dom'

const Analytics: React.FC = () => {
  const { organization } = useProfile()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionGrade, setSessionGrade] = useState<any>(null)
  const [loadingGrade, setLoadingGrade] = useState(false)
  const [filterAssignmentId, setFilterAssignmentId] = useState<number | null>(null)
  const [manualGrade, setManualGrade] = useState<number>(0)
  const [savingManualGrade, setSavingManualGrade] = useState(false)
  const [criteriaOverrides, setCriteriaOverrides] = useState<{[key: number]: {score: number, reasoning: string, evidence: string}}>({})
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const toast = useToast()
  
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
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  // Fetch real analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!organization?.id) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/admin/${organization.id}?period=${timeRange}`)
        const result = await response.json()
        
        if (result.success) {
          setAnalyticsData(result.data)
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
      }
    }

    fetchAnalytics()
  }, [timeRange, organization])

  // Fetch grade details when session is selected
  const fetchSessionGrade = async (sessionId: number) => {
    setLoadingGrade(true)
    try {
      const response = await fetch(`/api/analytics/session-grade/${sessionId}`)
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

  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
    if (session.hasGrade && session.sessionType === 'assignment') {
      fetchSessionGrade(session.id)
    } else {
      setSessionGrade(null)
    }
    // Initialize manual grade fields
    setManualGrade(Math.round(session.score || 0))
    setCriteriaOverrides({})
  }

  const generatePdf = async () => {
    if (!selectedSession || !sessionGrade) return
    
    setGeneratingPdf(true)
    try {
      // Fetch the full session data from backend
      const sessionResponse = await fetch(`/api/analytics/session-data/${selectedSession.id}`)
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

      const response = await fetch('/api/export/transcript-pdf', {
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
          const response = await fetch(`/api/analytics/admin/${organization.id}?period=${timeRange}`)
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

  const saveManualGradeOverride = async () => {
    if (!selectedSession || !sessionGrade) return
    
    setSavingManualGrade(true)
    try {
      // Apply criteria overrides to the existing criteria grades
      const updatedCriteriaGrades = sessionGrade.criteria_grades?.map((criteria: any, idx: number) => {
        const override = criteriaOverrides[idx]
        if (override) {
          return {
            ...criteria,
            earnedPoints: override.score,
            reasoning: override.reasoning || criteria.reasoning,
            evidence: override.evidence ? [override.evidence] : criteria.evidence,
            isManualOverride: true
          }
        }
        return criteria
      }) || []

      // Calculate total score from criteria (if we have overrides) or use manual grade
      let finalTotalScore = manualGrade
      let finalMaxScore = 100

      if (Object.keys(criteriaOverrides).length > 0 && updatedCriteriaGrades.length > 0) {
        // Calculate from criteria
        finalTotalScore = updatedCriteriaGrades.reduce((sum: number, c: any) => sum + (c.earnedPoints || 0), 0)
        finalMaxScore = updatedCriteriaGrades.reduce((sum: number, c: any) => sum + (c.maxPoints || 0), 0)
      }

      const response = await fetch('/api/analytics/manual-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedSession.userId,
          assignmentId: selectedSession.assignmentId,
          totalScore: finalTotalScore,
          maxScore: finalMaxScore,
          criteriaGrades: updatedCriteriaGrades,
          isManualOverride: true
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Grade Saved',
          description: 'Manual grade override has been saved successfully',
          status: 'success',
          duration: 3000,
        })
        // Refresh grade data for the selected session
        if (selectedSession.id) {
          fetchSessionGrade(selectedSession.id)
        }
        // Refresh entire analytics data to update top performers leaderboard
        if (organization?.id) {
          const analyticsResponse = await fetch(`/api/analytics/admin/${organization.id}?period=${timeRange}`)
          const analyticsResult = await analyticsResponse.json()
          if (analyticsResult.success) {
            setAnalyticsData(analyticsResult.data)
          }
        }
      } else {
        throw new Error(result.error || 'Failed to save grade')
      }
    } catch (error) {
      console.error('Error saving manual grade:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save grade',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSavingManualGrade(false)
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
                    Training performance and insights
                  </Text>
                </VStack>
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
                            <Badge colorScheme="blue" variant="outline" borderRadius="full" px={3} py={1}>
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

        {/* Resize Handle - Invisible but functional */}
        <PanelResizeHandle>
          <Box 
            w="1px" 
            h="full" 
            bg="transparent"
            _hover={{ 
              bg: useColorModeValue('gray.200', 'gray.700'),
              w: "2px"
            }}
            transition="all 0.2s"
            cursor="col-resize"
            position="relative"
          />
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
                  <Card 
                    key={index}
                    bg={selectedSession?.id === session.id ? useColorModeValue('blue.50', 'blue.900/20') : cardBg}
                    border="1px solid"
                    borderColor={selectedSession?.id === session.id ? accentColor : borderColor}
                    borderRadius="2xl"
                    shadow="sm"
                    _hover={{ shadow: 'md', borderColor: accentColor, cursor: session.sessionType === 'assignment' ? 'pointer' : 'default' }}
                    transition="all 0.3s"
                    onClick={() => session.sessionType === 'assignment' && handleSessionClick(session)}
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
                              colorScheme="blue"
                              variant="ghost"
                            >
                              PDF
                            </Button>
                          )}
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
                
                {/* Grade Breakdown Section */}
                {selectedSession && sessionGrade && (
                  <Card bg={cardBg} border="2px solid" borderColor={accentColor} borderRadius="2xl" shadow="lg" mt={4}>
                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2}>
                            <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                              Grade Breakdown
                            </Heading>
                            {selectedSession?.pdfUrl ? (
                              <Button
                                as="a"
                                href={selectedSession.pdfUrl}
                                download
                                leftIcon={<Icon as={FileDown} />}
                                size="sm"
                                colorScheme="blue"
                                variant="outline"
                              >
                                Download PDF Report
                              </Button>
                            ) : (
                              <Button
                                leftIcon={<Icon as={FileDown} />}
                                size="sm"
                                colorScheme="blue"
                                variant="outline"
                                onClick={generatePdf}
                                isLoading={generatingPdf}
                              >
                                Generate PDF Report
                              </Button>
                            )}
                          </VStack>
                          <Badge 
                            colorScheme={sessionGrade.percentage >= 85 ? 'green' : sessionGrade.percentage >= 70 ? 'blue' : 'red'}
                            variant="solid"
                            borderRadius="full"
                            px={4}
                            py={2}
                            fontSize="lg"
                            fontWeight="700"
                          >
                            {Math.round(sessionGrade.percentage)}%
                          </Badge>
                        </HStack>
                        
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                          {sessionGrade.total_score} / {sessionGrade.max_possible_score} points
                        </Text>
                        
                        <Divider />
                        
                        {/* Individual Criteria */}
                        <VStack spacing={4} align="stretch">
                          {sessionGrade.criteria_grades?.map((criteria: any, idx: number) => {
                            const override = criteriaOverrides[idx]
                            const displayScore = override?.score ?? criteria.earnedPoints
                            
                            return (
                              <Box key={idx} p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="xl">
                                <VStack align="stretch" spacing={3}>
                                  <HStack justify="space-between">
                                    <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                                      {criteria.title}
                                    </Text>
                                    <Badge 
                                      colorScheme={
                                        (displayScore / criteria.maxPoints) >= 0.85 ? 'green' : 
                                        (displayScore / criteria.maxPoints) >= 0.70 ? 'blue' : 'orange'
                                      }
                                      borderRadius="full"
                                      px={3}
                                      py={1}
                                    >
                                      {displayScore}/{criteria.maxPoints}
                                    </Badge>
                                  </HStack>
                                  
                                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} fontStyle="italic">
                                    {criteria.description}
                                  </Text>
                                  
                                  {criteria.evidence && criteria.evidence.length > 0 && (
                                    <Box mt={1}>
                                      <Text fontSize="xs" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')} mb={1}>
                                        Evidence:
                                      </Text>
                                      {criteria.evidence.map((ev: string, i: number) => (
                                        <Text key={i} fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} pl={3} borderLeft="2px solid" borderColor={useColorModeValue('gray.300', 'gray.600')} mb={1}>
                                          "{ev}"
                                        </Text>
                                      ))}
                                    </Box>
                                  )}
                                  
                                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                                    <strong>{criteria.isManualOverride ? 'Reasoning:' : 'AI Reasoning:'}</strong> {criteria.reasoning}
                                  </Text>
                                  
                                  <Divider />
                                  
                                  {/* Manual Override for this Criterion */}
                                  <Box p={3} bg={useColorModeValue('blue.50', 'blue.900/10')} borderRadius="md">
                                    <VStack align="stretch" spacing={2}>
                                      <Text fontSize="xs" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')}>
                                        Override:
                                      </Text>
                                      
                                      <HStack>
                                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>Score:</Text>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={criteria.maxPoints}
                                          value={override?.score ?? criteria.earnedPoints}
                                          onChange={(e) => setCriteriaOverrides(prev => ({
                                            ...prev,
                                            [idx]: {
                                              score: parseInt(e.target.value) || 0,
                                              reasoning: prev[idx]?.reasoning || '',
                                              evidence: prev[idx]?.evidence || ''
                                            }
                                          }))}
                                          size="xs"
                                          w="80px"
                                          bg={cardBg}
                                        />
                                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                                          / {criteria.maxPoints} points
                                        </Text>
                                      </HStack>
                                      
                                      <VStack align="stretch" spacing={1}>
                                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>Evidence:</Text>
                                        <Textarea
                                          placeholder="Override evidence quote..."
                                          value={override?.evidence || ''}
                                          onChange={(e) => setCriteriaOverrides(prev => ({
                                            ...prev,
                                            [idx]: {
                                              score: prev[idx]?.score ?? criteria.earnedPoints,
                                              reasoning: prev[idx]?.reasoning || '',
                                              evidence: e.target.value
                                            }
                                          }))}
                                          size="xs"
                                          rows={2}
                                          fontSize="xs"
                                          bg={cardBg}
                                        />
                                      </VStack>
                                      
                                      <VStack align="stretch" spacing={1}>
                                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>Reasoning:</Text>
                                        <Textarea
                                          placeholder="Override reasoning..."
                                          value={override?.reasoning || ''}
                                          onChange={(e) => setCriteriaOverrides(prev => ({
                                            ...prev,
                                            [idx]: {
                                              score: prev[idx]?.score ?? criteria.earnedPoints,
                                              reasoning: e.target.value,
                                              evidence: prev[idx]?.evidence || ''
                                            }
                                          }))}
                                          size="xs"
                                          rows={2}
                                          fontSize="xs"
                                          bg={cardBg}
                                        />
                                      </VStack>
                                    </VStack>
                                  </Box>
                                </VStack>
                              </Box>
                            )
                          })}
                        </VStack>
                        
                        {/* Save Button */}
                        <Button
                          colorScheme="green"
                          size="md"
                          onClick={saveManualGradeOverride}
                          isLoading={savingManualGrade}
                          width="full"
                        >
                          Save All Overrides
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
                
                {loadingGrade && (
                  <Card bg={cardBg} borderRadius="2xl" mt={4}>
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
              </VStack>
            </Box>
          </Box>
        </Panel>
      </PanelGroup>
    </Box>
  )
}

export default Analytics

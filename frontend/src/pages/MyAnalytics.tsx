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
  Button
} from '@chakra-ui/react'
import { 
  TrendingUp, 
  Target,
  Calendar,
  BarChart3,
  Clock,
  FileDown
} from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useProfile } from '../contexts/ProfileContext'
import { useToast } from '@chakra-ui/react'
import apiFetch from '../utils/api'

const MyAnalytics: React.FC = () => {
  const { profile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionGrade, setSessionGrade] = useState<any>(null)
  const [loadingGrade, setLoadingGrade] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const toast = useToast()

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('white', 'gray.800')
  const accentColor = useColorModeValue('#f26f25', '#ff7d31')

  // Fetch employee analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile?.id) return
      
      setLoading(true)
      try {
        const response = await apiFetch(`/api/analytics/employee/${profile.id}?period=${timeRange}`)
        const result = await response.json()
        
        console.log('📊 Analytics data received:', result)
        console.log('📋 Recent sessions:', result?.data?.recentSessions)
        
        if (result.success) {
          setAnalyticsData(result.data)
        } else {
          console.error('Failed to fetch analytics:', result.error)
          setAnalyticsData(null)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setAnalyticsData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange, profile])

  // Fetch grade details when session is selected
  const fetchSessionGrade = async (sessionId: number) => {
    setLoadingGrade(true)
    try {
      console.log('Fetching grade for session ID:', sessionId)
      const response = await apiFetch(`/api/analytics/session-grade/${sessionId}`)
      const result = await response.json()
      
      console.log('Grade fetch result:', result)
      
      if (result.success) {
        console.log('Setting session grade:', result.data)
        setSessionGrade(result.data)
      } else {
        console.log('No grade found in result')
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
    console.log('Session clicked:', session)
    console.log('Has grade?', session.hasGrade)
    
    // Toggle selection - if clicking the same session, deselect it
    if (selectedSession?.id === session.id) {
      setSelectedSession(null)
      setSessionGrade(null)
      return
    }
    
    setSelectedSession(session)
    if (session.hasGrade) {
      console.log('Fetching grade for session:', session.id)
      fetchSessionGrade(session.id)
    } else {
      console.log('No grade for this session')
      setSessionGrade(null)
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
                  <option value="all">All time</option>
                </Select>
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
                          {analyticsData?.totalSessions || 0}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {analyticsData?.completedSessions || 0} completed
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
                          {analyticsData?.avgScore || 0}%
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {analyticsData?.improvementRate > 0 ? '+' : ''}{analyticsData?.improvementRate || 0}% change
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
                          {analyticsData?.avgDuration || 0}m
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
                          Current Streak
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.currentStreak || 0}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {analyticsData?.longestStreak || 0} longest
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Assignment Progress */}
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
                        <Text>Assignment Progress</Text>
                      </HStack>
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="500" color={useColorModeValue('gray.600', 'gray.300')}>
                            Completed
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="green.500">
                            {analyticsData?.assignmentsCompleted || 0}/{analyticsData?.totalAssignments || 0}
                          </Text>
                        </Flex>
                        <Progress 
                          value={analyticsData?.totalAssignments > 0 ? (analyticsData.assignmentsCompleted / analyticsData.totalAssignments) * 100 : 0}
                          size="md" 
                          colorScheme="green" 
                          borderRadius="full"
                          bg={useColorModeValue('gray.200', 'gray.700')}
                        />
                      </Box>
                      <Divider />
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mb={1}>
                            Pending
                          </Text>
                          <Text fontSize="lg" fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                            {analyticsData?.assignmentsPending || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mb={1}>
                            Total
                          </Text>
                          <Text fontSize="lg" fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                            {analyticsData?.totalAssignments || 0}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>

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
                {analyticsData?.skills && analyticsData.skills.length > 0 && (
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
                        {analyticsData.skills.slice(0, 5).map((skill: any, index: number) => (
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
                {analyticsData?.scoreTrend && analyticsData.scoreTrend.length > 0 && (
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
                        {analyticsData.scoreTrend.map((point: any, index: number) => (
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
            </Box>

            {/* Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={4} align="stretch">
                {analyticsData?.recentSessions && analyticsData.recentSessions.length > 0 ? (
                  analyticsData.recentSessions.map((session: any, index: number) => (
                    <React.Fragment key={index}>
                      <Card 
                        bg={selectedSession?.id === session.id ? useColorModeValue('orange.50', 'orange.900/20') : cardBg}
                        border="1px solid"
                        borderColor={selectedSession?.id === session.id ? accentColor : borderColor}
                        borderRadius="2xl"
                        shadow="sm"
                        _hover={{ shadow: 'md', borderColor: accentColor, cursor: session.hasGrade ? 'pointer' : 'default' }}
                        transition="all 0.3s"
                        onClick={() => session.hasGrade && handleSessionClick(session)}
                      >
                        <CardBody p={4}>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')} fontSize="sm">
                                  {session.template}
                                </Text>
                                <HStack spacing={2}>
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
                                </HStack>
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
                          </VStack>
                        </CardBody>
                      </Card>
                      
                      {/* Grade Breakdown Section - Show right after selected session */}
                      {selectedSession?.id === session.id && sessionGrade && !loadingGrade && (
                      <Card bg={cardBg} border="2px solid" borderColor={accentColor} borderRadius="2xl" shadow="lg" ml={4}>
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
                                    colorScheme="orange"
                                    variant="outline"
                                  >
                                    Download PDF Report
                                  </Button>
                                ) : (
                                  <Button
                                    leftIcon={<Icon as={FileDown} />}
                                    size="sm"
                                    colorScheme="orange"
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
                              {sessionGrade.criteria_grades?.map((criteria: any, idx: number) => (
                                <Box key={idx} p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="xl">
                                  <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                      <Text fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                                        {criteria.title}
                                      </Text>
                                      <Badge 
                                        colorScheme={
                                          (criteria.earnedPoints / criteria.maxPoints) >= 0.85 ? 'green' : 
                                          (criteria.earnedPoints / criteria.maxPoints) >= 0.70 ? 'blue' : 'orange'
                                        }
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                      >
                                        {criteria.earnedPoints}/{criteria.maxPoints}
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
                                      <strong>{criteria.isManualOverride ? 'Feedback:' : 'AI Reasoning:'}</strong> {criteria.reasoning}
                                    </Text>
                                  </VStack>
                                </Box>
                              ))}
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                    
                    {/* Loading indicator right after selected session */}
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
                  ))
                ) : (
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                    <CardBody p={8}>
                      <VStack spacing={3}>
                        <Icon as={BarChart3} boxSize={12} color={useColorModeValue('gray.300', 'gray.600')} />
                        <Text color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          No training sessions yet
                        </Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.500')} textAlign="center">
                          Complete your first assignment to see your stats here
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

export default MyAnalytics


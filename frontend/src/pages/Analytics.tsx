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
  AlertIcon
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
  Zap
} from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useProfile } from '../contexts/ProfileContext'

const Analytics: React.FC = () => {
  const { organization } = useProfile()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const headerBg = useColorModeValue('gray.50/80', 'gray.800/80')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  // Mock analytics data - replace with real API calls
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        setAnalyticsData({
          totalSessions: 47,
          totalUsers: 12,
          avgSessionDuration: 18.5,
          completionRate: 84.2,
          topTemplates: [
            { name: 'Skeptical CFO', sessions: 15, successRate: 78 },
            { name: 'Busy Entrepreneur', sessions: 12, successRate: 85 },
            { name: 'Concerned Parent', sessions: 10, successRate: 92 },
            { name: 'Price Shopper', sessions: 8, successRate: 65 }
          ],
          recentSessions: [
            { user: 'Michael Iryami', template: 'Skeptical CFO', duration: '22m', score: 85, date: '2024-01-15' },
            { user: 'Sarah Johnson', template: 'Busy Entrepreneur', duration: '18m', score: 92, date: '2024-01-15' },
            { user: 'David Chen', template: 'Concerned Parent', duration: '25m', score: 88, date: '2024-01-14' },
            { user: 'Lisa Wang', template: 'Price Shopper', duration: '16m', score: 72, date: '2024-01-14' }
          ],
          weeklyStats: {
            sessions: [8, 12, 6, 15, 9, 11, 7],
            completion: [85, 78, 92, 88, 76, 89, 82]
          }
        })
        setLoading(false)
      }, 1000)
    }

    fetchAnalytics()
  }, [timeRange])

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
                    Analytics Dashboard
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.500', 'gray.400')}
                    fontWeight="400"
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
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
                    <CardBody p={4}>
                      <Stat>
                        <StatLabel fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                          Total Sessions
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue('gray.900', 'white')} fontWeight="700">
                          {analyticsData?.totalSessions || 0}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          12% from last week
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
                        <StatHelpText>
                          <StatArrow type="increase" />
                          3 new this week
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
                        <StatHelpText>
                          <StatArrow type="increase" />
                          2m longer than last week
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
                        <StatHelpText>
                          <StatArrow type="increase" />
                          5% improvement
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
              </VStack>
            </Box>
          </Box>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle>
          <Box 
            w="1px" 
            h="full" 
            bg={borderColor}
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
              borderColor={borderColor}
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
                  Recent Activity
                </Heading>
                <Text 
                  fontSize="sm" 
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontWeight="400"
                >
                  Latest training sessions
                </Text>
              </VStack>
            </Box>

            {/* Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={4} align="stretch">
                {analyticsData?.recentSessions?.map((session: any, index: number) => (
                  <Card 
                    key={index}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    shadow="sm"
                    _hover={{ shadow: 'md' }}
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
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>
          </Box>
        </Panel>
      </PanelGroup>
    </Box>
  )
}

export default Analytics

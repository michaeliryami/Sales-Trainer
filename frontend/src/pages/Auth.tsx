import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  Spinner,
  Container,
  Grid,
  GridItem,
  Image
} from '@chakra-ui/react'
import { Zap, TrendingUp, Users, Target, Award, BarChart3 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Login from '../components/auth/Login'
import SignUp from '../components/auth/SignUp'
import ForgotPassword from '../components/auth/ForgotPassword'

type AuthMode = 'login' | 'signup' | 'forgot-password'

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth()
  
  const bg = useColorModeValue('gray.50', 'gray.900')
  const brandColor = useColorModeValue('#f26f25', '#ff7d31')
  const cardBg = useColorModeValue('white', 'gray.800')
  const leftPanelBg = useColorModeValue('#f26f25', '#d95e1e')

  // Redirect authenticated users to the app
  useEffect(() => {
    if (!loading && user) {
      console.log('User is authenticated, redirecting to app')
      // Get the intended destination from location state, or default to home
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [user, loading, navigate, location.state])

  const renderAuthComponent = () => {
    switch (mode) {
      case 'signup':
        return <SignUp onToggleMode={() => setMode('login')} />
      case 'forgot-password':
        return <ForgotPassword onBack={() => setMode('login')} />
      default:
        return (
          <Login
            onToggleMode={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )
    }
  }

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack spacing={4}>
          <Box
            w={16}
            h={16}
            bg="linear-gradient(135deg, #3b82f6, #2563eb)"
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shadow="xl"
            position="relative"
            animation="pulse 2s infinite"
          >
            <Icon as={Zap} color="white" boxSize={8} />
          </Box>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg" fontWeight="500">
            Loading clozone.ai...
          </Text>
        </VStack>
      </Box>
    )
  }

  const features = [
    {
      icon: Target,
      title: "AI-Powered Training",
      description: "Practice with intelligent AI customers that adapt to your skill level"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track your progress with detailed metrics and insights"
    },
    {
      icon: Award,
      title: "Skill Assessment",
      description: "Get evaluated on real sales scenarios with custom rubrics"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Assign training sessions and monitor team performance"
    }
  ]

  return (
    <Box bg={bg} minH="100vh">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} minH="100vh">
        {/* Left Panel - Branding & Features */}
        <GridItem 
          bg={leftPanelBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
          position="relative"
          overflow="hidden"
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            opacity={0.1}
            backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px)"
            backgroundSize="50px 50px"
          />
          
          <VStack spacing={12} maxW="500px" color="white" zIndex={1}>
            {/* Logo & Brand */}
            <VStack spacing={6} textAlign="center">
              <Box
                w={24}
                h={24}
                bg="rgba(255, 255, 255, 0.15)"
                backdropFilter="blur(10px)"
                borderRadius="3xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="2xl"
                border="1px solid rgba(255, 255, 255, 0.2)"
              >
                <Icon as={Zap} color="white" boxSize={12} />
              </Box>
              <Box>
                <Heading 
                  size="3xl" 
                  color="white"
                  mb={4}
                  fontWeight="800"
                  letterSpacing="-0.02em"
                >
                  clozone.ai
                </Heading>
                <Text 
                  color="white"
                  fontSize="xl"
                  fontWeight="400"
                  maxW="400px"
                  lineHeight="1.6"
                >
                  Transform your sales team with AI-powered training that adapts, evaluates, and accelerates performance
                </Text>
              </Box>
            </VStack>

            {/* Features Grid */}
            <Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
              {features.map((feature, index) => (
                <VStack 
                  key={index}
                  spacing={3} 
                  align="start"
                  p={4}
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.15)"
                  transition="all 0.3s"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.15)",
                    transform: "translateY(-2px)"
                  }}
                >
                  <Icon as={feature.icon} boxSize={6} color="blue.100" />
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="white" mb={1}>
                      {feature.title}
                    </Text>
                    <Text fontSize="xs" color="blue.100" lineHeight="1.4">
                      {feature.description}
                    </Text>
                  </Box>
                </VStack>
              ))}
            </Grid>

            {/* Stats */}
            <HStack spacing={8} pt={4}>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="700" color="white">10k+</Text>
                <Text fontSize="sm" color="blue.100">Training Sessions</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="700" color="white">95%</Text>
                <Text fontSize="sm" color="blue.100">Skill Improvement</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="700" color="white">500+</Text>
                <Text fontSize="sm" color="blue.100">Sales Teams</Text>
              </VStack>
            </HStack>
          </VStack>
        </GridItem>

        {/* Right Panel - Auth Form */}
        <GridItem 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          p={8}
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          <Box w="full" maxW="450px">
            {renderAuthComponent()}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default Auth

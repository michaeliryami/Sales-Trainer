import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  Spinner
} from '@chakra-ui/react'
import { Zap } from 'lucide-react'
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
  const brandColor = useColorModeValue('brand.600', 'brand.400')

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
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Checking authentication...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center" p={4}>
      <VStack spacing={8} w="full" maxW="400px">
        {/* Logo/Brand */}
        <VStack spacing={4}>
          <Box
            w={16}
            h={16}
            bg={brandColor}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Zap} color="white" boxSize={8} />
          </Box>
          <Box textAlign="center">
            <Heading 
              size="xl" 
              color={useColorModeValue('gray.900', 'white')}
              mb={2}
            >
              Sales Trainer
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Master your sales skills with AI-powered training
            </Text>
          </Box>
        </VStack>

        {/* Auth Component */}
        {renderAuthComponent()}
      </VStack>
    </Box>
  )
}

export default Auth

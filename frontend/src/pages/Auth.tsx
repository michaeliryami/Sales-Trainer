import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Icon,
  Container
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
      <Box 
        bg="white"
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        p={4}
        position="relative"
        overflow="hidden"
        sx={{
          backgroundImage: 'radial-gradient(rgba(242, 111, 37, 0.35) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px',
        }}
      >
        
        <VStack spacing={4} position="relative" zIndex={1}>
          <Box
            w={16}
            h={16}
            bg="#f26f25"
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

  return (
    <Box 
      bg="white"
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p={4}
      position="relative"
      overflow="hidden"
      sx={{
        backgroundImage: 'radial-gradient(rgba(242, 111, 37, 0.35) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }}
    >
      
      <Container maxW="container.sm" position="relative" zIndex={1}>
        {renderAuthComponent()}
      </Container>
    </Box>
  )
}

export default Auth

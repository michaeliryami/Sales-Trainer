import React, { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Button,
  useColorModeValue,
  Icon
} from '@chakra-ui/react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'

const AuthCallbackSimple: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const bg = useColorModeValue('gray.50', 'gray.900')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Let Supabase handle the auth callback automatically
        const { data, error } = await supabase.auth.getSession()
        
        console.log('Simple AuthCallback - Session check:', { data, error })
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
        } else if (data.session) {
          console.log('Session found:', data.session.user.email)
          setSuccess(true)
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
        } else {
          console.log('No session found, waiting for auth state change...')
          // Wait a moment for auth state to update
          setTimeout(async () => {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
            if (sessionError) {
              setError(sessionError.message)
            } else if (sessionData.session) {
              setSuccess(true)
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 1500)
            } else {
              setError('Email confirmation failed. Please try clicking the link again or contact support.')
            }
            setLoading(false)
          }, 2000)
          return // Don't set loading to false yet
        }
      } catch (err: any) {
        console.error('Callback error:', err)
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthCallback - Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session) {
          setSuccess(true)
          setLoading(false)
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSuccess(true)
          setLoading(false)
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
        }
      }
    )

    handleAuthCallback()

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Confirming your email...
          </Text>
          <Text color={useColorModeValue('gray.500', 'gray.500')} fontSize="sm">
            This may take a few moments
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack spacing={6} maxW="400px" textAlign="center">
          <Icon as={XCircle} boxSize={16} color="red.500" />
          <Box>
            <Heading size="lg" color={useColorModeValue('gray.900', 'white')} mb={2}>
              Confirmation Failed
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')} mb={4}>
              {error}
            </Text>
            <Text color={useColorModeValue('gray.500', 'gray.500')} fontSize="sm">
              Please try clicking the confirmation link in your email again, or contact support if the problem persists.
            </Text>
          </Box>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/auth')}
          >
            Back to Sign In
          </Button>
        </VStack>
      </Box>
    )
  }

  if (success) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack spacing={6} maxW="400px" textAlign="center">
          <Icon as={CheckCircle} boxSize={16} color="green.500" />
          <Box>
            <Heading size="lg" color={useColorModeValue('gray.900', 'white')} mb={2}>
              Email Confirmed!
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Your email has been successfully confirmed. Welcome to Sales Trainer!
            </Text>
          </Box>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/')}
          >
            Continue to App
          </Button>
        </VStack>
      </Box>
    )
  }

  return null
}

export default AuthCallbackSimple

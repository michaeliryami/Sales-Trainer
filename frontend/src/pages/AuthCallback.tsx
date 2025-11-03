import React, { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useColorModeValue,
  Icon
} from '@chakra-ui/react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../config/supabase'

const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const bg = 'gray.50'

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Debug logging
        console.log('AuthCallback - Current URL:', window.location.href)
        console.log('AuthCallback - Search params:', Object.fromEntries(searchParams.entries()))
        console.log('AuthCallback - Hash:', window.location.hash)
        
        // First, try to get the code from URL parameters (PKCE flow)
        const code = searchParams.get('code')
        
        if (code) {
          console.log('AuthCallback - Found code, using PKCE flow:', code)
          // PKCE flow - exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            setError(error.message || 'Failed to confirm email')
          } else if (data.session) {
            setSuccess(true)
            // Redirect to the main app after a short delay
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 2000)
          }
        } else {
          console.log('AuthCallback - No code found, checking for implicit flow tokens')
          // Check for implicit flow tokens in URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const tokenType = hashParams.get('token_type')
          const type = hashParams.get('type')
          
          console.log('AuthCallback - Hash params:', {
            accessToken: accessToken ? 'present' : 'missing',
            refreshToken: refreshToken ? 'present' : 'missing',
            tokenType,
            type
          })
          
          if (accessToken && type === 'signup') {
            console.log('AuthCallback - Found implicit flow tokens, setting session')
            // Implicit flow - set the session directly
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            
            if (error) {
              setError(error.message || 'Failed to confirm email')
            } else if (data.session) {
              setSuccess(true)
              // Redirect to the main app after a short delay
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 2000)
            }
          } else {
            // Try to get session from Supabase (might be already set)
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
              setError(error.message || 'Failed to get session')
            } else if (session) {
              setSuccess(true)
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 2000)
            } else {
              setError('No confirmation code or tokens found in URL. Please try clicking the confirmation link again.')
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, navigate])

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={'gray.600'}>
            Confirming your email...
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
            <Heading size="lg" color={'gray.900'} mb={2}>
              Confirmation Failed
            </Heading>
            <Text color={'gray.600'} mb={4}>
              {error}
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
            <Heading size="lg" color={'gray.900'} mb={2}>
              Email Confirmed!
            </Heading>
            <Text color={'gray.600'}>
              Your email has been successfully confirmed. You'll be redirected to the app shortly.
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

export default AuthCallback

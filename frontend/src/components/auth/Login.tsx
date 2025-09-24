import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Link,
  useColorModeValue,
  Card,
  CardBody,
  Divider,
  Icon,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface LoginProps {
  onToggleMode: () => void
  onForgotPassword: () => void
}

const Login: React.FC<LoginProps> = ({ onToggleMode, onForgotPassword }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    console.log('Login attempt for:', email)
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      console.error('Login error:', error)
      
      // Handle different types of authentication errors
      if (error.message?.includes('Email not confirmed') || 
          error.message?.includes('email_not_confirmed') ||
          error.message?.includes('signup_disabled')) {
        setError('Please check your email and click the verification link before signing in.')
      } else if (error.message?.includes('Invalid login credentials') || 
                 error.message?.includes('invalid_credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message?.includes('Too many requests')) {
        setError('Too many sign-in attempts. Please wait a moment and try again.')
      } else {
        setError(error.message || 'Failed to sign in. Please try again.')
      }
    } else if (data.session) {
      console.log('Login successful for:', email)
    }
    
    setLoading(false)
  }

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="lg" maxW="400px" w="full">
      <CardBody p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="lg" color={useColorModeValue('gray.900', 'white')} mb={2}>
              Welcome Back
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Sign in to your Sales Trainer account
            </Text>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={useColorModeValue('gray.700', 'gray.300')}>
                  Email Address
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={Mail} color={useColorModeValue('gray.400', 'gray.500')} />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    bg={useColorModeValue('white', 'gray.700')}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    _hover={{
                      borderColor: useColorModeValue('gray.400', 'gray.500')
                    }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px blue.500'
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={useColorModeValue('gray.700', 'gray.300')}>
                  Password
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={Lock} color={useColorModeValue('gray.400', 'gray.500')} />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    bg={useColorModeValue('white', 'gray.700')}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    _hover={{
                      borderColor: useColorModeValue('gray.400', 'gray.500')
                    }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px blue.500'
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={() => setShowPassword(!showPassword)}
                    zIndex={2}
                  >
                    <Icon as={showPassword ? EyeOff : Eye} boxSize={4} />
                  </Button>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>

          {/* Forgot Password Link */}
          <Box textAlign="center">
            <Link
              color="blue.500"
              onClick={onForgotPassword}
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
            >
              Forgot your password?
            </Link>
          </Box>


          <Divider />

          {/* Sign Up Link */}
          <Box textAlign="center">
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Don't have an account?{' '}
              <Link
                color="blue.500"
                onClick={onToggleMode}
                cursor="pointer"
                fontWeight="semibold"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign up
              </Link>
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default Login

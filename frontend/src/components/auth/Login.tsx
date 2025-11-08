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
  Icon,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react'
import ModernDivider from '../ModernDivider'
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
    <Box w="full">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            color={useColorModeValue('gray.900', 'white')} 
            mb={3}
            fontWeight="700"
            letterSpacing="-0.02em"
          >
            Welcome Back
          </Heading>
          <Text 
            color={useColorModeValue('gray.600', 'gray.400')} 
            fontSize="lg"
            fontWeight="400"
          >
            Sign in to continue your training journey
          </Text>
        </Box>

        {/* Login Card */}
        <Card 
          bg={cardBg} 
          border="1px solid" 
          borderColor={borderColor} 
          shadow="2xl" 
          borderRadius="2xl"
          overflow="hidden"
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Error Alert */}
              {error && (
                <Alert 
                  status="error" 
                  borderRadius="xl"
                  bg={useColorModeValue('red.50', 'red.900/20')}
                  border="1px solid"
                  borderColor={useColorModeValue('red.200', 'red.700')}
                >
                  <AlertIcon />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      fontSize="sm"
                      fontWeight="600"
                      mb={2}
                    >
                      Email Address
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement>
                        <Icon as={Mail} color={useColorModeValue('gray.400', 'gray.500')} boxSize={5} />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        border="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        borderRadius="xl"
                        fontSize="md"
                        _hover={{
                          borderColor: useColorModeValue('#ffa76b', '#f26f25'),
                          bg: useColorModeValue('white', 'gray.600')
                        }}
                        _focus={{
                          borderColor: '#f26f25',
                          boxShadow: '0 0 0 3px rgba(242, 111, 37, 0.1)',
                          bg: useColorModeValue('white', 'gray.600')
                        }}
                        _placeholder={{
                          color: useColorModeValue('gray.400', 'gray.500')
                        }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      fontSize="sm"
                      fontWeight="600"
                      mb={2}
                    >
                      Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement>
                        <Icon as={Lock} color={useColorModeValue('gray.400', 'gray.500')} boxSize={5} />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        border="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        borderRadius="xl"
                        fontSize="md"
                        _hover={{
                          borderColor: useColorModeValue('#ffa76b', '#f26f25'),
                          bg: useColorModeValue('white', 'gray.600')
                        }}
                        _focus={{
                          borderColor: '#f26f25',
                          boxShadow: '0 0 0 3px rgba(242, 111, 37, 0.1)',
                          bg: useColorModeValue('white', 'gray.600')
                        }}
                        _placeholder={{
                          color: useColorModeValue('gray.400', 'gray.500')
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        right={3}
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={() => setShowPassword(!showPassword)}
                        zIndex={2}
                        borderRadius="lg"
                        _hover={{
                          bg: useColorModeValue('gray.100', 'gray.600')
                        }}
                      >
                        <Icon as={showPassword ? EyeOff : Eye} boxSize={4} />
                      </Button>
                    </InputGroup>
                  </FormControl>

                  {/* Forgot Password Link */}
                  <Box w="full" textAlign="right">
                    <Link
                      color="#f26f25"
                      onClick={onForgotPassword}
                      cursor="pointer"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ 
                        textDecoration: 'underline',
                        color: '#d95e1e'
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    h={12}
                    isLoading={loading}
                    loadingText="Signing in..."
                    bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                    color="white"
                    borderRadius="xl"
                    fontSize="md"
                    fontWeight="600"
                    _hover={{
                      bg: "linear-gradient(135deg, #d95e1e, #b84e19)",
                      transform: 'translateY(-1px)',
                      shadow: 'xl'
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      shadow: 'lg'
                    }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>

        {/* Sign Up Link */}
        <Box textAlign="center" py={4}>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="md">
            Don't have an account?{' '}
            <Link
              color="#f26f25"
              onClick={onToggleMode}
              cursor="pointer"
              fontWeight="600"
              _hover={{ 
                textDecoration: 'underline',
                color: '#d95e1e'
              }}
            >
              Sign up for free
            </Link>
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default Login

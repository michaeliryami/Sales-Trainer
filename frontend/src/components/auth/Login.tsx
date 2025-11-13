import React, { useState } from 'react'
import {
  Box,
  VStack,
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
  InputLeftElement,
  Image
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

    if (import.meta.env.DEV) console.log('Login attempt for:', email)
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      if (import.meta.env.DEV) console.error('Login error:', error)
      
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
      if (import.meta.env.DEV) console.log('Login successful for:', email)
    }
    
    setLoading(false)
  }

  return (
    <Box w="full" maxW="440px" mx="auto">
      <VStack spacing={8} align="stretch">
        {/* Clozone Branding */}
        <VStack spacing={4} textAlign="center">
          <Image 
            src="/logolong.png" 
            alt="Clozone" 
            h="50px" 
            objectFit="contain"
          />
          <Box>
            <Heading 
              size="lg" 
              color={useColorModeValue('gray.900', 'white')} 
              mb={2}
              fontWeight="600"
            >
              Welcome Back
            </Heading>
            <Text 
              color={useColorModeValue('gray.600', 'gray.400')} 
              fontSize="sm"
            >
              Sign in to your account
            </Text>
          </Box>
        </VStack>

        {/* Login Card */}
        <Card 
          bg={cardBg} 
          border="2px solid" 
          borderColor={useColorModeValue('#f26f25', '#d95e1e')} 
          shadow="xl" 
          borderRadius="2xl"
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
                    >
                      Email
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={Mail} color={useColorModeValue('gray.400', 'gray.500')} boxSize={5} />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        size="lg"
                        bg={useColorModeValue('white', 'gray.700')}
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        borderRadius="lg"
                        _hover={{
                          borderColor: '#f26f25'
                        }}
                        _focus={{
                          borderColor: '#f26f25',
                          boxShadow: '0 0 0 3px rgba(242, 111, 37, 0.1)'
                        }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      color={useColorModeValue('gray.700', 'gray.300')}
                      fontSize="sm"
                      fontWeight="600"
                    >
                      Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={Lock} color={useColorModeValue('gray.400', 'gray.500')} boxSize={5} />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        size="lg"
                        bg={useColorModeValue('white', 'gray.700')}
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        borderRadius="lg"
                        _hover={{
                          borderColor: '#f26f25'
                        }}
                        _focus={{
                          borderColor: '#f26f25',
                          boxShadow: '0 0 0 3px rgba(242, 111, 37, 0.1)'
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
                    size="lg"
                    w="full"
                    mt={2}
                    isLoading={loading}
                    loadingText="Signing in..."
                    bg="#f26f25"
                    color="white"
                    borderRadius="lg"
                    fontSize="md"
                    fontWeight="600"
                    _hover={{
                      bg: "#d95e1e",
                      transform: 'translateY(-1px)',
                      shadow: 'lg'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                  
                  {/* Forgot Password Link */}
                  <Link
                    color="#f26f25"
                    onClick={onForgotPassword}
                    cursor="pointer"
                    fontSize="sm"
                    fontWeight="500"
                    textAlign="center"
                    _hover={{ 
                      textDecoration: 'underline',
                      color: '#d95e1e'
                    }}
                  >
                    Forgot password?
                  </Link>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>

        {/* Sign Up Link */}
        <Text 
          textAlign="center" 
          color={useColorModeValue('gray.600', 'gray.400')} 
          fontSize="sm"
        >
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
            Sign up
          </Link>
        </Text>
      </VStack>
    </Box>
  )
}

export default Login

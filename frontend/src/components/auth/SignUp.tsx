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
  InputLeftElement,
  Progress
} from '@chakra-ui/react'
import { Mail, Lock, Eye, EyeOff, User, XCircle, CheckCircle, MailCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SignUpProps {
  onToggleMode: () => void
}

const SignUp: React.FC<SignUpProps> = ({ onToggleMode }) => {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Password validation
  const getPasswordStrength = (password: string) => {
    if (!password || typeof password !== 'string') {
      return {
        score: 0,
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        }
      }
    }

    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    Object.values(checks).forEach(check => {
      if (check) score++
    })
    
    return { score, checks }
  }

  const passwordStrength = getPasswordStrength(password || '')
  const passwordsMatch = password === confirmPassword && confirmPassword !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please meet at least 3 requirements.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    const { data, error } = await signUp(email, password, displayName)
    
    if (error) {
      // Handle specific invite validation errors
      if (error.message?.includes('not been invited')) {
        setError('This email address has not been invited to join any organization. Please contact your administrator for an invitation.')
      } else {
        setError(error.message || 'Failed to create account')
      }
    } else if (data.user) {
      // Account created successfully - show success message
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="lg" maxW="400px" w="full">
        <CardBody p={8}>
          <VStack spacing={6} align="stretch" textAlign="center">
            <Icon as={MailCheck} boxSize={16} color="blue.500" mx="auto" />
            <Box>
              <Heading size="lg" color={useColorModeValue('gray.900', 'white')} mb={2}>
                Account Created!
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                We've sent a verification email to <strong>{email}</strong>
              </Text>
              <Text color={useColorModeValue('gray.600', 'gray.400')} mt={2} fontSize="sm">
                Please check your email and click the verification link to activate your account.
              </Text>
            </Box>
            <Button
              variant="outline"
              onClick={onToggleMode}
              w="full"
            >
              Back to Sign In
            </Button>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="lg" maxW="400px" w="full">
      <CardBody p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="lg" color={useColorModeValue('gray.900', 'white')} mb={2}>
              Create Account
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Join Sales Trainer to start your journey
            </Text>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={useColorModeValue('gray.700', 'gray.300')}>
                  Display Name
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={User} color={useColorModeValue('gray.400', 'gray.500')} />
                  </InputLeftElement>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
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
                    placeholder="Create a password"
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <Box mt={2}>
                    <Progress
                      value={(passwordStrength.score / 5) * 100}
                      size="sm"
                      colorScheme={
                        passwordStrength.score < 2 ? 'red' :
                        passwordStrength.score < 4 ? 'yellow' : 'green'
                      }
                      borderRadius="full"
                    />
                    <VStack spacing={1} mt={2} fontSize="sm" align="start">
                      <HStack spacing={2}>
                        <Icon
                          as={passwordStrength.checks.length ? CheckCircle : XCircle}
                          color={passwordStrength.checks.length ? 'green.500' : 'gray.400'}
                          boxSize={3}
                        />
                        <Text color={passwordStrength.checks.length ? 'green.500' : useColorModeValue('gray.600', 'gray.400')}>
                          At least 8 characters
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon
                          as={passwordStrength.checks.uppercase ? CheckCircle : XCircle}
                          color={passwordStrength.checks.uppercase ? 'green.500' : 'gray.400'}
                          boxSize={3}
                        />
                        <Text color={passwordStrength.checks.uppercase ? 'green.500' : useColorModeValue('gray.600', 'gray.400')}>
                          One uppercase letter
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon
                          as={passwordStrength.checks.number ? CheckCircle : XCircle}
                          color={passwordStrength.checks.number ? 'green.500' : 'gray.400'}
                          boxSize={3}
                        />
                        <Text color={passwordStrength.checks.number ? 'green.500' : useColorModeValue('gray.600', 'gray.400')}>
                          One number
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={useColorModeValue('gray.700', 'gray.300')}>
                  Confirm Password
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={Lock} color={useColorModeValue('gray.400', 'gray.500')} />
                  </InputLeftElement>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    bg={useColorModeValue('white', 'gray.700')}
                    border="1px solid"
                    borderColor={
                      confirmPassword === '' ? useColorModeValue('gray.300', 'gray.600') :
                      passwordsMatch ? 'green.300' : 'red.300'
                    }
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    zIndex={2}
                  >
                    <Icon as={showConfirmPassword ? EyeOff : Eye} boxSize={4} />
                  </Button>
                </InputGroup>
                {confirmPassword && !passwordsMatch && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    Passwords do not match
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Creating account..."
                isDisabled={!passwordsMatch || passwordStrength.score < 3}
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <Divider />

          {/* Sign In Link */}
          <Box textAlign="center">
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Already have an account?{' '}
              <Link
                color="blue.500"
                onClick={onToggleMode}
                cursor="pointer"
                fontWeight="semibold"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign in
              </Link>
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default SignUp

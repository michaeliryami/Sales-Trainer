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
  InputLeftElement
} from '@chakra-ui/react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface ForgotPasswordProps {
  onBack: () => void
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { resetPassword } = useAuth()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await resetPassword(email)
    
    if (error) {
      setError(error.message || 'Failed to send reset email')
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="lg" maxW="400px" w="full">
        <CardBody p={8}>
          <VStack spacing={6} align="stretch" textAlign="center">
            <Icon as={CheckCircle} boxSize={16} color="green.500" mx="auto" />
            <Box>
              <Heading size="lg" color={useColorModeValue('gray.900', 'white')} mb={2}>
                Check Your Email
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                We've sent password reset instructions to <strong>{email}</strong>
              </Text>
              <Text color={useColorModeValue('gray.600', 'gray.400')} mt={2} fontSize="sm">
                Follow the instructions in the email to reset your password.
              </Text>
            </Box>
            <Button
              leftIcon={<Icon as={ArrowLeft} />}
              variant="outline"
              onClick={onBack}
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
              Reset Password
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Reset Form */}
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

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Sending email..."
              >
                Send Reset Email
              </Button>
            </VStack>
          </form>

          {/* Back to Sign In */}
          <Box textAlign="center">
            <Link
              color="blue.500"
              onClick={onBack}
              cursor="pointer"
              fontWeight="semibold"
              _hover={{ textDecoration: 'underline' }}
            >
              <Icon as={ArrowLeft} mr={2} />
              Back to Sign In
            </Link>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default ForgotPassword

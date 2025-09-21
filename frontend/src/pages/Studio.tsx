import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

function Studio() {
  const navigate = useNavigate()

  return (
    <Box bg="gray.900" minH="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={16}>
      <VStack spacing={12} maxW="2xl" textAlign="center" px={8}>
        <VStack spacing={6}>
          <Heading size="3xl" color="white" fontWeight="bold">
            Welcome to Sales Training AI
          </Heading>
          <Text fontSize="xl" color="gray.400" maxW="lg">
            Practice your sales skills with AI-powered customer scenarios. 
            Get real-time feedback and improve your closing rate.
          </Text>
        </VStack>

        <Button
          size="lg"
          bg="blue.500"
          color="white"
          leftIcon={<Icon as={Plus} />}
          _hover={{ bg: "blue.600" }}
          onClick={() => navigate('/create-session')}
          borderRadius="md"
          px={8}
          py={6}
          fontSize="lg"
          fontWeight="semibold"
        >
          Start Training Session
        </Button>

        <VStack spacing={4} pt={8}>
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            FEATURES
          </Text>
          <VStack spacing={3} maxW="md">
            <Text fontSize="sm" color="gray.400">
              • Realistic AI customer personas with varying difficulty levels
            </Text>
            <Text fontSize="sm" color="gray.400">
              • Multiple insurance types: Life, Health, Auto, Home, Business, Disability
            </Text>
            <Text fontSize="sm" color="gray.400">
              • Real-time voice conversations with instant feedback
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </Box>
  )
}

export default Studio

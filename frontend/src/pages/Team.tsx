import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container,
  Icon
} from '@chakra-ui/react'
import { Users } from 'lucide-react'

function Team() {
  return (
    <Container maxW="7xl" py={8} bg="gray.900" minH="100vh">
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Box p={6} bg="gray.800" rounded="full" display="inline-block" mb={6}>
            <Icon as={Users} boxSize={12} color="gray.300" />
          </Box>
          <Heading size="lg" mb={4} color="gray.100">
            Team Management
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Manage your team members, roles, and permissions here.
          </Text>
        </Box>
        
        <Box 
          bg="gray.800" 
          p={8} 
          rounded="xl" 
          shadow="sm" 
          border="1px" 
          borderColor="gray.700"
          textAlign="center"
        >
          <Text color="gray.400">
            Team management features coming soon...
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default Team

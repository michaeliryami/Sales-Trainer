import {
  Box,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Studio from './pages/Studio'
import Team from './pages/Team'
import Settings from './pages/Settings'
import CreateSession from './pages/CreateSession'

function App() {
  const bg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box bg={bg} minH="100vh">
      <VStack spacing={0} align="stretch">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Box flex={1}>
          <Routes>
            <Route path="/" element={<CreateSession />} />
            <Route path="/create-session" element={<CreateSession />} />
            <Route path="/analytics" element={<Box p={8}><div>Analytics Page</div></Box>} />
          </Routes>
        </Box>
      </VStack>
    </Box>
  )
}

export default App
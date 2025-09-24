import {
  Box,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import CreateSession from './pages/CreateSession'
import Admin from './pages/Admin'
import Organization from './pages/Organization'
import Auth from './pages/Auth'
import AuthCallbackSimple from './pages/AuthCallbackSimple'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'

function App() {
  const bg = useColorModeValue('gray.50', 'gray.900')

  return (
    <AuthProvider>
      <ProfileProvider>
        <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallbackSimple />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
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
                    <Route path="/admin" element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    } />
                    <Route path="/organization" element={
                      <AdminRoute>
                        <Organization />
                      </AdminRoute>
                    } />
                  </Routes>
                </Box>
              </VStack>
            </Box>
          </ProtectedRoute>
        } />
        </Routes>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
import React from 'react'
import {
  Box,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import CreateSession from './pages/CreateSession'
import Admin from './pages/Admin'
import Organization from './pages/Organization'
import Assignments from './pages/Assignments'
import Analytics from './pages/Analytics'
import MyAnalytics from './pages/MyAnalytics'
import Auth from './pages/Auth'
import AuthCallbackSimple from './pages/AuthCallbackSimple'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import MobileBlocker from './components/MobileBlocker'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'

// Layout wrapper for protected pages
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const bg = useColorModeValue('gray.50', 'gray.900')
  
  return (
    <Box bg={bg} minH="100vh">
      <VStack spacing={0} align="stretch">
        <Header />
        <Box flex={1}>
          {children}
        </Box>
      </VStack>
    </Box>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallbackSimple />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <MobileBlocker>
              <ProtectedRoute>
                <ProtectedLayout>
                  <Navigate to="/create-session" replace />
                </ProtectedLayout>
              </ProtectedRoute>
            </MobileBlocker>
          } />
          
          <Route path="/create-session" element={
            <MobileBlocker>
              <ProtectedRoute>
                <ProtectedLayout>
                  <CreateSession />
                </ProtectedLayout>
              </ProtectedRoute>
            </MobileBlocker>
          } />
          
          <Route path="/my-analytics" element={
            <MobileBlocker>
              <ProtectedRoute>
                <ProtectedLayout>
                  <MyAnalytics />
                </ProtectedLayout>
              </ProtectedRoute>
            </MobileBlocker>
          } />
          
          <Route path="/assignments" element={
            <MobileBlocker>
              <ProtectedRoute>
                <AdminRoute>
                  <ProtectedLayout>
                    <Assignments />
                  </ProtectedLayout>
                </AdminRoute>
              </ProtectedRoute>
            </MobileBlocker>
          } />
          
          <Route path="/analytics" element={
            <MobileBlocker>
              <ProtectedRoute>
                <AdminRoute>
                  <ProtectedLayout>
                    <Analytics />
                  </ProtectedLayout>
                </AdminRoute>
              </ProtectedRoute>
            </MobileBlocker>
          } />
          
          <Route path="/admin" element={
            <MobileBlocker>
              <ProtectedRoute>
                <ProtectedLayout>
                  <Admin />
                </ProtectedLayout>
              </ProtectedRoute>
            </MobileBlocker>
          } />
          
          <Route path="/organization" element={
            <MobileBlocker>
              <ProtectedRoute>
                <AdminRoute>
                  <ProtectedLayout>
                    <Organization />
                  </ProtectedLayout>
                </AdminRoute>
              </ProtectedRoute>
            </MobileBlocker>
          } />
        </Routes>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
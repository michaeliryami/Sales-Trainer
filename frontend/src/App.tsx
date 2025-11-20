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
            <ProtectedRoute>
              <ProtectedLayout>
                <Navigate to="/create-session" replace />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/create-session" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CreateSession />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-analytics" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <MyAnalytics />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/assignments" element={
            <ProtectedRoute>
              <AdminRoute>
                <ProtectedLayout>
                  <Assignments />
                </ProtectedLayout>
              </AdminRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AdminRoute>
                <ProtectedLayout>
                  <Analytics />
                </ProtectedLayout>
              </AdminRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Admin />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/organization" element={
            <ProtectedRoute>
              <AdminRoute>
                <ProtectedLayout>
                  <Organization />
                </ProtectedLayout>
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
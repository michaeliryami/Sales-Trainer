import {
  Box,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
// Component to handle navigation persistence
function NavigationHandler() {
  const location = useLocation()

  useEffect(() => {
    // Save current path to sessionStorage (but not auth paths or root)
    if (!location.pathname.includes('/auth') && location.pathname !== '/') {
      sessionStorage.setItem('lastVisitedPath', location.pathname)
    }
  }, [location.pathname])

  return null
}

// Component to redirect to last visited path
function DefaultRedirect() {
  const lastPath = sessionStorage.getItem('lastVisitedPath')
  const validPaths = ['/create-session', '/admin', '/organization', '/assignments', '/analytics', '/my-analytics']
  
  // If we have a last path and it's valid, redirect there
  if (lastPath && validPaths.includes(lastPath)) {
    return <Navigate to={lastPath} replace />
  }
  
  // Otherwise default to create-session (which will show assignments for employees)
  return <Navigate to="/create-session" replace />
}

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
            <NavigationHandler />
            <Box bg={bg} minH="100vh">
              <VStack spacing={0} align="stretch">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <Box flex={1}>
                  <Routes>
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route path="/create-session" element={<CreateSession />} />
                    <Route path="/my-analytics" element={<MyAnalytics />} />
                    <Route path="/assignments" element={
                      <AdminRoute>
                        <Assignments />
                      </AdminRoute>
                    } />
                    <Route path="/analytics" element={
                      <AdminRoute>
                        <Analytics />
                      </AdminRoute>
                    } />
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
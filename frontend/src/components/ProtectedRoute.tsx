import React from 'react'
import { Box, Spinner, VStack, Text, useColorModeValue } from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // CRITICAL: Wait for auth to fully load before making any redirect decisions
  if (loading) {
    return (
      <Box 
        bg={'gray.50'} 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={'gray.600'}>
            Loading...
          </Text>
        </VStack>
      </Box>
    )
  }

  // Only redirect to auth if we're certain there's no user
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

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

  if (loading) {
    return (
      <Box 
        bg={useColorModeValue('gray.50', 'gray.900')} 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Loading...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (!user) {
    // Redirect to auth page but remember where they were trying to go
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

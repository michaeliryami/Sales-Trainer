import React from 'react'
import { Navigate } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { Box, Spinner, VStack, Text, useColorModeValue } from '@chakra-ui/react'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { userRole, loading, profile } = useProfile()

  // Show loading while profile is being fetched
  // CRITICAL: Don't redirect until we're sure profile is loaded
  if (loading || !profile) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        h="calc(100vh - 88px)"
        bg={'gray.50'}
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

  if (!userRole.isAdmin) {
    // Redirect non-admins to training page
    return <Navigate to="/create-session" replace />
  }

  return <>{children}</>
}

export default AdminRoute

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { Box, Spinner, VStack, Text, useColorModeValue } from '@chakra-ui/react'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { userRole, loading } = useProfile()

  if (loading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        h="calc(100vh - 88px)"
        bg={useColorModeValue('gray.50', 'gray.900')}
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

  if (!userRole.isAdmin) {
    // Redirect non-admins to training page
    return <Navigate to="/create-session" replace />
  }

  return <>{children}</>
}

export default AdminRoute

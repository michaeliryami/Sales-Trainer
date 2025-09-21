import {
  Box,
  VStack,
  Heading,
  Button,
  Icon,
  IconButton,
  HStack,
  Text,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Palette, Users, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const tabs = [
    { id: 'studio', name: 'Studio', icon: Palette, color: 'purple', path: '/' },
    { id: 'team', name: 'Team', icon: Users, color: 'blue', path: '/team' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'gray', path: '/settings' },
  ]

  const NavButton = ({ tab, isActive }: { tab: any; isActive: boolean }) => (
    <Button
      w="full"
      justifyContent={isCollapsed ? "center" : "flex-start"}
      variant="ghost"
      leftIcon={isCollapsed ? undefined : <Icon as={tab.icon} boxSize={4} />}
      onClick={() => navigate(tab.path)}
      size="md"
      fontWeight="medium"
      color={isActive ? "white" : "gray.400"}
      bg={isActive ? "gray.700" : "transparent"}
      _hover={{
        bg: "gray.700",
        color: "white"
      }}
      transition="all 0.2s"
      borderRadius="md"
      minH="40px"
    >
      {isCollapsed ? <Icon as={tab.icon} boxSize={5} /> : tab.name}
    </Button>
  )

  return (
    <Box
      w={isCollapsed ? "80px" : "240px"}
      bg="gray.800"
      shadow="xl"
      borderRight="1px"
      borderColor="gray.700"
      transition="width 0.3s ease"
    >
      <VStack h="full" spacing={0} align="stretch">
        {/* Header */}
        <Box px={4} py={4} display="flex" alignItems="center" justifyContent="space-between">
          {!isCollapsed && (
            <Heading size="md" color="white" fontWeight="medium">
              AI Sales Trainer
            </Heading>
          )}
          <IconButton
            aria-label="Toggle sidebar"
            icon={<Icon as={isCollapsed ? Menu : X} boxSize={5} />}
            variant="ghost"
            color="gray.400"
            _hover={{ color: "white", bg: "gray.700" }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="sm"
          />
        </Box>

        {/* Navigation */}
        <Box flex={1} p={4}>
          <VStack spacing={2} align="stretch">
            {tabs.map((tab) => (
              <NavButton
                key={tab.id}
                tab={tab}
                isActive={location.pathname === tab.path}
              />
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

export default Sidebar

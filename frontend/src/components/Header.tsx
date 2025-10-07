import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Avatar,
  Icon,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Database, Sun, Moon, Zap, Settings, BarChart3, Building2, LogOut, User, FileCheck, ClipboardList } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, organization, userRole } = useProfile()
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const brandColor = useColorModeValue('brand.600', 'brand.400')

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  // Filter nav items based on user role
  const allNavItems = [
    // Employee items - show "Assignments" but link to create-session
    { name: 'Assignments', path: '/create-session', icon: ClipboardList, employeeOnly: true },
    // Admin items
    { name: 'Playground', path: '/create-session', icon: Zap, adminOnly: true },
    { name: 'Rubrics', path: '/rubrics', icon: FileCheck, adminOnly: true },
    { name: 'Assignments', path: '/assignments', icon: ClipboardList, adminOnly: true },
    { name: 'Templates', path: '/admin', icon: Settings, adminOnly: true },
    { name: 'Organization', path: '/organization', icon: Building2, adminOnly: true },
  ]

  const navItems = allNavItems.filter(item => {
    if (item.adminOnly) {
      return userRole.isAdmin
    }
    if (item.employeeOnly) {
      return !userRole.isAdmin
    }
    return false // Don't show items that are neither adminOnly nor employeeOnly
  })

  const isActive = (path: string) => location.pathname === path

  return (
    <Box 
      bg={bg} 
      borderBottom="1px" 
      borderColor={borderColor}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        px={8}
        py={4}
        align="center"
        justify="space-between"
      >
        {/* Logo/Brand */}
        <HStack spacing={3}>
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            color={useColorModeValue('gray.900', 'white')}
          >
            clozone.ai
          </Text>
        </HStack>

        {/* Navigation and Controls */}
        <HStack spacing={6}>
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.path) ? "solid" : "ghost"}
              colorScheme={isActive(item.path) ? "brand" : "gray"}
              size="sm"
              onClick={() => navigate(item.path)}
              leftIcon={item.icon ? <Icon as={item.icon} boxSize={4} /> : undefined}
              fontWeight="medium"
            >
              {item.name}
            </Button>
          ))}
          
          <IconButton
            aria-label="Toggle theme"
            icon={<Icon as={isDark ? Sun : Moon} boxSize={5} />}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            color={useColorModeValue('gray.600', 'gray.400')}
            _hover={{
              color: useColorModeValue('gray.900', 'white'),
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          />
          
          <Menu>
            <MenuButton>
              <Avatar 
                size="sm" 
                bg={brandColor}
                color="white"
                name={profile?.display_name || user?.email || "User"}
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
              />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={User} />} isDisabled>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" fontWeight="semibold">
                    {profile?.display_name || "User"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {profile?.email || user?.email}
                  </Text>
                  {organization && (
                    <Text fontSize="xs" color="blue.500">
                      {organization.name} {userRole.isAdmin && "(Admin)"}
                    </Text>
                  )}
                </VStack>
              </MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<Icon as={LogOut} />}
                onClick={handleSignOut}
                color="red.500"
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header

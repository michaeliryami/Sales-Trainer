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
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Database, Sun, Moon, Zap, Settings, BarChart3, Building2, LogOut, User, FileCheck, ClipboardList, Library, ChevronDown, PlusCircle } from 'lucide-react'
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
          {/* Employee Navigation */}
          {!userRole.isAdmin && (
            <>
              <Button
                variant={isActive('/create-session') ? "solid" : "ghost"}
                colorScheme={isActive('/create-session') ? "brand" : "gray"}
                size="sm"
                onClick={() => navigate('/create-session')}
                leftIcon={<Icon as={ClipboardList} boxSize={4} />}
                fontWeight="medium"
              >
                Assignments
              </Button>
              <Button
                variant={isActive('/my-analytics') ? "solid" : "ghost"}
                colorScheme={isActive('/my-analytics') ? "brand" : "gray"}
                size="sm"
                onClick={() => navigate('/my-analytics')}
                leftIcon={<Icon as={BarChart3} boxSize={4} />}
                fontWeight="medium"
              >
                My Performance
              </Button>
            </>
          )}

          {/* Admin Navigation */}
          {userRole.isAdmin && (
            <>
              <Button
                variant={isActive('/create-session') ? "solid" : "ghost"}
                colorScheme={isActive('/create-session') ? "brand" : "gray"}
                size="sm"
                onClick={() => navigate('/create-session')}
                leftIcon={<Icon as={Zap} boxSize={4} />}
                fontWeight="medium"
              >
                Playground
              </Button>
              <Button
                variant={isActive('/assignments') ? "solid" : "ghost"}
                colorScheme={isActive('/assignments') ? "brand" : "gray"}
                size="sm"
                onClick={() => navigate('/assignments')}
                leftIcon={<Icon as={ClipboardList} boxSize={4} />}
                fontWeight="medium"
              >
                Assignments
              </Button>
              <Button
                variant={isActive('/template-library') ? "solid" : "ghost"}
                colorScheme={isActive('/template-library') ? "brand" : "gray"}
                size="sm"
                onClick={() => navigate('/template-library')}
                leftIcon={<Icon as={Library} boxSize={4} />}
                fontWeight="medium"
              >
                Template Library
              </Button>

              {/* Admin Tools Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="ghost"
                  rightIcon={<Icon as={ChevronDown} boxSize={4} />}
                  fontWeight="medium"
                >
                  Admin Tools
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={<Icon as={PlusCircle} />}
                    onClick={() => navigate('/admin')}
                  >
                    Create Template
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={FileCheck} />}
                    onClick={() => navigate('/rubrics')}
                  >
                    Manage Rubrics
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={BarChart3} />}
                    onClick={() => navigate('/analytics')}
                  >
                    Analytics
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={Building2} />}
                    onClick={() => navigate('/organization')}
                  >
                    Organization
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          )}
          
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

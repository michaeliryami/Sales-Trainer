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
import { Database, Zap, Settings, BarChart3, Building2, LogOut, User, ClipboardList, PlusCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
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
      bgGradient={useColorModeValue(
        'linear(to-r, purple.50, pink.50, blue.50)',
        'linear(to-r, gray.900, gray.800, gray.900)'
      )}
      backdropFilter="blur(10px)"
      boxShadow="lg"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px"
      borderColor={useColorModeValue('purple.100', 'gray.700')}
    >
      <Flex
        px={8}
        py={4}
        align="center"
        justify="space-between"
      >
        {/* Logo/Brand */}
        <HStack spacing={3}>
          <Box
            bgGradient="linear(to-r, purple.500, pink.500)"
            bgClip="text"
            fontSize="2xl" 
            fontWeight="black" 
            letterSpacing="tight"
          >
            clozone.ai
          </Box>
        </HStack>

        {/* Navigation and Controls */}
        <HStack spacing={6}>
          {/* Employee Navigation */}
          {!userRole.isAdmin && (
            <>
              <Button
                variant={isActive('/create-session') ? "solid" : "ghost"}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/create-session')}
                leftIcon={<Icon as={ClipboardList} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/create-session') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/create-session') ? 'white' : undefined}
                _hover={isActive('/create-session') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
              >
                Assignments
              </Button>
              <Button
                variant={isActive('/my-analytics') ? "solid" : "ghost"}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/my-analytics')}
                leftIcon={<Icon as={BarChart3} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/my-analytics') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/my-analytics') ? 'white' : undefined}
                _hover={isActive('/my-analytics') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
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
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/create-session')}
                leftIcon={<Icon as={Zap} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/create-session') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/create-session') ? 'white' : undefined}
                _hover={isActive('/create-session') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
              >
                Playground
              </Button>
              <Button
                variant={isActive('/assignments') ? "solid" : "ghost"}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/assignments')}
                leftIcon={<Icon as={ClipboardList} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/assignments') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/assignments') ? 'white' : undefined}
                _hover={isActive('/assignments') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
              >
                Assignments
              </Button>
              <Button
                variant={isActive('/admin') ? "solid" : "ghost"}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/admin')}
                leftIcon={<Icon as={PlusCircle} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/admin') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/admin') ? 'white' : undefined}
                _hover={isActive('/admin') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
              >
                Templates
              </Button>
              <Button
                variant={isActive('/analytics') ? "solid" : "ghost"}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/analytics')}
                leftIcon={<Icon as={BarChart3} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/analytics') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/analytics') ? 'white' : undefined}
                _hover={isActive('/analytics') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
              >
                Analytics
              </Button>
              <Button
                variant={isActive('/organization') ? "solid" : "ghost"}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/organization')}
                leftIcon={<Icon as={Building2} boxSize={4} />}
                fontWeight="600"
                borderRadius="xl"
                bg={isActive('/organization') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}
                color={isActive('/organization') ? 'white' : undefined}
                _hover={isActive('/organization') ? {
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                } : {}}
                transition="all 0.2s"
              >
                Organization
              </Button>
            </>
          )}
          
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

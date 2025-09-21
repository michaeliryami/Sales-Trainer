import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Avatar,
  Icon,
  IconButton,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Database, Sun, Moon, Zap } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const brandColor = useColorModeValue('brand.600', 'brand.400')

  const navItems = [
    { name: 'Training', path: '/create-session', icon: Zap },
    { name: 'Analytics', path: '/analytics' },
  ]

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
          <Box
            w={10}
            h={10}
            bg={brandColor}
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Zap} color="white" boxSize={6} />
          </Box>
          <Box>
            <Text 
              fontSize="xl" 
              fontWeight="bold" 
              color={useColorModeValue('gray.900', 'white')}
            >
              Sales Trainer
            </Text>
            <Badge 
              colorScheme="brand" 
              variant="subtle" 
              fontSize="xs"
              px={2}
            >
              BETA
            </Badge>
          </Box>
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
          
          <Avatar 
            size="sm" 
            bg={brandColor}
            color="white"
            name="User"
          />
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header

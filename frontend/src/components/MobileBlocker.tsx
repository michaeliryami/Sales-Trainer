import { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { Smartphone, Monitor } from 'lucide-react'

const MobileBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false)
  const bg = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.700', 'gray.300')

  useEffect(() => {
    const checkMobile = () => {
      // Check if device is mobile based on screen width and user agent
      const isMobileDevice = 
        window.innerWidth < 1024 || // Tablet and below
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <Box
        minH="100vh"
        bg={bg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
      >
        <VStack spacing={6} textAlign="center" maxW="md">
          <Icon as={Smartphone} w={16} h={16} color="brand.500" />
          <VStack spacing={3}>
            <Heading size="lg" color={textColor}>
              Desktop Only
            </Heading>
            <Text color={textColor} fontSize="md" lineHeight="tall">
              Clozone is optimized for desktop and laptop computers. Please access the app from a desktop browser for the best experience.
            </Text>
            <Text color={textColor} fontSize="sm" opacity={0.7} mt={4}>
              Visit <strong>clozone.ai</strong> on mobile to learn more about our platform.
            </Text>
          </VStack>
          <Box
            mt={8}
            p={4}
            bg={useColorModeValue('white', 'gray.800')}
            rounded="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <VStack spacing={2} align="start">
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                Why desktop only?
              </Text>
              <Text fontSize="xs" color={textColor} opacity={0.8}>
                Our AI training platform requires a larger screen and keyboard for optimal practice calls and detailed analytics review.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    )
  }

  return <>{children}</>
}

export default MobileBlocker


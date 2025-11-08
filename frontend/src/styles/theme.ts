// Modern Theme Configuration with Cool Styles
import { useColorModeValue } from '@chakra-ui/react'

export const useModernTheme = () => {
  return {
    // Gradient Backgrounds
    gradients: {
      primary: useColorModeValue(
        'linear-gradient(135deg, #f26f25 0%, #d95e1e 100%)',
        'linear-gradient(135deg, #f26f25 0%, #d95e1e 100%)'
      ),
      secondary: useColorModeValue(
        'linear-gradient(135deg, #ff7d31 0%, #f26f25 100%)',
        'linear-gradient(135deg, #ff7d31 0%, #f26f25 100%)'
      ),
      success: useColorModeValue(
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      ),
      warning: useColorModeValue(
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      ),
      dark: useColorModeValue(
        'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        'linear-gradient(135deg, #1a202c 0%, #0f1419 100%)'
      ),
      cool: useColorModeValue(
        'linear-gradient(135deg, #f26f25 0%, #ff7d31 50%, #ffa76b 100%)',
        'linear-gradient(135deg, #f26f25 0%, #ff7d31 50%, #ffa76b 100%)'
      ),
    },
    
    // Background Colors
    bg: {
      primary: useColorModeValue('gray.50', 'gray.900'),
      secondary: useColorModeValue('white', 'gray.800'),
      elevated: useColorModeValue('white', 'gray.750'),
      glass: useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'),
    },
    
    // Text Colors
    text: {
      primary: useColorModeValue('gray.900', 'white'),
      secondary: useColorModeValue('gray.600', 'gray.400'),
      muted: useColorModeValue('gray.500', 'gray.500'),
      accent: useColorModeValue('#f26f25', '#ff7d31'),
    },
    
    // Border Colors
    border: {
      default: useColorModeValue('gray.200', 'gray.700'),
      hover: useColorModeValue('gray.300', 'gray.600'),
      accent: useColorModeValue('#f26f25', '#ff7d31'),
    },
    
    // Accent Colors
    accent: {
      primary: useColorModeValue('#f26f25', '#ff7d31'),
      secondary: useColorModeValue('#d95e1e', '#b84e19'),
      success: useColorModeValue('green.500', 'green.400'),
      warning: useColorModeValue('orange.500', 'orange.400'),
      error: useColorModeValue('red.500', 'red.400'),
    },
    
    // Card Styles
    card: {
      bg: useColorModeValue('white', 'gray.800'),
      border: useColorModeValue('gray.100', 'gray.750'),
      shadow: useColorModeValue('lg', 'dark-lg'),
      hoverShadow: useColorModeValue('2xl', 'dark-lg'),
    },
    
    // Glassmorphism
    glass: {
      bg: useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)'),
      backdrop: 'blur(10px)',
      border: useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)'),
    },
  }
}

// Cool Animation Presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 },
  },
  
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 },
  },
}

// Hover Effects
export const hoverEffects = {
  lift: {
    transform: 'translateY(-4px)',
    shadow: '2xl',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  glow: {
    boxShadow: '0 0 20px rgba(242, 111, 37, 0.6)',
    transition: 'all 0.3s ease',
  },
  
  scale: {
    transform: 'scale(1.02)',
    transition: 'all 0.2s ease',
  },
}


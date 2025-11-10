import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { apiFetch } from './utils/api.ts'

// Override global fetch for API calls
// This automatically uses the correct backend URL in production
const originalFetch = window.fetch
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // If it's an API call (starts with /api/), use our wrapper
  if (typeof input === 'string' && input.startsWith('/api/')) {
    return apiFetch(input, init)
  }
  // Otherwise use original fetch
  return originalFetch(input, init)
}

// Professional SaaS theme - light mode only
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: '1.6',
      },
      '*': {
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      }
    }),
  },
  semanticTokens: {
    colors: {
      'bg.primary': { _light: 'white', _dark: 'gray.800' },
      'bg.secondary': { _light: 'gray.50', _dark: 'gray.900' },
      'bg.tertiary': { _light: 'gray.100', _dark: 'gray.700' },
      'border.primary': { _light: 'gray.200', _dark: 'gray.600' },
      'border.secondary': { _light: 'gray.300', _dark: 'gray.700' },
      'text.primary': { _light: 'gray.900', _dark: 'gray.100' },
      'text.secondary': { _light: 'gray.600', _dark: 'gray.400' },
      'text.muted': { _light: 'gray.500', _dark: 'gray.500' },
    },
  },
  colors: {
    brand: {
      50: '#fff5ed',
      100: '#ffe5d1',
      200: '#ffc9a3',
      300: '#ffa76b',
      400: '#ff7d31',
      500: '#f26f25',
      600: '#d95e1e',
      700: '#b84e19',
      800: '#943f14',
      900: '#6b2e0f',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
        _focus: {
          boxShadow: 'outline',
        },
      },
      defaultProps: {
        colorScheme: 'orange',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'orange' || !props.colorScheme ? '#f26f25' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'orange' || !props.colorScheme ? '#d95e1e' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
            boxShadow: 'md',
          },
        }),
        outline: (props: any) => ({
          bg: 'transparent',
          borderColor: props.colorScheme === 'orange' || !props.colorScheme ? '#f26f25' : (props.colorMode === 'dark' ? 'gray.600' : 'gray.300'),
          color: props.colorScheme === 'orange' || !props.colorScheme ? '#f26f25' : (props.colorMode === 'dark' ? 'gray.100' : 'gray.900'),
          _hover: {
            bg: props.colorScheme === 'orange' || !props.colorScheme ? 'rgba(242, 111, 37, 0.1)' : (props.colorMode === 'dark' ? 'gray.700' : 'gray.50'),
            borderColor: props.colorScheme === 'orange' || !props.colorScheme ? '#d95e1e' : (props.colorMode === 'dark' ? 'gray.500' : 'gray.400'),
          },
        }),
        ghost: (props: any) => ({
          bg: 'transparent',
          color: props.colorScheme === 'orange' || !props.colorScheme ? '#f26f25' : (props.colorMode === 'dark' ? 'gray.400' : 'gray.600'),
          _hover: {
            bg: props.colorScheme === 'orange' || !props.colorScheme ? 'rgba(242, 111, 37, 0.1)' : (props.colorMode === 'dark' ? 'gray.700' : 'gray.100'),
            color: props.colorScheme === 'orange' || !props.colorScheme ? '#d95e1e' : (props.colorMode === 'dark' ? 'gray.100' : 'gray.900'),
          },
        }),
      },
    },
    Input: {
      variants: {
        outline: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
            color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#3B82F6' : '#2563EB'}`,
            },
            _placeholder: {
              color: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
          },
        }),
      },
    },
    Textarea: {
      variants: {
        outline: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#3B82F6' : '#2563EB'}`,
          },
          _placeholder: {
            color: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
          },
        }),
      },
    },
    Select: {
      variants: {
        outline: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
            color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#3B82F6' : '#2563EB'}`,
            },
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          borderWidth: '1px',
          borderRadius: 'xl',
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
        },
      }),
    },
    Checkbox: {
      baseStyle: (props: any) => ({
        control: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
          borderWidth: '2px',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.50',
            borderColor: props.colorMode === 'dark' ? 'gray.400' : 'gray.400',
          },
          _checked: {
            bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
            borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
            color: 'white',
            _hover: {
              bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.700',
              borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.700',
            },
          },
          _indeterminate: {
            bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
            borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
            color: 'white',
          },
          _focus: {
            boxShadow: `0 0 0 3px ${props.colorMode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`,
          },
          _invalid: {
            borderColor: 'red.500',
          },
        },
        label: {
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
          _disabled: {
            color: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
          },
        },
      }),
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

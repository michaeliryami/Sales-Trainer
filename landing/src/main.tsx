import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'

// Clozone brand theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#fff5f0',
      100: '#ffe5d9',
      200: '#ffccb3',
      300: '#ffad80',
      400: '#ff8f4d',
      500: '#f26f25', // Primary orange
      600: '#d95e1e',
      700: '#b84e19',
      800: '#994115',
      900: '#7a3411',
    },
  },
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        fontWeight: '600',
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)

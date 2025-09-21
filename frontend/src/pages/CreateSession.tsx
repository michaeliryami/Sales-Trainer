import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Textarea,
  Icon,
  Select,
  Flex,
  Divider,
  FormControl,
  FormLabel,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneCall, PhoneOff, Radio, RadioReceiver } from 'lucide-react'
import Vapi from '@vapi-ai/web'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

function CreateSession() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const accountType = 'employee' // Hardcoded account type
  const [isCreatingCall, setIsCreatingCall] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState('')
  const [vapiPublicKey, setVapiPublicKey] = useState<string>('')
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, timestamp: Date}>>([])
  const [transcriptBuffer, setTranscriptBuffer] = useState<{[key: string]: string}>({})
  const vapiRef = useRef<any>(null)
  const transcriptTimeoutRef = useRef<{[key: string]: NodeJS.Timeout}>({})

  const createAssistantAndStartCall = async () => {
    if (!vapiPublicKey) {
      alert('VAPI configuration not loaded. Please try again.')
      return
    }

    setIsCreatingCall(true)
    
    try {
      // Update VAPI assistant with new persona/settings
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          accountType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update assistant')
      }

      const data = await response.json()
      console.log('Assistant updated:', data.assistant)

      // Initialize VAPI web client and start call directly
      if (!vapiRef.current && vapiPublicKey) {
        vapiRef.current = new Vapi(vapiPublicKey) // Use dynamic public key
        
        // Set up event listeners
        vapiRef.current.on('call-start', () => {
          console.log('Call started')
          setIsCallActive(true)
          setTranscript([])
          setTranscriptBuffer({})
          // Clear any existing timeouts
          Object.values(transcriptTimeoutRef.current).forEach(timeout => clearTimeout(timeout))
          transcriptTimeoutRef.current = {}
        })

        vapiRef.current.on('call-end', () => {
          console.log('Call ended')
          setIsCallActive(false)
          // Flush any remaining buffered transcript
          setTranscriptBuffer(prev => {
            Object.entries(prev).forEach(([speaker, text]) => {
              if (text && text.trim()) {
                setTranscript(prevTranscript => [...prevTranscript, {
                  speaker,
                  text,
                  timestamp: new Date()
                }])
              }
            })
            return {}
          })
          // Clear timeouts
          Object.values(transcriptTimeoutRef.current).forEach(timeout => clearTimeout(timeout))
          transcriptTimeoutRef.current = {}
        })

        vapiRef.current.on('message', (message: any) => {
          if (message.type === 'transcript') {
            const speaker = message.role === 'assistant' ? 'AI Customer' : 'You'
            
            // Buffer the transcript text for this speaker
            setTranscriptBuffer(prev => ({
              ...prev,
              [speaker]: message.transcript
            }))
            
            // Clear existing timeout for this speaker
            if (transcriptTimeoutRef.current[speaker]) {
              clearTimeout(transcriptTimeoutRef.current[speaker])
            }
            
            // Set a timeout to add the buffered text to transcript after a pause
            transcriptTimeoutRef.current[speaker] = setTimeout(() => {
              setTranscriptBuffer(prev => {
                const currentText = prev[speaker]
                if (currentText && currentText.trim()) {
                  setTranscript(prevTranscript => [...prevTranscript, {
                    speaker,
                    text: currentText,
                    timestamp: new Date()
                  }])
                }
                const { [speaker]: removed, ...rest } = prev
                return rest
              })
              delete transcriptTimeoutRef.current[speaker]
            }, 2000) // Wait 2 seconds after last update before showing
          }
        })

        vapiRef.current.on('error', (error: any) => {
          console.error('VAPI error:', error)
          setIsCallActive(false)
        })
      }

      // Start the call with the created assistant
      await vapiRef.current.start(data.assistant.id)
      
    } catch (error) {
      console.error('Error creating call:', error)
      alert('Failed to start training call. Please try again.')
    } finally {
      setIsCreatingCall(false)
    }
  }

  const endCall = () => {
    if (vapiRef.current && isCallActive) {
      vapiRef.current.stop()
      setIsCallActive(false)
    }
  }

  // Fetch VAPI public key on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        const config = await response.json()
        setVapiPublicKey(config.vapiPublicKey)
      } catch (error) {
        console.error('Failed to fetch VAPI config:', error)
      }
    }
    fetchConfig()
  }, [])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current && isCallActive) {
        vapiRef.current.stop()
      }
    }
  }, [isCallActive])

  const trainingTemplates = [
    {
      id: 'skeptical-cfo',
      name: 'Skeptical CFO',
      difficulty: 'Hard',
      insuranceType: 'Business',
      scenario: 'Cost-focused',
      description: 'A data-driven CFO who questions every expense and demands ROI proof for business insurance decisions.'
    },
    {
      id: 'busy-entrepreneur',
      name: 'Busy Entrepreneur', 
      difficulty: 'Medium',
      insuranceType: 'Life',
      scenario: 'Time-pressed',
      description: 'A successful business owner with limited time who needs quick, clear explanations for life insurance.'
    },
    {
      id: 'concerned-parent',
      name: 'Concerned Parent',
      difficulty: 'Easy',
      insuranceType: 'Health',
      scenario: 'Family-focused',
      description: 'A caring parent looking for comprehensive health insurance coverage for their growing family.'
    },
    {
      id: 'price-shopper',
      name: 'Price Shopper',
      difficulty: 'Expert',
      insuranceType: 'Auto',
      scenario: 'Budget-conscious',
      description: 'An extremely price-sensitive customer who compares every detail and pushes back on premium costs.'
    }
  ]

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Sidebar - Training Configuration */}
        <Panel 
          defaultSize={25} 
          minSize={15}
          maxSize={45}
        >
          <Box bg={cardBg} h="full" borderRight="1px" borderColor={borderColor} overflow="hidden" display="flex" flexDirection="column">
            {/* Sidebar Header */}
            <Flex p={4} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center" bg={cardBg}>
              <Box flex={1}>
                <HStack justify="space-between" align="center" mb={1}>
                  <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
                    Training Setup
                  </Heading>
                </HStack>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Configure your personalized sales training session with AI
                </Text>
              </Box>
            </Flex>
            
            {/* Sidebar Content */}
            <Box flex={1} overflowY="auto" p={4}>
                <VStack spacing={4} align="stretch">
                  {/* Training Templates */}
                  <FormControl>
                    <FormLabel 
                      fontSize="sm" 
                      color={useColorModeValue('gray.700', 'gray.300')} 
                      fontWeight="semibold"
                      mb={3}
                    >
                      Training Template
                      {!selectedTemplate && <Text as="span" color="red.500" ml={1}>*</Text>}
                    </FormLabel>
                    <VStack spacing={3} align="stretch">
                      {trainingTemplates.map((template) => (
                        <Box
                          key={template.id}
                          p={4}
                          border="2px solid"
                          borderColor={selectedTemplate === template.id ? "blue.400" : useColorModeValue('gray.200', 'gray.600')}
                          borderRadius="lg"
                          cursor="pointer"
                          onClick={() => setSelectedTemplate(template.id)}
                          bg={selectedTemplate === template.id ? useColorModeValue('blue.50', 'blue.900') : useColorModeValue('white', 'gray.700')}
                          _hover={{
                            borderColor: selectedTemplate === template.id ? "blue.500" : useColorModeValue('gray.300', 'gray.500'),
                            bg: selectedTemplate === template.id ? useColorModeValue('blue.100', 'blue.800') : useColorModeValue('gray.50', 'gray.600')
                          }}
                          transition="all 0.2s"
                        >
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Heading size="sm" color={useColorModeValue('gray.900', 'white')}>
                                {template.name}
                              </Heading>
                              <Badge colorScheme={template.difficulty === 'Easy' ? 'green' : template.difficulty === 'Medium' ? 'yellow' : template.difficulty === 'Hard' ? 'orange' : 'red'} variant="subtle">
                                {template.difficulty}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                              {template.description}
                            </Text>
                            <HStack spacing={2}>
                              <Badge size="sm" colorScheme="blue" variant="outline">
                                {template.insuranceType}
                              </Badge>
                              <Badge size="sm" colorScheme="gray" variant="outline">
                                {template.scenario}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </FormControl>
                </VStack>
              </Box>
          </Box>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle>
          <Box 
            w="2px" 
            h="full" 
            bg={borderColor}
            _hover={{ bg: useColorModeValue('gray.400', 'gray.500'), w: "4px" }}
            transition="all 0.2s"
            cursor="col-resize"
            position="relative"
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="20px"
              h="40px"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={0}
              _hover={{ opacity: 1 }}
              transition="opacity 0.2s"
            >
              <Box w="2px" h="20px" bg={borderColor} mx="1px" />
              <Box w="2px" h="20px" bg={borderColor} mx="1px" />
            </Box>
          </Box>
        </PanelResizeHandle>

        {/* Right Side - Call Button and Transcript */}
        <Panel defaultSize={75} minSize={40}>
          <PanelGroup direction="vertical">
            {/* Call Button Area */}
            <Panel 
              defaultSize={65}
              minSize={30}
            >
              <Box 
                bg={cardBg}
                h="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={2}
                overflow="hidden"
              >
              <Box 
                w="full" 
                h="full" 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center"
                cursor={(!selectedTemplate || !vapiPublicKey) && !isCallActive ? "not-allowed" : "pointer"}
                onClick={isCallActive ? endCall : ((!selectedTemplate || !vapiPublicKey) ? undefined : createAssistantAndStartCall)}
                opacity={(!selectedTemplate || !vapiPublicKey) && !isCallActive ? 0.6 : 1}
                transition="none"
                sx={{
                  filter: (!selectedTemplate || !vapiPublicKey) 
                    ? "drop-shadow(0 0 25px rgba(147, 197, 253, 0.7)) drop-shadow(0 0 50px rgba(147, 197, 253, 0.4))"
                    : "drop-shadow(0 0 30px rgba(147, 197, 253, 0.9)) drop-shadow(0 0 60px rgba(147, 197, 253, 0.5))",
                  '&:hover': {
                    filter: (!selectedTemplate || !vapiPublicKey) 
                      ? "drop-shadow(0 0 25px rgba(147, 197, 253, 0.7)) drop-shadow(0 0 50px rgba(147, 197, 253, 0.4))"
                      : "drop-shadow(0 0 35px rgba(147, 197, 253, 1)) drop-shadow(0 0 70px rgba(147, 197, 253, 0.6)"
                  }
                }}
              >
                <VStack spacing={[4, 6, 8]}>
                  {/* Sound Wave Visualization */}
                  <HStack spacing={[2, 3, 4]} alignItems="center" h={["120px", "160px", "200px"]}>
                    {[30, 60, 20, 80, 40, 100, 70, 90, 50, 100, 80, 60, 90, 40, 70, 30, 50, 80, 20, 60, 40].map((height, index) => (
                      <Box
                        key={index}
                        w={["2px", "3px", "4px"]}
                        h={`${height}%`}
                        bg="blue.300"
                        borderRadius="full"
                        transition="none"
                        animation={isCallActive 
                          ? `soundWave${index % 3} 4s ease-in-out infinite` 
                          : (selectedTemplate ? `idleWave${index % 3} 3s ease-in-out infinite` : undefined)
                        }
                        sx={{
                          '@keyframes soundWave0': {
                            '0%': { height: `${height}%` },
                            '25%': { height: `${Math.min(height * 1.3, 100)}%` },
                            '50%': { height: `${Math.min(height * 0.8, 100)}%` },
                            '75%': { height: `${Math.min(height * 1.4, 100)}%` },
                            '100%': { height: `${height}%` }
                          },
                          '@keyframes soundWave1': {
                            '0%': { height: `${height}%` },
                            '20%': { height: `${Math.min(height * 0.7, 100)}%` },
                            '40%': { height: `${Math.min(height * 1.5, 100)}%` },
                            '60%': { height: `${Math.min(height * 0.9, 100)}%` },
                            '80%': { height: `${Math.min(height * 1.2, 100)}%` },
                            '100%': { height: `${height}%` }
                          },
                          '@keyframes soundWave2': {
                            '0%': { height: `${height}%` },
                            '30%': { height: `${Math.min(height * 1.4, 100)}%` },
                            '45%': { height: `${Math.min(height * 0.75, 100)}%` },
                            '70%': { height: `${Math.min(height * 1.6, 100)}%` },
                            '85%': { height: `${Math.min(height * 0.95, 100)}%` },
                            '100%': { height: `${height}%` }
                          },
                          '@keyframes idleWave0': {
                            '0%, 100%': { height: `${height}%` },
                            '50%': { height: `${Math.min(height * 1.05, 100)}%` }
                          },
                          '@keyframes idleWave1': {
                            '0%, 100%': { height: `${height}%` },
                            '50%': { height: `${Math.min(height * 1.03, 100)}%` }
                          },
                          '@keyframes idleWave2': {
                            '0%, 100%': { height: `${height}%` },
                            '50%': { height: `${Math.min(height * 1.07, 100)}%` }
                          }
                        }}
                      />
                    ))}
                  </HStack>
                  <Text 
                    fontSize={["md", "lg", "xl"]} 
                    fontWeight="medium" 
                    color={useColorModeValue('gray.700', 'gray.300')}
                    textAlign="center"
                  >
                    {isCreatingCall ? "Ringing..." : isCallActive ? "Click anywhere to end call" : "Click anywhere to start call"}
                  </Text>
                </VStack>
              </Box>
              </Box>
            </Panel>

            {/* Transcript Resize Handle */}
            <PanelResizeHandle>
                <Box 
                  h="2px" 
                  w="full" 
                  bg={borderColor}
                  _hover={{ bg: useColorModeValue('gray.400', 'gray.500'), h: "4px" }}
                  transition="all 0.2s"
                  cursor="row-resize"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w="40px"
                    h="20px"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    opacity={0}
                    _hover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                  >
                    <Box w="20px" h="2px" bg={borderColor} my="1px" />
                    <Box w="20px" h="2px" bg={borderColor} my="1px" />
                  </Box>
                </Box>
              </PanelResizeHandle>

            {/* Live Transcript */}
            <Panel 
              defaultSize={35}
              minSize={8}
              maxSize={50}
            >
              <Box 
                bg={cardBg}
                h="full"
                display="flex"
                flexDirection="column"
              >
              <Flex p={3} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center" minH="60px">
                <Box flex={1} minW={0}>
                  <HStack spacing={2}>
                    <Heading size="sm" color={useColorModeValue('gray.900', 'white')} noOfLines={1}>
                      Live Transcript
                    </Heading>
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">Real-time</Badge>
                  </HStack>
                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mt={1} noOfLines={1}>
                    AI-powered conversation analysis and feedback
                  </Text>
                </Box>
                {transcript.length > 0 && (
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => setTranscript([])}
                    flexShrink={0}
                  >
                    Clear
                  </Button>
                )}
              </Flex>
              
              <Box flex={1} p={2} overflowY="auto" minH={0}>
                  {transcript.length === 0 ? (
                          <VStack spacing={2} py={4} textAlign="center" justify="center" h="full">
                            <Icon as={PhoneCall} boxSize={8} color={useColorModeValue('gray.400', 'gray.500')} />
                            <Text color={useColorModeValue('gray.500', 'gray.500')} fontSize="sm" noOfLines={2}>
                              {isCallActive ? "Conversation transcript will appear here..." : "Start a training session to see the live transcript"}
                            </Text>
                          </VStack>
                        ) : (
                          <VStack align="stretch" spacing={4}>
                            {[...transcript].reverse().map((entry, index) => (
                              <Box key={index}>
                                <HStack spacing={2} mb={2}>
                                  <Badge 
                                    colorScheme={entry.speaker === 'You' ? "blue" : "green"} 
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {entry.speaker}
                                  </Badge>
                                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.500')}>
                                    {entry.timestamp.toLocaleTimeString()}
                                  </Text>
                                </HStack>
                                <Box 
                                  bg={useColorModeValue('gray.50', 'gray.700')}
                                  p={4}
                                  borderRadius="lg"
                                  borderLeft="4px solid"
                                  borderLeftColor={entry.speaker === 'You' ? "blue.400" : "green.400"}
                                >
                                  <Text 
                                    fontSize="sm" 
                                    color={useColorModeValue('gray.800', 'gray.200')}
                                    lineHeight="1.6"
                                  >
                                    {entry.text}
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                          </VStack>
                        )}
                </Box>
              </Box>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Box>
  )
} 

export default CreateSession

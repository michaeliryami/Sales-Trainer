import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Flex,
  FormControl,
  FormLabel,
  Badge,
  useColorModeValue,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FileText } from 'lucide-react'
import Vapi from '@vapi-ai/web'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ReactMarkdown from 'react-markdown'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'

function CreateSession() {
  const { organization } = useProfile()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const accountType = 'employee' // Hardcoded account type
  const [isCreatingCall, setIsCreatingCall] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callConnected, setCallConnected] = useState(false)
  const [vapiPublicKey, setVapiPublicKey] = useState<string>('')
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, timestamp: Date}>>([])
  const [scriptText, setScriptText] = useState<string>('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const vapiRef = useRef<any>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  
  // Modal drag and resize state
  const modalRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 100, y: 100 })
  const [modalSize, setModalSize] = useState({ width: 600, height: 500 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      })
    }
  }
  
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height
    })
  }
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setModalPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
      if (resizeStart.x !== 0) {
        const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x))
        const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y))
        setModalSize({ width: newWidth, height: newHeight })
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      setResizeStart({ x: 0, y: 0, width: 0, height: 0 })
    }
    
    if (isDragging || resizeStart.x !== 0) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, resizeStart, modalSize])

  // Load script when selection changes
  useEffect(() => {
    if (!selectedTemplate) {
      setScriptText('')
      return
    }

    const template = templates.find(t => t.id.toString() === selectedTemplate)
    if (!template) {
      setScriptText('')
      return
    }

    // Use the template script directly
    setScriptText(template.script || '')
  }, [selectedTemplate, templates])

  const createAssistantAndStartCall = async () => {
    if (!vapiPublicKey) {
      alert('VAPI configuration not loaded. Please try again.')
      return
    }

    setIsCreatingCall(true)
    
    try {
      // Get the selected template
      const template = templates.find(t => t.id.toString() === selectedTemplate)
      // Use the template script directly
      const scriptContent = scriptText || template?.script || ''
      
      // Update VAPI assistant with new persona/settings
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          accountType,
          scriptContent: scriptContent // Send the script content (from PDF or manual)
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
          setIsCreatingCall(false)
          setIsCallActive(true)
          setCallConnected(true)
          setTranscript([])
        })

        vapiRef.current.on('call-end', () => {
          console.log('Call ended')
          setIsCreatingCall(false)
          setIsCallActive(false)
          setCallConnected(false)
        })

        vapiRef.current.on('message', (message: any) => {
          if (message.type === 'transcript') {
            const speaker = message.role === 'assistant' ? 'AI Customer' : 'You'
            
            // Add transcript as continuous running text
            setTranscript(prevTranscript => [...prevTranscript, {
              speaker,
              text: message.transcript,
              timestamp: new Date()
            }])
          }
        })

        vapiRef.current.on('error', (error: any) => {
          console.error('VAPI error:', error)
          setIsCreatingCall(false)
          setIsCallActive(false)
          setCallConnected(false)
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

  // Modal handlers removed - using fixed 3-panel layout

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

  // Fetch templates from Supabase filtered by organization
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true)
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('org', organization?.id || -1)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching templates:', error)
          return
        }

        setTemplates(data || [])
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [organization?.id])

  // Auto-scroll transcript to bottom when new messages arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript])

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

  // Template script previews removed - using direct template script content

  const bg = 'gray.50'
  const cardBg = 'white'
  const borderColor = 'gray.200'

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
                  <Heading size="md" color={'gray.900'}>
                    Training Setup
                  </Heading>
                </HStack>
                <Text fontSize="sm" color={'gray.600'}>
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
                      color={'gray.700'} 
                      fontWeight="semibold"
                      mb={3}
                    >
                      Training Template
                      {!selectedTemplate && <Text as="span" color="red.500" ml={1}>*</Text>}
                    </FormLabel>
                    <VStack spacing={3} align="stretch">
                      {isLoadingTemplates ? (
                        <Box p={4} textAlign="center">
                          <Text color={'gray.500'}>
                            Loading templates...
                          </Text>
                        </Box>
                      ) : templates.length === 0 ? (
                        <Box p={4} textAlign="center">
                          <Text color={'gray.500'}>
                            No templates found. Create some in the Admin tab!
                          </Text>
                        </Box>
                      ) : (
                        templates.map((template) => (
                        <Box
                          key={template.id}
                          p={4}
                          border="2px solid"
                            borderColor={selectedTemplate === template.id.toString() ? "blue.400" : 'gray.200'}
                          borderRadius="lg"
                          cursor="pointer"
                            onClick={() => setSelectedTemplate(template.id.toString())}
                            bg={selectedTemplate === template.id.toString() ? 'blue.50' : 'white'}
                          _hover={{
                              borderColor: selectedTemplate === template.id.toString() ? "blue.500" : 'gray.300',
                              bg: selectedTemplate === template.id.toString() ? 'blue.100' : 'gray.50'
                          }}
                          transition="all 0.2s"
                        >
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Heading size="sm" color={'gray.900'}>
                                  {template.title}
                              </Heading>
                                <Badge 
                                  colorScheme={
                                    template.difficulty === 'easy' ? 'green' : 
                                    template.difficulty === 'medium' ? 'yellow' : 
                                    template.difficulty === 'hard' ? 'orange' : 'red'
                                  } 
                                  variant="subtle"
                                  textTransform="capitalize"
                                >
                                {template.difficulty}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color={'gray.600'}>
                              {template.description}
                            </Text>
                            <HStack spacing={2}>
                                <Badge size="sm" colorScheme="blue" variant="outline" textTransform="capitalize">
                                  {template.type}
                              </Badge>
                              <Badge size="sm" colorScheme="gray" variant="outline">
                                  {new Date(template.created_at).toLocaleDateString()}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>
                        ))
                      )}
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
            _hover={{ bg: 'gray.500', w: "4px" }}
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
          <Box position="relative" h="full">
            {/* Script Button */}
            {selectedTemplate && (
              <IconButton
                aria-label={isOpen ? "Close script" : "View script"}
                icon={<Icon as={FileText} />}
                position="absolute"
                top={4}
                right={4}
                zIndex={10}
                size="md"
                colorScheme="blue"
                variant={isOpen ? "outline" : "solid"}
                borderRadius="full"
                bg={isOpen ? 'white' : undefined}
                borderColor={isOpen ? "blue.400" : undefined}
                _hover={{
                  bg: isOpen ? 'blue.50' : undefined
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isOpen) {
                    onClose()
                  } else {
                    console.log('Opening modal for template:', selectedTemplate)
                    const template = templates.find(t => t.id.toString() === selectedTemplate)
                    console.log('Template script preview:', template?.script ? template.script.substring(0, 100) + '...' : 'No script found')
                  onOpen()
                  }
                }}
                boxShadow="lg"
              />
            )}
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
                    color={'gray.700'}
                    textAlign="center"
                  >
                    {isCreatingCall ? "Ringing..." : (callConnected ? "Click anywhere to end call" : "Click anywhere to start call")}
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
                  _hover={{ bg: 'gray.500', h: "4px" }}
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
                    <Heading size="sm" color={'gray.900'} noOfLines={1}>
                      Live Transcript
                    </Heading>
                  </HStack>
                  <Text fontSize="xs" color={'gray.600'} mt={1} noOfLines={1}>
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
                
                <Box flex={1} overflowY="auto" p={4}>
                  {transcript.length === 0 ? (
                    <Text fontSize="xs" color={'gray.600'} textAlign="center" mt={8}>
                  {isCallActive ? "Conversation transcript will appear here..." : "Start a training session to see the live transcript"}
                </Text>  
                        ) : (
                          <VStack align="stretch" spacing={2}>
                            {transcript.map((entry, index) => (
                              <Box key={index}>
                                <HStack spacing={2} mb={2}>
                                  <Badge 
                                    colorScheme={entry.speaker === 'You' ? "blue" : "green"} 
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {entry.speaker}
                                  </Badge>
                                  <Text fontSize="xs" color={'gray.500'}>
                                    {entry.timestamp.toLocaleTimeString()}
                                  </Text>
                                </HStack>
                                <Box 
                                  bg={'gray.50'}
                                  p={4}
                                  borderRadius="lg"
                                  borderLeft="4px solid"
                                  borderLeftColor={entry.speaker === 'You' ? "blue.400" : "green.400"}
                                >
                                  <Text 
                                    fontSize="sm" 
                                    color={'gray.800'}
                                    lineHeight="1.6"
                                  >
                                    {entry.text}
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                            <div ref={transcriptEndRef} />
                          </VStack>
                        )}
                </Box>
              </Box>
            </Panel>
          </PanelGroup>
          </Box>
        </Panel>
      </PanelGroup>

      {/* Script Modal */}
      {isOpen && modalRef && modalPosition && modalSize && (
        <Box
          ref={modalRef}
          position="fixed"
          left={`${modalPosition.x}px`}
          top={`${modalPosition.y}px`}
          w={`${modalSize.width}px`}
          h={`${modalSize.height}px`}
          bg={'white'}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor={'gray.200'}
          zIndex="100"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          cursor={isDragging ? 'grabbing' : 'default'}
        >
          <Box 
            pb={4} 
            borderBottom="1px solid" 
            borderColor={'gray.200'}
            bg={'gray.50'}
            borderTopRadius="2xl"
            p={4}
            position="relative"
            cursor="grab"
            onMouseDown={handleMouseDown}
            _active={{ cursor: 'grabbing' }}
            userSelect="none"
          >
            <HStack spacing={4} flex="1">
              <Box 
                p={3} 
                bg={'blue.50'} 
                borderRadius="xl"
                border="1px solid"
                borderColor={'blue.200'}
              >
                <Icon as={FileText} color="blue.500" boxSize={6} />
              </Box>
              <VStack align="start" spacing={1} flex="1">
                <Text fontSize="xl" fontWeight="bold" color={'gray.900'}>
                  Sample Script Preview
                </Text>
                <Text fontSize="sm" color={'gray.600'}>
                  {trainingTemplates.find(t => t.id === selectedTemplate)?.name} Training
                </Text>
              </VStack>
              <IconButton
                aria-label="Close script"
                icon={<Text fontSize="lg" lineHeight="1">×</Text>}
                size="sm"
                variant="ghost"
                color={'gray.600'}
                _hover={{ 
                  bg: 'gray.200',
                  color: 'gray.800'
                }}
                borderRadius="md"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              />
            </HStack>
          </Box>
          <Box p={4} overflowY="auto" flex="1">
            <Box
              bg={'white'}
              p={6}
              borderRadius="xl"
              border="2px solid"
              borderColor={'gray.200'}
              h="calc(100% - 20px)"
              overflowY="auto"
              position="relative"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'gray.100',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'gray.500',
                  borderRadius: '10px',
                },
              }}
            >
              {selectedTemplate && scriptText ? (
                <Box 
                  sx={{
                    '& h1': {
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      color: 'gray.800',
                      mb: 4,
                      borderBottom: '2px solid',
                      borderColor: 'gray.200',
                      pb: 2
                    },
                    '& h2': {
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'blue.600',
                      mt: 6,
                      mb: 3
                    },
                    '& h3': {
                      fontSize: 'md',
                      fontWeight: 'semibold',
                      color: 'gray.700',
                      mt: 4,
                      mb: 2
                    },
                    '& p': {
                      mb: 3,
                      lineHeight: '1.6'
                    },
                    '& strong': {
                      fontWeight: 'bold',
                      color: 'gray.800'
                    },
                    '& ul, & ol': {
                      pl: 4,
                      mb: 3
                    },
                    '& li': {
                      mb: 1
                    }
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => {
                        const text = children?.toString() || ''
                        // Check if it's a speaker line (Seller:, Buyer:, Agent:, Customer:, etc.)
                        const speakerMatch = text.match(/^(Seller|Buyer|Agent|Customer|Client):\s*(.*)/)
                        
                        if (speakerMatch) {
                          return (
                            <Box mb={2}>
                              <Text as="span" fontWeight="bold" color="blue.500">
                                {speakerMatch[1]}:
                              </Text>
                              <Text as="span" ml={2}>
                                {speakerMatch[2]}
                              </Text>
                            </Box>
                          )
                        }
                        
                        return <Text mb={3} lineHeight="1.6">{children}</Text>
                      }
                    }}
                  >
                    {scriptText}
                  </ReactMarkdown>
                </Box>
              ) : (
                <Text color={'gray.500'} textAlign="center" py={8}>
                  Select a template to view the script preview.
              </Text>
              )}
            </Box>
            
          </Box>
          
          {/* Resize Handle */}
          <Box
            position="absolute"
            bottom="0"
            right="0"
            w="20px"
            h="20px"
            cursor="nw-resize"
            onMouseDown={handleResizeMouseDown}
            _hover={{
              bg: 'gray.200'
            }}
            borderBottomRightRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              w="12px"
              h="12px"
              opacity={0.4}
              sx={{
                background: `linear-gradient(-45deg, transparent 30%, ${'#666'} 30%, ${'#666'} 35%, transparent 35%, transparent 65%, ${'#666'} 65%, ${'#666'} 70%, transparent 70%)`,
                backgroundSize: '4px 4px'
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
} 

export default CreateSession

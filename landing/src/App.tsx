import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  Icon,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { Phone, BarChart2, Target, Zap, TrendingUp, Users, Check, ChevronDown } from 'lucide-react'

function App() {
  const [rotatingText, setRotatingText] = useState(0)
  const [showScrollButton, setShowScrollButton] = useState(true)
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  const rotatingWords = [
    'Revenue Driver',
    'Quota Breaker',
    'Closing Machine',
    'Sales Champion'
  ]

  const conversationTurns = [
    { speaker: 'prospect', text: "So what exactly does Clozone do?" },
    { speaker: 'rep', text: "We're an AI-powered sales training platform. Your reps practice live phone calls with realistic AI customers." },
    { speaker: 'prospect', text: "Wait, they actually talk to AI? Like a real conversation?" },
    { speaker: 'rep', text: "Exactly! The AI responds just like a real prospect - objections, questions, everything. Then we instantly grade their performance." },
    { speaker: 'prospect', text: "That's actually pretty cool. How do you grade them?" },
    { speaker: 'rep', text: "Our AI analyzes the entire call - objection handling, discovery questions, closing techniques. They get detailed feedback on what worked and what to improve." }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingText((prev) => (prev + 1) % rotatingWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setShowScrollButton(false)
      } else {
        setShowScrollButton(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Animate conversation in a loop
    const animateConversation = () => {
      setVisibleMessages([])
      const delays = [500, 3000, 5500, 8000, 10500, 13000]
      const timeouts: ReturnType<typeof setTimeout>[] = []

      delays.forEach((delay, index) => {
        const timeout = setTimeout(() => {
          setVisibleMessages(prev => [...prev, index])
        }, delay)
        timeouts.push(timeout)
      })

      // Reset and loop after all messages shown
      const loopTimeout = setTimeout(() => {
        animateConversation()
      }, 16000)
      timeouts.push(loopTimeout)

      return timeouts
    }

    const timeouts = animateConversation()
    return () => timeouts.forEach(t => clearTimeout(t))
  }, [])


  useEffect(() => {
    // Auto-scroll only the messages container (not the page)
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [visibleMessages])

  return (
    <Box minH="100vh" bg="white">
      {/* Logo in top right */}
      <Box
        position="fixed"
        top={6}
        right={6}
        zIndex={1000}
      >
        <Image src="/logolong.png" alt="Clozone" h="50px" />
      </Box>

      {/* Hero Section - Split Layout */}
      <Box 
        as="section"
        minH="100vh" 
        position="relative" 
        overflow="hidden"
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="100vw"
        sx={{
          backgroundImage: 'radial-gradient(rgba(242, 111, 37, 0.35) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px',
        }}
      >
        {/* Background gradient orb */}
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="800px"
          h="800px"
          bg="brand.500"
          opacity="0.08"
          borderRadius="full"
          filter="blur(100px)"
        />
        
        <Container maxW="7xl" position="relative">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
            <GridItem>
              <VStack align="flex-start" spacing={8}>
                <Heading
                  fontSize={{ base: '5xl', md: '6xl', lg: '7xl' }}
                  fontWeight="black"
                  lineHeight="1.1"
                  letterSpacing="-0.02em"
                  className="fade-in-up"
                >
                  Turn Every Rep Into a{' '}
                  <Box
                    as="span"
                    bgGradient="linear(to-r, brand.500, brand.600)"
                    bgClip="text"
                    className="rotate-text"
                    key={rotatingText}
                  >
                    {rotatingWords[rotatingText]}
                  </Box>
                </Heading>
                
                <Text 
                  fontSize={{ base: 'lg', md: 'xl' }} 
                  color="gray.600" 
                  lineHeight="tall"
                  className="fade-in-up delay-1"
                >
                  AI-powered training for insurance sales teams. Practice unlimited calls, get instant feedback, close more deals.
                </Text>

                <VStack align="flex-start" spacing={3} className="fade-in-up delay-2">
                  <HStack spacing={3}>
                    <Icon as={Check} w={6} h={6} color="brand.500" />
                    <Text fontSize="lg" color="gray.700">Practice 24/7 with realistic AI</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={Check} w={6} h={6} color="brand.500" />
                    <Text fontSize="lg" color="gray.700">Master objection handling</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={Check} w={6} h={6} color="brand.500" />
                    <Text fontSize="lg" color="gray.700">Track team performance</Text>
                  </HStack>
                </VStack>

                <HStack pt={4} spacing={4} className="fade-in-up delay-3">
                  <Button
                    as="a"
                    href="https://calendly.com/your-link"
                    target="_blank"
                    size="xl"
                    h="65px"
                    px={12}
                    fontSize="xl"
                    fontWeight="bold"
                    bg="brand.500"
                    color="white"
                    _hover={{
                      bg: 'brand.600',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 20px 40px rgba(242, 111, 37, 0.3)',
                    }}
                    transition="all 0.3s"
                  >
                    Book Your Demo
                  </Button>
                  <Button
                    as="a"
                    href="https://app.clozone.ai/auth"
                    size="xl"
                    h="65px"
                    px={12}
                    fontSize="xl"
                    fontWeight="bold"
                    variant="outline"
                    borderColor="brand.500"
                    color="brand.500"
                    _hover={{
                      bg: 'brand.50',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.3s"
                  >
                    Sign In
                  </Button>
                </HStack>
              </VStack>
            </GridItem>

            <GridItem display={{ base: 'none', lg: 'flex' }} justifyContent="center">
              <Box position="relative" className="fade-in-right" w="500px" h="500px">
                {/* Floating stat badges around logo - arranged in a circle */}
                {/* Card 1 - Top (0 degrees) */}
                <Box
                  position="absolute"
                  top="-10%"
                  left="50%"
                  transform="translateX(-50%)"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-1"
                  style={{ animationDelay: '0s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={Phone} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Voice Training</Text>
                  </VStack>
                </Box>

                {/* Card 2 - Top-right (51 degrees) */}
                <Box
                  position="absolute"
                  top="2%"
                  right="-8%"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-2"
                  style={{ animationDelay: '0.3s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={Zap} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Instant Setup</Text>
                  </VStack>
                </Box>

                {/* Card 3 - Right (103 degrees) */}
                <Box
                  position="absolute"
                  bottom="20%"
                  right="-10%"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-3"
                  style={{ animationDelay: '0.6s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={BarChart2} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Real-time Analytics</Text>
                  </VStack>
                </Box>

                {/* Card 4 - Bottom-right (154 degrees) */}
                <Box
                  position="absolute"
                  bottom="-5%"
                  right="20%"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-4"
                  style={{ animationDelay: '0.9s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={Target} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Custom Scenarios</Text>
                  </VStack>
                </Box>

                {/* Card 5 - Bottom-left (206 degrees) */}
                <Box
                  position="absolute"
                  bottom="-5%"
                  left="20%"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-1"
                  style={{ animationDelay: '1.2s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={TrendingUp} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Smart Feedback</Text>
                  </VStack>
                </Box>

                {/* Card 6 - Left (257 degrees) */}
                <Box
                  position="absolute"
                  bottom="20%"
                  left="-10%"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-2"
                  style={{ animationDelay: '1.5s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={Check} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Unlimited Practice</Text>
                  </VStack>
                </Box>

                {/* Card 7 - Top-left (309 degrees) */}
                <Box
                  position="absolute"
                  top="2%"
                  left="-8%"
                  bg="white"
                  p={4}
                  rounded="xl"
                  boxShadow="xl"
                  className="float-fade-3"
                  style={{ animationDelay: '1.8s' }}
                >
                  <VStack spacing={1}>
                    <Icon as={Users} boxSize={6} color="brand.500" />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">Team Management</Text>
                  </VStack>
                </Box>

                {/* Main logo */}
                <Box
                  position="relative"
                  w="full"
                  h="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  className="float"
                >
                  <Box
                    position="absolute"
                    w="full"
                    h="full"
                    bg="brand.500"
                    opacity="0.15"
                    borderRadius="full"
                    filter="blur(80px)"
                    className="pulse-glow"
                  />
                  <Image
                    src="/logo.png"
                    alt="Clozone"
                    w="350px"
                    h="350px"
                    position="relative"
                    zIndex={1}
                  />
                </Box>
              </Box>
            </GridItem>
          </Grid>

        </Container>
      </Box>

      {/* Scroll Down Arrow - Only on Hero Section */}
      {showScrollButton && (
        <Box
          position="fixed"
          bottom={8}
          left={0}
          right={0}
          w="100%"
          display="flex"
          justifyContent="center"
          cursor="pointer"
          onClick={() => {
            document.getElementById('demo-section')?.scrollIntoView({ 
              behavior: 'smooth' 
            })
          }}
          className="bounce"
          zIndex={10}
          pointerEvents="auto"
        >
          <VStack spacing={2}>
            <Text fontSize="sm" color="gray.500" fontWeight="500">
              See it in action
            </Text>
            <Icon as={ChevronDown} w={8} h={8} color="brand.500" />
          </VStack>
        </Box>
      )}

      {/* Demo Section - Full Screen */}
      <Box
        as="section"
        id="demo-section"
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={20}
      >
        <Container maxW="7xl">
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading
                fontSize={{ base: '4xl', md: '5xl' }}
                fontWeight="black"
                letterSpacing="-0.02em"
              >
                See Clozone in Action
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="2xl">
                Here's how we help your sales team level up with AI-powered training
              </Text>
            </VStack>

            <Box
              position="relative"
              w="full"
              maxW="900px"
              h={{ base: '400px', md: '450px' }}
              bg="white"
              rounded="3xl"
              boxShadow="2xl"
              overflow="hidden"
              borderWidth="1px"
              borderColor="gray.200"
            >
              {/* Browser chrome */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                h="50px"
                bg="gray.50"
                borderBottomWidth="1px"
                borderColor="gray.200"
                display="flex"
                alignItems="center"
                px={6}
              >
                <HStack spacing={2}>
                  <Box w="10px" h="10px" rounded="full" bg="red.400" />
                  <Box w="10px" h="10px" rounded="full" bg="yellow.400" />
                  <Box w="10px" h="10px" rounded="full" bg="green.400" />
                </HStack>
              </Box>

              {/* Call interface */}
              <Box h="full" pt="50px" bg="white" overflow="hidden" display="flex" flexDirection="column">
                <Box p={6} pb={4}>
                  <HStack spacing={3}>
                    <Box 
                      w="50px" 
                      h="50px" 
                      rounded="full" 
                      bg="brand.100" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                    >
                      <Icon as={Phone} w={5} h={5} color="brand.500" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="md">Product Demo</Text>
                      <HStack spacing={2}>
                        <Box w="2" h="2" rounded="full" bg="green.500" className="pulse-dot" />
                        <Text color="gray.500" fontSize="xs">
                          Live conversation
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>

                {/* Conversation bubbles with scroll */}
                <Box 
                  ref={messagesContainerRef}
                  flex="1" 
                  overflowY="auto" 
                  px={6} 
                  pb={6}
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#CBD5E0',
                      borderRadius: '2px',
                    },
                  }}
                >
                  <VStack align="stretch" spacing={4} w="full">
                    {conversationTurns.map((turn, index) => (
                      visibleMessages.includes(index) && (
                        <Box
                          key={index}
                          bg={turn.speaker === 'prospect' ? 'gray.100' : 'brand.500'}
                          color={turn.speaker === 'prospect' ? 'gray.700' : 'white'}
                          p={4}
                          rounded="2xl"
                          roundedBottomLeft={turn.speaker === 'prospect' ? 'md' : '2xl'}
                          roundedBottomRight={turn.speaker === 'rep' ? 'md' : '2xl'}
                          maxW="70%"
                          alignSelf={turn.speaker === 'rep' ? 'flex-end' : 'flex-start'}
                          className="message-pop-in"
                        >
                          <Text fontSize="sm">{turn.text}</Text>
                        </Box>
                      )
                    ))}
                  </VStack>
                </Box>
              </Box>
            </Box>

            <Button
              as="a"
              href="https://calendly.com/your-link"
              target="_blank"
              size="lg"
              h="55px"
              px={10}
              fontSize="lg"
              fontWeight="bold"
              bg="brand.500"
              color="white"
              _hover={{
                bg: 'brand.600',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(242, 111, 37, 0.3)',
              }}
              transition="all 0.3s"
            >
              Watch Demo
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box as="section" bg="gray.50" py={24}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading fontSize={{ base: '4xl', md: '5xl' }} fontWeight="black" letterSpacing="-0.02em">
                Practice Makes Perfect
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600">
                Your reps get better with every conversation. Our AI adapts to your industry, products, and sales methodology.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12} w="full">
              <VStack
                spacing={6}
                p={10}
                bg="white"
                rounded="3xl"
                boxShadow="xl"
                borderWidth="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '2xl',
                }}
              >
                <Box
                  w="70px"
                  h="70px"
                  bg="brand.500"
                  rounded="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={Phone} w={8} h={8} color="white" />
                </Box>
                <VStack spacing={3}>
                  <Heading size="lg" textAlign="center">Start a Call</Heading>
                  <Text color="gray.600" textAlign="center" lineHeight="tall">
                    Choose from pre-built scenarios or create custom situations based on your actual products and prospects.
                  </Text>
                </VStack>
              </VStack>

              <VStack
                spacing={6}
                p={10}
                bg="white"
                rounded="3xl"
                boxShadow="xl"
                borderWidth="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '2xl',
                }}
              >
                <Box
                  w="70px"
                  h="70px"
                  bg="brand.500"
                  rounded="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={Zap} w={8} h={8} color="white" />
                </Box>
                <VStack spacing={3}>
                  <Heading size="lg" textAlign="center">AI Responds</Heading>
                  <Text color="gray.600" textAlign="center" lineHeight="tall">
                    Our AI acts like a real prospect—asking questions, raising objections, and pushing back just like in real life.
                  </Text>
                </VStack>
              </VStack>

              <VStack
                spacing={6}
                p={10}
                bg="white"
                rounded="3xl"
                boxShadow="xl"
                borderWidth="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '2xl',
                }}
              >
                <Box
                  w="70px"
                  h="70px"
                  bg="brand.500"
                  rounded="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={BarChart2} w={8} h={8} color="white" />
                </Box>
                <VStack spacing={3}>
                  <Heading size="lg" textAlign="center">Get Feedback</Heading>
                  <Text color="gray.600" textAlign="center" lineHeight="tall">
                    Instant AI grading on objection handling, rapport building, discovery, and closing with actionable tips.
                  </Text>
                </VStack>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box as="section" py={24}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading fontSize={{ base: '4xl', md: '5xl' }} fontWeight="black" letterSpacing="-0.02em">
                Everything Your Team Needs
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600">
                Built for modern sales teams who want to win more deals
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              <Box
                p={8}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="2xl"
                _hover={{ borderColor: 'brand.500', boxShadow: 'md' }}
                transition="all 0.3s"
              >
                <HStack spacing={4} align="start">
                  <Icon as={Target} w={8} h={8} color="brand.500" flexShrink={0} />
                  <VStack align="start" spacing={2}>
                    <Heading size="md">Custom Scenarios</Heading>
                    <Text color="gray.600">
                      Upload your playbook, product docs, or call recordings. We'll create tailored practice scenarios for your exact use case.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                p={8}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="2xl"
                _hover={{ borderColor: 'brand.500', boxShadow: 'md' }}
                transition="all 0.3s"
              >
                <HStack spacing={4} align="start">
                  <Icon as={TrendingUp} w={8} h={8} color="brand.500" flexShrink={0} />
                  <VStack align="start" spacing={2}>
                    <Heading size="md">Performance Tracking</Heading>
                    <Text color="gray.600">
                      See improvement over time with detailed analytics on key skills. Identify team weaknesses and track training completion.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                p={8}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="2xl"
                _hover={{ borderColor: 'brand.500', boxShadow: 'md' }}
                transition="all 0.3s"
              >
                <HStack spacing={4} align="start">
                  <Icon as={Users} w={8} h={8} color="brand.500" flexShrink={0} />
                  <VStack align="start" spacing={2}>
                    <Heading size="md">Team Management</Heading>
                    <Text color="gray.600">
                      Assign training modules, monitor completion, and ensure consistent skill development across your entire organization.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                p={8}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="2xl"
                _hover={{ borderColor: 'brand.500', boxShadow: 'md' }}
                transition="all 0.3s"
              >
                <HStack spacing={4} align="start">
                  <Icon as={Zap} w={8} h={8} color="brand.500" flexShrink={0} />
                  <VStack align="start" spacing={2}>
                    <Heading size="md">Unlimited Practice</Heading>
                    <Text color="gray.600">
                      No scheduling, no manager time required. Your team practices whenever they want, as much as they want.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        as="section"
        py={32}
        position="relative"
        overflow="hidden"
        bgGradient="linear(to-br, brand.500, brand.600)"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="-10%"
          left="-5%"
          w="400px"
          h="400px"
          bg="white"
          opacity="0.05"
          borderRadius="full"
        />
        <Box
          position="absolute"
          bottom="-10%"
          right="-5%"
          w="500px"
          h="500px"
          bg="white"
          opacity="0.05"
          borderRadius="full"
        />

        <Container maxW="5xl" position="relative" zIndex={1}>
          <VStack spacing={10} textAlign="center">
            <VStack spacing={6}>
              <Heading
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                color="white"
                fontWeight="black"
                letterSpacing="-0.02em"
                maxW="4xl"
              >
                Ready to 10x Your Sales Team?
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="whiteAlpha.900" maxW="2xl" lineHeight="tall">
                Join leading sales organizations using Clozone to cut onboarding time, improve win rates, and scale their teams faster.
              </Text>
            </VStack>

            <Button
              as="a"
              href="https://calendly.com/your-link"
              target="_blank"
              size="xl"
              h="70px"
              px={16}
              fontSize="2xl"
              fontWeight="bold"
              bg="white"
              color="brand.500"
              _hover={{
                bg: 'gray.100',
                transform: 'translateY(-4px)',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
              }}
              transition="all 0.3s"
            >
              Schedule Your Demo
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" py={12}>
        <Container maxW="7xl">
          <VStack spacing={6}>
            <Image src="/logolong.png" alt="Clozone" h="40px" filter="brightness(0) invert(1)" />
            <Text color="gray.400" textAlign="center">
              © 2025 Clozone AI. All rights reserved.
            </Text>
            <HStack spacing={6}>
              <Text
                as="a"
                href="mailto:contact@clozone.ai"
                color="gray.400"
                _hover={{ color: 'white' }}
              >
                contact@clozone.ai
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default App

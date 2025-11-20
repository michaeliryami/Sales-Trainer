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
  Flex,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { 
  Phone, 
  BarChart2, 
  Zap, 
  TrendingUp, 
  Check, 
  ChevronDown, 
  BookOpen, 
  Target, 
  PlayCircle 
} from 'lucide-react'

function App() {
  const [rotatingText, setRotatingText] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
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
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = []
    let isHeroVisible = true

    const animateConversation = () => {
      setVisibleMessages([])
      const delays = [500, 3000, 5500, 8000, 10500, 13000]
      timeouts = []

      delays.forEach((delay, index) => {
        const timeout = setTimeout(() => {
          setVisibleMessages(prev => [...prev, index])
        }, delay)
        timeouts.push(timeout)
      })

      const loopTimeout = setTimeout(() => {
        if (isHeroVisible) {
          animateConversation()
        }
      }, 16000)
      timeouts.push(loopTimeout)
    }

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isHeroVisible = true
            timeouts.forEach(t => clearTimeout(t))
            animateConversation()
          } else {
            isHeroVisible = false
          }
        })
      },
      { threshold: 0.3 }
    )

    const heroElement = document.querySelector('section')
    if (heroElement) {
      heroObserver.observe(heroElement)
    }

    animateConversation()

    return () => {
      timeouts.forEach(t => clearTimeout(t))
      heroObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [visibleMessages])

  return (
    <Box minH="100vh" bg="white" overflowX="hidden">
      {/* Navigation */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        bg={isScrolled ? 'white' : 'transparent'}
        boxShadow={isScrolled ? 'sm' : 'none'}
        transition="all 0.3s"
        py={4}
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Image src="/logolong.png" alt="Clozone" h="40px" />
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              <Button variant="ghost" fontWeight="500" color="gray.600" _hover={{ color: 'brand.500', bg: 'transparent' }}>Features</Button>
              <Button variant="ghost" fontWeight="500" color="gray.600" _hover={{ color: 'brand.500', bg: 'transparent' }}>How it Works</Button>
              <Button variant="ghost" fontWeight="500" color="gray.600" _hover={{ color: 'brand.500', bg: 'transparent' }}>Pricing</Button>
            </HStack>
            <HStack spacing={4}>
              <Button 
                as="a" 
                href="https://app.clozone.ai/auth" 
                variant="ghost" 
                color="gray.600"
                _hover={{ color: 'brand.500', bg: 'brand.50' }}
              >
                Sign In
              </Button>
              <Button 
                as="a" 
                href="https://calendly.com/your-link" 
                target="_blank"
                bg="brand.500" 
                color="white" 
                _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s"
                px={6}
                rounded="full"
              >
                Book Demo
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        as="section"
        minH="100vh" 
        position="relative" 
        pt={{ base: 32, lg: 20 }}
        pb={20}
        display="flex"
        alignItems="center"
        bg="linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)"
      >
        {/* Background blobs */}
        <Box position="absolute" top="10%" left="-10%" w="600px" h="600px" bg="brand.200" filter="blur(120px)" opacity="0.2" borderRadius="full" />
        <Box position="absolute" bottom="10%" right="-10%" w="600px" h="600px" bg="purple.200" filter="blur(120px)" opacity="0.2" borderRadius="full" />

        <Container maxW="7xl" position="relative">
          <Grid templateColumns={{ base: '1fr', lg: '1.2fr 1fr' }} gap={12} alignItems="center">
            <GridItem>
              <VStack align="flex-start" spacing={8}>
                <Badge 
                  bg="white" 
                  color="brand.600" 
                  px={4} 
                  py={2} 
                  rounded="full" 
                  boxShadow="md"
                  display="flex" 
                  alignItems="center" 
                  gap={2}
                  fontSize="sm"
                  className="fade-in-up"
                >
                  <Icon as={Zap} size={16} fill="currentColor" />
                  <span>New: Advanced Voice Analytics 2.0</span>
                </Badge>

                <Heading
                  fontSize={{ base: '5xl', md: '6xl', lg: '7xl' }}
                  fontWeight="900"
                  lineHeight="1.1"
                  letterSpacing="-0.02em"
                  className="fade-in-up"
                  color="gray.900"
                >
                  Turn Every Rep Into a{' '}
                  <Box
                    as="span"
                    bgGradient="linear(to-r, brand.500, brand.600)"
                    bgClip="text"
                    className="rotate-text"
                    display="inline-block"
                    key={rotatingText}
                  >
                    {rotatingWords[rotatingText]}
                  </Box>
                </Heading>
                
                <Text 
                  fontSize={{ base: 'xl', md: '2xl' }} 
                  color="gray.600" 
                  lineHeight="tall"
                  className="fade-in-up delay-1"
                  maxW="lg"
                >
                  Practice unlimited calls with realistic AI prospects. Get instant feedback, master objections, and close more deals—without burning leads.
                </Text>

                <HStack spacing={4} className="fade-in-up delay-2" flexWrap="wrap">
                  <Button
                    as="a"
                    href="https://calendly.com/your-link"
                    target="_blank"
                    size="lg"
                    h="64px"
                    px={10}
                    fontSize="xl"
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'xl' }}
                    transition="all 0.3s"
                    rounded="2xl"
                    rightIcon={<Icon as={ChevronDown} />}
                  >
                    Start Training Now
                  </Button>
                  <Button
                    size="lg"
                    h="64px"
                    px={8}
                    fontSize="lg"
                    variant="ghost"
                    color="gray.600"
                    _hover={{ bg: 'blackAlpha.50' }}
                    rounded="2xl"
                    leftIcon={<Icon as={PlayCircle} />}
                  >
                    See How It Works
                  </Button>
                </HStack>

                <HStack spacing={6} pt={4} className="fade-in-up delay-3" color="gray.500" fontSize="sm">
                  <HStack>
                    <Icon as={Check} color="green.500" />
                    <Text>No credit card required</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Check} color="green.500" />
                    <Text>Setup in 2 minutes</Text>
                  </HStack>
                </HStack>
              </VStack>
            </GridItem>

            <GridItem display={{ base: 'none', lg: 'flex' }} justifyContent="center" position="relative">
              {/* Decorative elements around the phone */}
              <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" bg="brand.100" rounded="3xl" transform="rotate(12deg)" zIndex={0} />
              <Box position="absolute" bottom="-20px" left="-20px" w="150px" h="150px" bg="purple.100" rounded="full" zIndex={0} />

              {/* Main Interface Container */}
              <Box
                position="relative"
                w="full"
                maxW="500px"
                h="600px"
                bg="white"
                rounded="3xl"
                boxShadow="2xl"
                overflow="hidden"
                borderWidth="8px"
                borderColor="gray.900"
                zIndex={1}
                className="fade-in-right"
              >
                {/* Header */}
                <Box bg="gray.50" p={4} borderBottom="1px" borderColor="gray.100">
                  <HStack justify="space-between">
                    <HStack>
                      <Box w="3" h="3" rounded="full" bg="red.400" />
                      <Box w="3" h="3" rounded="full" bg="yellow.400" />
                      <Box w="3" h="3" rounded="full" bg="green.400" />
                    </HStack>
                    <Text fontSize="xs" fontWeight="600" color="gray.400">Clozone AI Training</Text>
                  </HStack>
                </Box>

                {/* Call Status Bar */}
                <Box bg="brand.500" p={4} color="white">
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Box bg="whiteAlpha.300" p={2} rounded="full">
                        <Icon as={Phone} size={16} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">Sarah (Prospect)</Text>
                        <Text fontSize="xs" opacity={0.8}>00:42 • Life Insurance Lead</Text>
                      </VStack>
                    </HStack>
                    <Box w="2" h="2" bg="green.300" rounded="full" className="pulse-dot" />
                  </Flex>
                </Box>

                {/* Messages Area */}
                <Box 
                  flex="1" 
                  h="calc(100% - 130px)"
                  bg="gray.50" 
                  p={4} 
                  overflowY="auto"
                  ref={messagesContainerRef}
                  css={{ '&::-webkit-scrollbar': { display: 'none' } }}
                >
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="xs" color="gray.400" textAlign="center" mb={2}>Today, 2:30 PM</Text>
                    {conversationTurns.map((turn, index) => (
                      visibleMessages.includes(index) && (
                        <Flex
                          key={index}
                          justify={turn.speaker === 'rep' ? 'flex-end' : 'flex-start'}
                          className="message-pop-in"
                        >
                          <Box
                            maxW="80%"
                            bg={turn.speaker === 'rep' ? 'brand.500' : 'white'}
                            color={turn.speaker === 'rep' ? 'white' : 'gray.800'}
                            p={4}
                            roundedTop="2xl"
                            roundedBottomRight={turn.speaker === 'rep' ? 'sm' : '2xl'}
                            roundedBottomLeft={turn.speaker === 'prospect' ? 'sm' : '2xl'}
                            boxShadow={turn.speaker === 'prospect' ? 'sm' : 'none'}
                            border="1px"
                            borderColor={turn.speaker === 'prospect' ? 'gray.100' : 'transparent'}
                          >
                            <Text fontSize="sm" lineHeight="tall">{turn.text}</Text>
                          </Box>
                        </Flex>
                      )
                    ))}
                    {/* Typing indicator placeholder could go here */}
                  </VStack>
                </Box>
              </Box>

              {/* Floating Badge 1 */}
              <Box
                position="absolute"
                top="20%"
                right="-40px"
                bg="white"
                p={4}
                rounded="2xl"
                boxShadow="xl"
                zIndex={2}
                className="float-fade-1"
              >
                <HStack>
                  <Box bg="green.100" p={2} rounded="lg">
                    <Icon as={TrendingUp} color="green.600" size={20} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="600">Closing Rate</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">+32%</Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Floating Badge 2 */}
              <Box
                position="absolute"
                bottom="15%"
                left="-40px"
                bg="white"
                p={4}
                rounded="2xl"
                boxShadow="xl"
                zIndex={2}
                className="float-fade-2"
              >
                <HStack>
                  <Box bg="brand.100" p={2} rounded="lg">
                    <Icon as={Target} color="brand.600" size={20} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="600">Objection Score</Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.600">9.8/10</Text>
                  </VStack>
                </HStack>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Social Proof - Logos */}
      <Box borderY="1px" borderColor="gray.100" bg="gray.50" py={12}>
        <Container maxW="7xl">
          <Text textAlign="center" fontSize="sm" fontWeight="600" color="gray.500" mb={8} letterSpacing="wide" textTransform="uppercase">
            Trusted by high-performing sales teams
          </Text>
          <SimpleGrid columns={{ base: 2, md: 5 }} gap={8} alignItems="center" opacity={0.6}>
            {/* Placeholders for logos - using text for now but styled as logos */}
            <Heading size="md" color="gray.400" textAlign="center">INSURIFY</Heading>
            <Heading size="md" color="gray.400" textAlign="center">Lemonade</Heading>
            <Heading size="md" color="gray.400" textAlign="center">PolicyGenius</Heading>
            <Heading size="md" color="gray.400" textAlign="center">SELECT</Heading>
            <Heading size="md" color="gray.400" textAlign="center">Ladder</Heading>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box py={24} bg="white">
        <Container maxW="7xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Badge bg="brand.50" color="brand.600" px={3} py={1} rounded="full">Platform Features</Badge>
            <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" color="gray.900">
              Everything needed to build a world-class team
            </Heading>
            <Text fontSize="xl" color="gray.500" maxW="2xl">
              Stop practicing on real leads. Give your team a safe environment to fail, learn, and master their pitch.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {/* Feature 1 */}
            <Box p={8} rounded="3xl" bg="gray.50" _hover={{ bg: 'white', boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s" border="1px" borderColor="gray.100">
              <Box bg="blue.500" w={12} h={12} rounded="2xl" display="flex" alignItems="center" justifyContent="center" mb={6}>
                <Icon as={Phone} color="white" size={24} />
              </Box>
              <Heading size="md" mb={3}>Realistic Voice AI</Heading>
              <Text color="gray.600" lineHeight="relaxed">
                Our AI sounds human, interrupts naturally, and has distinct personalities. It's not just reading a script—it's having a conversation.
              </Text>
            </Box>

            {/* Feature 2 */}
            <Box p={8} rounded="3xl" bg="gray.50" _hover={{ bg: 'white', boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s" border="1px" borderColor="gray.100">
              <Box bg="brand.500" w={12} h={12} rounded="2xl" display="flex" alignItems="center" justifyContent="center" mb={6}>
                <Icon as={BarChart2} color="white" size={24} />
              </Box>
              <Heading size="md" mb={3}>Instant Grading</Heading>
              <Text color="gray.600" lineHeight="relaxed">
                Get immediate feedback on tone, pace, objection handling, and script adherence. No more waiting for manager reviews.
              </Text>
            </Box>

            {/* Feature 3 */}
            <Box p={8} rounded="3xl" bg="gray.50" _hover={{ bg: 'white', boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s" border="1px" borderColor="gray.100">
              <Box bg="purple.500" w={12} h={12} rounded="2xl" display="flex" alignItems="center" justifyContent="center" mb={6}>
                <Icon as={BookOpen} color="white" size={24} />
              </Box>
              <Heading size="md" mb={3}>Scenario Library</Heading>
              <Text color="gray.600" lineHeight="relaxed">
                Access 40+ pre-built insurance scenarios covering life, health, and P&C. Or build your own custom scenarios in minutes.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it Works - Alternate Layout */}
      <Box py={24} bg="gray.900" color="white">
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
            <GridItem>
              <VStack align="start" spacing={8}>
                <Badge bg="brand.500" color="white" px={3} py={1} rounded="full">How It Works</Badge>
                <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold">
                  Practice makes perfect. <br />
                  <Box as="span" color="brand.500">Literally.</Box>
                </Heading>
                <Text fontSize="xl" color="gray.400">
                  Your reps are losing deals because they aren't ready for the tough questions. We fix that.
                </Text>
                
                <VStack spacing={6} align="stretch" w="full" pt={4}>
                  <HStack spacing={4}>
                    <Flex w={10} h={10} rounded="full" bg="whiteAlpha.200" align="center" justify="center" flexShrink={0}>
                      <Text fontWeight="bold">1</Text>
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">Choose a Scenario</Text>
                      <Text color="gray.400">Select from library or custom scenarios.</Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={4}>
                    <Flex w={10} h={10} rounded="full" bg="brand.500" align="center" justify="center" flexShrink={0}>
                      <Text fontWeight="bold">2</Text>
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">Practice the Call</Text>
                      <Text color="gray.400">Voice-to-voice conversation with AI.</Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={4}>
                    <Flex w={10} h={10} rounded="full" bg="whiteAlpha.200" align="center" justify="center" flexShrink={0}>
                      <Text fontWeight="bold">3</Text>
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">Get Coaching</Text>
                      <Text color="gray.400">Instant scorecard and improvement tips.</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </GridItem>
            <GridItem>
              <Image 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2940" 
                rounded="3xl" 
                shadow="2xl"
                alt="Team meeting"
                opacity={0.9}
              />
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={32} position="relative" overflow="hidden">
        <Container maxW="5xl">
          <Box 
            bg="brand.500" 
            rounded="3xl" 
            p={{ base: 10, md: 20 }} 
            textAlign="center"
            position="relative"
            overflow="hidden"
            boxShadow="2xl"
          >
            {/* Background patterns */}
            <Box position="absolute" top="0" left="0" w="full" h="full" bgImage="radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)" bgSize="30px 30px" opacity="0.3" />
            
            <VStack spacing={8} position="relative" zIndex={1}>
              <Heading color="white" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold">
                Ready to start closing more deals?
              </Heading>
              <Text color="whiteAlpha.900" fontSize="xl" maxW="2xl" mx="auto">
                Join high-growth insurance teams using Clozone to ramp reps faster and boost win rates.
              </Text>
              <HStack spacing={4} justify="center" pt={4} flexWrap="wrap">
                <Button 
                  size="xl" 
                  h="64px" 
                  bg="white" 
                  color="brand.600" 
                  _hover={{ bg: 'gray.50' }} 
                  fontSize="xl" 
                  px={10}
                  as="a"
                  href="https://calendly.com/your-link"
                  target="_blank"
                >
                  Schedule Demo
                </Button>
                <Button 
                  size="xl" 
                  h="64px" 
                  variant="outline" 
                  color="white" 
                  borderColor="whiteAlpha.500"
                  _hover={{ bg: 'whiteAlpha.100' }} 
                  fontSize="xl" 
                  px={10}
                  as="a"
                  href="https://app.clozone.ai/auth"
                >
                  Sign In
                </Button>
              </HStack>
              <Text color="whiteAlpha.700" fontSize="sm" pt={4}>
                Free 14-day trial • No credit card required • Cancel anytime
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="white" borderTop="1px" borderColor="gray.100" py={12}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr' }} gap={12}>
            <GridItem>
              <Image src="/logolong.png" alt="Clozone" h="32px" mb={6} />
              <Text color="gray.500" mb={6}>
                The AI sales training platform that turns average reps into top performers through realistic practice.
              </Text>
              <HStack spacing={4}>
                {/* Social icons could go here */}
              </HStack>
            </GridItem>
            <GridItem>
              <Heading size="sm" mb={4}>Product</Heading>
              <VStack align="start" spacing={3} color="gray.600">
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Features</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Pricing</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Case Studies</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Reviews</Text>
              </VStack>
            </GridItem>
            <GridItem>
              <Heading size="sm" mb={4}>Company</Heading>
              <VStack align="start" spacing={3} color="gray.600">
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>About Us</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Careers</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Blog</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Contact</Text>
              </VStack>
            </GridItem>
            <GridItem>
              <Heading size="sm" mb={4}>Legal</Heading>
              <VStack align="start" spacing={3} color="gray.600">
                <Text as="a" href="/terms-of-service.html" _hover={{ color: 'brand.500' }}>Terms</Text>
                <Text as="a" href="/privacy-policy.html" _hover={{ color: 'brand.500' }}>Privacy</Text>
                <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Security</Text>
              </VStack>
            </GridItem>
          </Grid>
          <Divider my={12} borderColor="gray.100" />
          <Text textAlign="center" color="gray.400" fontSize="sm">
            © 2025 Clozone AI. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  )
}

export default App

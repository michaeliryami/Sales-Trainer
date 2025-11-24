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
} from '@chakra-ui/react'
import {
  Phone,
  BarChart2,
  BookOpen,
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
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Image src="/logolong.png" alt="Clozone" h={{ base: '32px', md: '40px' }} />
            <HStack spacing={{ base: 2, md: 4 }}>
              <Button 
                as="a" 
                href="https://app.clozone.ai/auth" 
                variant="ghost" 
                color="gray.600"
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'sm', md: 'md' }}
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
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'sm', md: 'md' }}
                _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s"
                px={{ base: 4, md: 6 }}
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
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="radial-gradient(rgba(242, 111, 37, 0.35) 2px, transparent 2px)"
          bgSize="32px 32px"
          opacity={0.85}
          pointerEvents="none"
        />

        <Container maxW="7xl" position="relative">
          <Grid templateColumns={{ base: '1fr', lg: '1.2fr 1fr' }} gap={12} alignItems="center">
            <GridItem>
              <VStack align="flex-start" spacing={8}>
                <Box
                  fontSize={{ base: '5xl', md: '6xl', lg: '7xl' }}
                  fontWeight="900"
                  lineHeight="1.1"
                  letterSpacing="-0.02em"
                  className="fade-in-up"
                  color="gray.900"
                  minH={{ base: '120px', md: 'auto' }}
                >
                  <Box as="span" display="block">
                    Turn Every Rep
                  </Box>
                  <Box as="span" display="block">
                    Into a{' '}
                    <Box
                      as="span"
                      bgGradient="linear(to-r, brand.500, brand.600)"
                      bgClip="text"
                      className="rotate-text"
                      display="inline"
                      key={rotatingText}
                    >
                      {rotatingWords[rotatingText]}
                    </Box>
                  </Box>
                </Box>
                
                <Text 
                  fontSize={{ base: 'xl', md: '2xl' }} 
                  color="gray.600" 
                  lineHeight="tall"
                  className="fade-in-up delay-1"
                  maxW="lg"
                >
                  Practice unlimited calls with realistic AI prospects. Get instant feedback, master objections, and close more deals—without burning leads.
                </Text>

                <HStack spacing={4} className="fade-in-up delay-2" flexWrap="wrap" w="full">
                  <Button
                    as="a"
                    href="https://calendly.com/your-link"
                    target="_blank"
                    size={{ base: 'md', md: 'lg' }}
                    h={{ base: '48px', md: '64px' }}
                    px={{ base: 6, md: 10 }}
                    fontSize={{ base: 'md', md: 'xl' }}
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: 'xl' }}
                    transition="all 0.3s"
                    rounded="2xl"
                    flex={{ base: '1 1 100%', md: '0 1 auto' }}
                  >
                    Book a Demo
                  </Button>
                  <Button
                    size={{ base: 'md', md: 'lg' }}
                    h={{ base: '48px', md: '64px' }}
                    px={{ base: 6, md: 8 }}
                    fontSize={{ base: 'sm', md: 'lg' }}
                    variant="ghost"
                    color="gray.600"
                    _hover={{ bg: 'blackAlpha.50' }}
                    rounded="2xl"
                    leftIcon={<Icon as={PlayCircle} />}
                    onClick={() => {
                      document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    flex={{ base: '1 1 100%', md: '0 1 auto' }}
                  >
                    See How It Works
                  </Button>
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
              </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Demo Video Section */}
      <Box 
        as="section" 
        id="demo-video" 
        minH="100vh"
        position="relative"
        pt={{ base: 32, lg: 20 }}
        pb={20}
        display="flex"
        alignItems="center"
        bg="gray.50"
      >
        <Container maxW="6xl" position="relative">
          <VStack spacing={8} align="stretch">
            <VStack spacing={4} textAlign="center">
              <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} color="gray.900">
                Watch How Clozone Works
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="2xl">
                Here's Anders doing a live practice call with our AI prospect. See how realistic the conversation feels and how instant feedback helps improve performance.
              </Text>
            </VStack>
            <Box
              position="relative"
              bg="gray.900"
              rounded="3xl"
              overflow="hidden"
              boxShadow="2xl"
              border="1px solid"
              borderColor="gray.200"
              w="full"
              h={{ base: '50vh', md: '65vh' }}
              minH={{ base: '350px', md: '500px' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack spacing={4}>
                <Icon as={PlayCircle} w={20} h={20} color="brand.400" />
                <Text color="white" fontSize="xl" fontWeight="semibold">
                  Demo video coming soon
                </Text>
                <Text color="gray.300" fontSize="md">
                  Add your Loom or Vimeo link here when it\u2019s ready.
                </Text>
              </VStack>
            </Box>
          </VStack>
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
                Access 40+ pre-built insurance scenarios covering a ton of potential life insurance leads. Or build your own custom scenarios in minutes.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Platform Screenshots */}
      <Box py={24} bg="gray.50">
        <Container maxW="7xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Badge bg="brand.50" color="brand.600" px={3} py={1} rounded="full">See It In Action</Badge>
            <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" color="gray.900">
              Built for reps and managers
            </Heading>
            <Text fontSize="xl" color="gray.500" maxW="2xl">
              Practice sessions and performance tracking, all in one platform
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Playground Screenshot */}
            <Box
              rounded="3xl"
              overflow="hidden"
              bg="white"
              boxShadow="2xl"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ boxShadow: '2xl', transform: 'translateY(-4px)' }}
              transition="all 0.3s"
            >
              <Image 
                src="/1.png" 
                alt="Playground - Practice with AI prospects"
                w="full"
                h="auto"
                objectFit="cover"
              />
              <Box p={6}>
                <Heading size="md" mb={2} color="gray.900">
                  Playground
                </Heading>
                <Text color="gray.600" lineHeight="relaxed">
                  Unlimited practice calls with realistic AI prospects. Choose from built-in scenarios or create custom ones.
                </Text>
              </Box>
            </Box>

            {/* My Performance Screenshot */}
            <Box
              rounded="3xl"
              overflow="hidden"
              bg="white"
              boxShadow="2xl"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ boxShadow: '2xl', transform: 'translateY(-4px)' }}
              transition="all 0.3s"
            >
              <Image 
                src="/2.png" 
                alt="My Performance - Track your progress"
                w="full"
                h="auto"
                objectFit="cover"
              />
              <Box p={6}>
                <Heading size="md" mb={2} color="gray.900">
                  My Performance
                </Heading>
                <Text color="gray.600" lineHeight="relaxed">
                  Track your progress, review detailed feedback, and see your improvement over time with comprehensive analytics.
                </Text>
              </Box>
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
         
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="white" borderTop="1px" borderColor="gray.100" py={12}>
        <Container maxW="5xl">
          <VStack spacing={4}>
            <Image src="/logolong.png" alt="Clozone" h="32px" />
            <Text color="gray.500" textAlign="center">
              © 2025 Clozone AI. All rights reserved.
            </Text>
            <HStack spacing={4} color="gray.600" fontWeight="500" flexWrap="wrap" justify="center">
              <Text as="a" href="/terms-of-service.html" _hover={{ color: 'brand.500' }}>Terms</Text>
              <Text color="gray.300">•</Text>
              <Text as="a" href="/privacy-policy.html" _hover={{ color: 'brand.500' }}>Privacy</Text>
            </HStack>
            <VStack spacing={2} mt={4}>
              <Text fontSize="sm" color="gray.500" fontWeight="500">
                Contact
              </Text>
              <HStack spacing={4} flexWrap="wrap" justify="center">
                <Text 
                  as="a" 
                  href="mailto:michael@clozone.ai" 
                  fontSize="sm"
                  color="gray.600" 
                  _hover={{ color: 'brand.500' }}
                >
                  michael@clozone.ai
                </Text>
                <Text color="gray.300">•</Text>
                <Text 
                  as="a" 
                  href="mailto:andersholly@clozone.ai" 
                  fontSize="sm"
                  color="gray.600" 
                  _hover={{ color: 'brand.500' }}
                >
                  andersholly@clozone.ai
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default App

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  useColorModeValue,
  Link,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import {
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  Award,
  Sparkles,
} from 'lucide-react'

function App() {
  const bg = useColorModeValue('white', 'gray.900')
  const textPrimary = useColorModeValue('gray.900', 'white')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bg} minH="100vh">
      {/* Navigation */}
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.8)')}
        backdropFilter="blur(10px)"
        borderBottom="1px"
        borderColor={borderColor}
        zIndex={1000}
      >
        <Container maxW="7xl">
          <Flex h={20} alignItems="center" justifyContent="space-between">
            <HStack spacing={3}>
              <Icon as={Sparkles} boxSize={8} color="brand.500" />
              <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                Clozone
              </Text>
            </HStack>
            <HStack spacing={8}>
              <Link href="#features" fontSize="md" fontWeight="500" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Features
              </Link>
              <Link href="#pricing" fontSize="md" fontWeight="500" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Pricing
              </Link>
              <Button
                as="a"
                href="https://app.clozone.ai"
                variant="ghost"
                colorScheme="brand"
              >
                Sign In
              </Button>
              <Button
                as="a"
                href="https://calendly.com/your-link"
                bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                color="white"
                _hover={{ bg: 'linear-gradient(135deg, #d95e1e, #b84e19)' }}
                shadow="lg"
              >
                Book Demo
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box pt={32} pb={20} bgGradient="linear(to-br, orange.50, white, orange.50)">
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center" mx="auto" maxW="4xl">
            <Badge
              colorScheme="brand"
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              fontWeight="600"
            >
              AI-Powered Sales Training
            </Badge>
            
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="800"
              lineHeight="1.1"
              color={textPrimary}
              letterSpacing="-0.02em"
            >
              Turn Every Rep Into an
              <Text as="span" color="brand.500" display="block">
                Objection-Handling Machine
              </Text>
            </Heading>
            
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={textSecondary}
              maxW="2xl"
              lineHeight="1.7"
            >
              24/7 AI role-play training for life insurance agents. 
              Practice unlimited scenarios, get instant feedback, and close more deals.
            </Text>
            
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                fontSize="lg"
                px={8}
                h={14}
                bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                color="white"
                _hover={{
                  bg: 'linear-gradient(135deg, #d95e1e, #b84e19)',
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                shadow="lg"
                transition="all 0.3s"
                as="a"
                href="https://calendly.com/your-link"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                fontSize="lg"
                px={8}
                h={14}
                variant="outline"
                colorScheme="brand"
                borderWidth="2px"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
                transition="all 0.3s"
                as="a"
                href="#demo"
              >
                Watch Demo
              </Button>
            </HStack>

            <HStack spacing={8} pt={8} color={textSecondary} fontSize="sm">
              <HStack>
                <Icon as={CheckCircle} color="brand.500" />
                <Text>14-day free trial</Text>
              </HStack>
              <HStack>
                <Icon as={CheckCircle} color="brand.500" />
                <Text>No credit card required</Text>
              </HStack>
              <HStack>
                <Icon as={CheckCircle} color="brand.500" />
                <Text>Cancel anytime</Text>
              </HStack>
            </HStack>
          </VStack>

          {/* Demo Screenshot Placeholder */}
          <Box
            mt={16}
            borderRadius="2xl"
            overflow="hidden"
            shadow="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <Box
              h="500px"
              bgGradient="linear(to-br, brand.100, white)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack spacing={4}>
                <Icon as={MessageSquare} boxSize={20} color="brand.500" />
                <Text fontSize="xl" fontWeight="600" color={textSecondary}>
                  Dashboard Screenshot / Demo Video
                </Text>
              </VStack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" py={20} bg={useColorModeValue('white', 'gray.900')}>
        <Container maxW="7xl">
          <VStack spacing={4} textAlign="center" mb={16}>
            <Badge colorScheme="brand" fontSize="sm" px={3} py={1}>
              Features
            </Badge>
            <Heading fontSize="4xl" fontWeight="700" color={textPrimary}>
              Everything You Need to Train Winners
            </Heading>
            <Text fontSize="lg" color={textSecondary} maxW="2xl">
              Give your team the tools they need to master objections, 
              close more deals, and hit quota consistently.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {[
              {
                icon: Phone,
                title: 'AI Role-Play Calls',
                description: 'Practice with realistic AI prospects that mirror your real customer conversations. Available 24/7.',
              },
              {
                icon: Target,
                title: 'Custom Scenarios',
                description: 'Create scenarios for your specific products, objections, and sales processes. Make training relevant.',
              },
              {
                icon: BarChart3,
                title: 'Instant AI Grading',
                description: 'Get detailed feedback on every call. See exactly what worked and what needs improvement.',
              },
              {
                icon: Users,
                title: 'Team Management',
                description: 'Assign scenarios, track progress, and identify coaching opportunities across your entire team.',
              },
              {
                icon: TrendingUp,
                title: 'Performance Analytics',
                description: 'Track improvement over time. See which reps are ready to sell and which need more coaching.',
              },
              {
                icon: Clock,
                title: 'Save Manager Time',
                description: 'Stop spending hours on role-plays. Let AI handle practice while managers focus on selling.',
              },
            ].map((feature, idx) => (
              <Box
                key={idx}
                p={8}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={useColorModeValue('white', 'gray.800')}
                transition="all 0.3s"
                _hover={{
                  borderColor: 'brand.500',
                  transform: 'translateY(-4px)',
                  shadow: 'xl',
                }}
              >
                <Icon
                  as={feature.icon}
                  boxSize={12}
                  color="brand.500"
                  mb={4}
                />
                <Heading fontSize="xl" fontWeight="600" mb={3} color={textPrimary}>
                  {feature.title}
                </Heading>
                <Text color={textSecondary} lineHeight="1.7">
                  {feature.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={20} bgGradient="linear(to-br, brand.500, brand.600)">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} textAlign="center">
            {[
              { number: '80%', label: 'Reduction in Training Time' },
              { number: '3.5x', label: 'Faster Ramp-Up for New Reps' },
              { number: '24/7', label: 'Practice Availability' },
            ].map((stat, idx) => (
              <VStack key={idx} spacing={2}>
                <Heading fontSize="5xl" fontWeight="800" color="white">
                  {stat.number}
                </Heading>
                <Text fontSize="lg" color="whiteAlpha.900" fontWeight="500">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="7xl">
          <VStack spacing={4} textAlign="center" mb={16}>
            <Badge colorScheme="brand" fontSize="sm" px={3} py={1}>
              Pricing
            </Badge>
            <Heading fontSize="4xl" fontWeight="700" color={textPrimary}>
              Simple, Transparent Pricing
            </Heading>
            <Text fontSize="lg" color={textSecondary} maxW="2xl">
              Start training your team today. Cancel anytime.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="6xl" mx="auto">
            {/* Pricing Card */}
            <Box
              p={8}
              borderRadius="2xl"
              borderWidth="2px"
              borderColor={borderColor}
              bg={useColorModeValue('white', 'gray.800')}
              position="relative"
            >
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="brand.500" mb={2}>
                    PER AGENT
                  </Text>
                  <HStack align="baseline">
                    <Heading fontSize="5xl" fontWeight="800" color={textPrimary}>
                      $99
                    </Heading>
                    <Text fontSize="lg" color={textSecondary}>
                      /month
                    </Text>
                  </HStack>
                  <Text mt={2} fontSize="sm" color={textSecondary}>
                    + $2,000 one-time setup fee
                  </Text>
                </Box>

                <List spacing={4}>
                  {[
                    'Unlimited AI practice calls',
                    'Custom scenarios & templates',
                    'Instant AI grading & feedback',
                    'Performance analytics',
                    'Team management dashboard',
                    'PDF reports & exports',
                    'Email support',
                  ].map((feature, idx) => (
                    <ListItem key={idx}>
                      <HStack align="start">
                        <ListIcon as={CheckCircle} color="brand.500" mt={1} />
                        <Text color={textSecondary}>{feature}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>

                <Button
                  size="lg"
                  w="full"
                  bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                  color="white"
                  _hover={{ bg: 'linear-gradient(135deg, #d95e1e, #b84e19)' }}
                  as="a"
                  href="https://calendly.com/your-link"
                >
                  Get Started
                </Button>

                <Text fontSize="xs" color={textSecondary} textAlign="center">
                  14-day free trial • No credit card required
                </Text>
              </VStack>
            </Box>

            {/* Enterprise Card */}
            <Box
              p={8}
              borderRadius="2xl"
              borderWidth="2px"
              borderColor="brand.500"
              bg={useColorModeValue('white', 'gray.800')}
              position="relative"
              transform="scale(1.05)"
              shadow="xl"
            >
              <Badge
                position="absolute"
                top={-3}
                left="50%"
                transform="translateX(-50%)"
                colorScheme="brand"
                fontSize="sm"
                px={4}
                py={1}
              >
                Most Popular
              </Badge>

              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="brand.500" mb={2}>
                    VOLUME DISCOUNT
                  </Text>
                  <HStack align="baseline">
                    <Heading fontSize="5xl" fontWeight="800" color={textPrimary}>
                      $79
                    </Heading>
                    <Text fontSize="lg" color={textSecondary}>
                      /month
                    </Text>
                  </HStack>
                  <Text mt={2} fontSize="sm" color={textSecondary}>
                    For 26-50 agents (20% off)
                  </Text>
                </Box>

                <List spacing={4}>
                  {[
                    'Everything in Standard',
                    'Dedicated account manager',
                    'Custom branding',
                    'Priority support',
                    'Quarterly business reviews',
                    'API access',
                  ].map((feature, idx) => (
                    <ListItem key={idx}>
                      <HStack align="start">
                        <ListIcon as={CheckCircle} color="brand.500" mt={1} />
                        <Text color={textSecondary}>{feature}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>

                <Button
                  size="lg"
                  w="full"
                  bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                  color="white"
                  _hover={{ bg: 'linear-gradient(135deg, #d95e1e, #b84e19)' }}
                  as="a"
                  href="https://calendly.com/your-link"
                >
                  Contact Sales
                </Button>

                <Text fontSize="xs" color={textSecondary} textAlign="center">
                  Custom contract • Volume discounts available
                </Text>
              </VStack>
            </Box>

            {/* Enterprise Card */}
            <Box
              p={8}
              borderRadius="2xl"
              borderWidth="2px"
              borderColor={borderColor}
              bg={useColorModeValue('white', 'gray.800')}
            >
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="brand.500" mb={2}>
                    ENTERPRISE
                  </Text>
                  <Heading fontSize="5xl" fontWeight="800" color={textPrimary}>
                    Custom
                  </Heading>
                  <Text mt={2} fontSize="sm" color={textSecondary}>
                    For 51+ agents
                  </Text>
                </Box>

                <List spacing={4}>
                  {[
                    'Everything in Pro',
                    'White-label solution',
                    'SSO & advanced security',
                    'Custom integrations',
                    'Dedicated success team',
                    'SLA guarantees',
                  ].map((feature, idx) => (
                    <ListItem key={idx}>
                      <HStack align="start">
                        <ListIcon as={CheckCircle} color="brand.500" mt={1} />
                        <Text color={textSecondary}>{feature}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>

                <Button
                  size="lg"
                  w="full"
                  variant="outline"
                  colorScheme="brand"
                  borderWidth="2px"
                  as="a"
                  href="mailto:sales@clozone.ai"
                >
                  Contact Sales
                </Button>

                <Text fontSize="xs" color={textSecondary} textAlign="center">
                  Custom pricing & features
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bgGradient="linear(to-br, orange.50, white)">
        <Container maxW="4xl">
          <VStack spacing={8} textAlign="center">
            <Icon as={Award} boxSize={16} color="brand.500" />
            <Heading fontSize="4xl" fontWeight="700" color={textPrimary}>
              Ready to Transform Your Sales Training?
            </Heading>
            <Text fontSize="lg" color={textSecondary} maxW="2xl">
              Join leading life insurance agencies using Clozone to train 
              better reps, faster.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                fontSize="lg"
                px={8}
                h={14}
                bg="linear-gradient(135deg, #f26f25, #d95e1e)"
                color="white"
                _hover={{
                  bg: 'linear-gradient(135deg, #d95e1e, #b84e19)',
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                shadow="lg"
                transition="all 0.3s"
                as="a"
                href="https://calendly.com/your-link"
              >
                Book a Demo
              </Button>
              <Button
                size="lg"
                fontSize="lg"
                px={8}
                h={14}
                variant="outline"
                colorScheme="brand"
                borderWidth="2px"
                as="a"
                href="https://app.clozone.ai"
              >
                Start Free Trial
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} bg={useColorModeValue('gray.50', 'gray.900')} borderTop="1px" borderColor={borderColor}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <HStack>
                <Icon as={Sparkles} boxSize={6} color="brand.500" />
                <Text fontSize="xl" fontWeight="bold" color={textPrimary}>
                  Clozone
                </Text>
              </HStack>
              <Text fontSize="sm" color={textSecondary}>
                AI-powered sales training for life insurance agencies.
              </Text>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                Product
              </Text>
              <Link href="#features" fontSize="sm" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Features
              </Link>
              <Link href="#pricing" fontSize="sm" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Pricing
              </Link>
              <Link href="https://app.clozone.ai" fontSize="sm" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Sign In
              </Link>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                Company
              </Text>
              <Link href="mailto:hello@clozone.ai" fontSize="sm" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Contact
              </Link>
              <Link href="/privacy" fontSize="sm" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" fontSize="sm" color={textSecondary} _hover={{ color: 'brand.500' }}>
                Terms of Service
              </Link>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                Get Started
              </Text>
              <Button
                as="a"
                href="https://calendly.com/your-link"
                colorScheme="brand"
                size="sm"
                w="full"
              >
                Book a Demo
              </Button>
            </VStack>
          </SimpleGrid>

          <Box mt={12} pt={8} borderTop="1px" borderColor={borderColor}>
            <Text fontSize="sm" color={textSecondary} textAlign="center">
              © {new Date().getFullYear()} Clozone. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default App

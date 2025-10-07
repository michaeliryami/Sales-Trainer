import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Flex,
  Badge,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  SimpleGrid
} from '@chakra-ui/react'
import { Users, UserPlus, Mail, Shield, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useProfile } from '../contexts/ProfileContext'
import { supabase } from '../config/supabase'
import { Profile } from '../types/database'

const Organization: React.FC = () => {
  const { profile, organization, userRole, loading: profileLoading, refreshOrganization } = useProfile()
  const [orgUsers, setOrgUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingInvites, setPendingInvites] = useState<string[]>([])
  const [acceptedInvites, setAcceptedInvites] = useState<string[]>([])
  const [isEditingOrgName, setIsEditingOrgName] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [savingOrgName, setSavingOrgName] = useState(false)
  
  // Invite modal state
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  
  const toast = useToast()
  
  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const headerBg = useColorModeValue('gray.50/80', 'gray.800/80')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  const fetchOrganizationUsers = async () => {
    if (!organization) return

    try {
      setLoading(true)
      setError('')

      console.log('Fetching users for organization:', organization.id)
      
      // Fetch all profiles that belong to this organization
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('org', organization.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching organization users:', error)
        setError('Failed to load organization members')
        return
      }

          console.log('Organization users fetched:', data)
          
          // Sort users to show admin first
          const sortedUsers = (data || []).sort((a, b) => {
            // Admin user comes first
            if (a.id === organization.admin) return -1
            if (b.id === organization.admin) return 1
            // Then sort by created_at
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          
          setOrgUsers(sortedUsers)

      // Get invited users from organization.users list
      if (organization.users) {
        try {
          let usersList: string[] = []
          if (Array.isArray(organization.users)) {
            // PostgreSQL array - use directly
            usersList = organization.users
          } else if (typeof organization.users === 'string') {
            // Handle edge case where it might be stored as JSON string
            usersList = JSON.parse(organization.users)
          }

          // Get emails that already have profiles in this org (these are active users)
          const existingOrgEmails = (data || []).map(user => user.email)
          
          // Get emails that are invited but don't have active profiles in this org
          const invitedEmails = usersList.filter(email => !existingOrgEmails.includes(email))
          
          console.log('Invited emails not in org:', invitedEmails)
          
          // Check which of these emails have profiles in the system (any org)
          if (invitedEmails.length > 0) {
            try {
              console.log('Checking profiles for emails:', invitedEmails)
              
              // Use backend API to check profiles (bypasses RLS)
              try {
                const response = await fetch('/api/profiles/check-emails', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ emails: invitedEmails }),
                })

                if (response.ok) {
                  const result = await response.json()
                  console.log('Backend profile check result:', result)
                  
                  setPendingInvites(result.pending || [])
                  setAcceptedInvites(result.accepted || [])
                } else {
                  console.error('Error checking profiles via backend')
                  setPendingInvites(invitedEmails)
                  setAcceptedInvites([])
                }
              } catch (error) {
                console.error('Error checking profiles via backend:', error)
                setPendingInvites(invitedEmails)
                setAcceptedInvites([])
              }
            } catch (error) {
              console.error('Error checking profiles:', error)
              setPendingInvites(invitedEmails)
              setAcceptedInvites([])
            }
          } else {
            console.log('No invited emails to check')
            setPendingInvites([])
            setAcceptedInvites([])
          }
        } catch (parseError) {
          console.error('Error parsing organization users list:', parseError)
          setPendingInvites([])
          setAcceptedInvites([])
        }
      } else {
        setPendingInvites([])
        setAcceptedInvites([])
      }
    } catch (err) {
      console.error('Error in fetchOrganizationUsers:', err)
      setError('Failed to load organization members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profileLoading && organization) {
      fetchOrganizationUsers()
    } else if (!profileLoading && !organization) {
      setLoading(false)
    }
  }, [organization, profileLoading])

  const getUserRole = (user: Profile) => {
    if (organization?.admin === user.id) {
      return 'Admin'
    }
    return 'Member'
  }

  const getUserStatus = () => {
    // Active users don't need a status badge
    return null
  }

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !organization || !profile) return

    setInviteLoading(true)
    setInviteError('')

    try {
      const response = await fetch('/api/invites/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          organizationId: organization.id,
          adminUserId: profile.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setInviteError(data.error || 'Failed to invite user')
        return
      }

      // Success
      toast({
        title: 'User Invited',
        description: `Successfully invited ${inviteEmail}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Clear form and close modal
      setInviteEmail('')
      onInviteClose()
      
      // Refresh the users list
      await fetchOrganizationUsers()

    } catch (error) {
      console.error('Error inviting user:', error)
      setInviteError('Failed to invite user. Please try again.')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemoveInvite = async (email: string) => {
    if (!organization || !profile) return

    try {
      const response = await fetch('/api/invites/invite', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          organizationId: organization.id,
          adminUserId: profile.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to remove invitation',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Success
      toast({
        title: 'Invitation Removed',
        description: `Removed invitation for ${email}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Refresh the users list
      await fetchOrganizationUsers()

    } catch (error) {
      console.error('Error removing invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove invitation. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (profileLoading) {
    return (
      <Box bg={bg} h="calc(100vh - 88px)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Loading profile...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (!organization) {
    return (
      <Box bg={bg} h="calc(100vh - 88px)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Alert status="warning" maxW="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">No Organization Found</Text>
            <Text fontSize="sm">You don't seem to be associated with any organization yet.</Text>
          </Box>
        </Alert>
      </Box>
    )
  }

  return (
    <Box bg={bg} h="calc(100vh - 88px)" overflow="hidden">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Team Members */}
        <Panel 
          defaultSize={50} 
          minSize={35}
          maxSize={65}
        >
          <Box 
            bg={cardBg} 
            h="full"
            borderRight="1px" 
            borderColor={borderColor} 
            overflow="hidden" 
            display="flex" 
            flexDirection="column"
            borderRadius="xl"
            borderTopRightRadius="0"
            borderBottomRightRadius="0"
          >
            {/* Left Panel Header */}
            <Box 
              bg={headerBg}
              backdropFilter="blur(10px)"
              borderBottom="1px"
              borderColor={borderColor}
              px={6}
              py={5}
            >
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1} flex={1}>
                  <Heading 
                    size="lg" 
                    color={useColorModeValue('gray.900', 'white')}
                    fontWeight="600"
                    letterSpacing="-0.02em"
                  >
                    Team Members
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.500', 'gray.400')}
                    fontWeight="400"
                  >
                    Manage team members and their permissions
                  </Text>
                </VStack>
                {userRole.isAdmin && (
                  <Button
                    leftIcon={<Icon as={UserPlus} boxSize="4" />}
                    bg="linear-gradient(135deg, #3b82f6, #2563eb)"
                    color="white"
                    size="sm"
                    onClick={onInviteOpen}
                    _hover={{
                      bg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      transform: 'translateY(-1px)',
                      shadow: 'lg'
                    }}
                    borderRadius="xl"
                    fontWeight="600"
                    px={4}
                    shadow="sm"
                  >
                    Invite User
                  </Button>
                )}
              </Flex>
            </Box>
            
            {/* Left Panel Content */}
            <Box flex={1} overflowY="auto" p={6}>
              {error && (
                <Alert status="error" mb={4} borderRadius="xl">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <VStack spacing={4} align="stretch">
                {loading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <Spinner color="blue.500" />
                    <Text ml={3} color={useColorModeValue('gray.600', 'gray.400')}>
                      Loading team members...
                    </Text>
                  </Box>
                ) : orgUsers.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Icon as={Users} boxSize={12} color={useColorModeValue('gray.400', 'gray.500')} mb={4} />
                    <Text color={useColorModeValue('gray.500', 'gray.400')} fontSize="lg" mb={2}>
                      No team members found
                    </Text>
                    <Text color={useColorModeValue('gray.400', 'gray.500')} fontSize="sm">
                      Invite users to get started
                    </Text>
                  </Box>
                ) : (
                  // Combine active users, pending invites, and accepted invites into one list
                  [
                    // Active users
                    ...orgUsers.map((user) => ({
                      type: 'user',
                      id: user.id,
                      display_name: user.display_name || 'Unnamed User',
                      email: user.email,
                      role: getUserRole(user),
                      status: getUserStatus(),
                      user: user
                    })),
                    // Pending invites (no profile exists yet)
                    ...pendingInvites.map((email) => ({
                      type: 'invite',
                      id: email,
                      display_name: email.split('@')[0], // Use email prefix as display name
                      email: email,
                      role: 'Member',
                      status: 'Pending',
                      user: null
                    })),
                    // Accepted invites (profile exists but not in this org)
                    ...acceptedInvites.map((email) => ({
                      type: 'accepted',
                      id: email,
                      display_name: email.split('@')[0], // Use email prefix as display name
                      email: email,
                      role: 'Member',
                      status: 'Accepted',
                      user: null
                    }))
                  ].map((item) => (
                    <Card 
                      key={item.id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="2xl"
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.600'),
                        shadow: 'lg',
                        transform: 'translateY(-1px)'
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      size="sm"
                      shadow="sm"
                    >
                      <CardBody p={5}>
                        <Flex justify="space-between" align="center">
                          <Box flex={1}>
                            <HStack spacing={3} mb={2}>
                              <Icon as={item.type === 'user' ? Users : Mail} boxSize={4} color={accentColor} />
                              <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                                {item.display_name}
                              </Text>
                            </HStack>
                            
                            <HStack spacing={2} mb={3}>
                              <Icon as={Mail} boxSize={3} color={useColorModeValue('gray.400', 'gray.500')} />
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                {item.email}
                              </Text>
                            </HStack>
                            
                            <HStack spacing={2}>
                              <Badge 
                                colorScheme={item.role === 'Admin' ? 'red' : 'blue'} 
                                variant="subtle"
                                size="sm"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontWeight="500"
                              >
                                <HStack spacing={1}>
                                  <Icon as={Shield} boxSize={2} />
                                  <Text>{item.role}</Text>
                                </HStack>
                              </Badge>
                              {item.status === 'Pending' && (
                                <Badge 
                                  colorScheme="yellow"
                                  variant="solid"
                                  size="sm"
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                  fontWeight="500"
                                >
                                  Pending
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                          
                          {userRole.isAdmin && (
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<Icon as={MoreVertical} />}
                                variant="ghost"
                                size="sm"
                                aria-label="User actions"
                              />
                              <MenuList>
                                {item.type === 'user' ? (
                                  <>
                                    <MenuItem icon={<Icon as={Edit2} />}>
                                      Edit Role
                                    </MenuItem>
                                    <MenuItem icon={<Icon as={Mail} />}>
                                      Resend Invite
                                    </MenuItem>
                                    {item.user?.id !== profile?.id && (
                                      <MenuItem icon={<Icon as={Trash2} />} color="red.500">
                                        Remove User
                                      </MenuItem>
                                    )}
                                  </>
                                ) : item.type === 'accepted' ? (
                                  <>
                                    <MenuItem icon={<Icon as={Mail} />}>
                                      Move to Organization
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<Icon as={Trash2} />} 
                                      color="red.500"
                                      onClick={() => handleRemoveInvite(item.email)}
                                    >
                                      Remove Invitation
                                    </MenuItem>
                                  </>
                                ) : (
                                  <MenuItem 
                                    icon={<Icon as={Trash2} />} 
                                    color="red.500"
                                    onClick={() => handleRemoveInvite(item.email)}
                                  >
                                    Cancel Invitation
                                  </MenuItem>
                                )}
                              </MenuList>
                            </Menu>
                          )}
                        </Flex>
                      </CardBody>
                    </Card>
                  ))
                )}
              </VStack>
            </Box>
          </Box>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle>
          <Box 
            w="1px" 
            h="full" 
            bg={borderColor}
            _hover={{ 
              bg: accentColor,
              w: "3px",
              shadow: 'lg'
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="col-resize"
            position="relative"
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="24px"
              h="48px"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={0}
              _hover={{ opacity: 1, shadow: 'md' }}
              transition="all 0.3s"
              backdropFilter="blur(10px)"
            >
              <VStack spacing="2px">
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
              </VStack>
            </Box>
          </Box>
        </PanelResizeHandle>

        {/* Right Panel - Organization Overview & Settings */}
        <Panel 
          defaultSize={50} 
          minSize={35}
        >
          <Box 
            bg={cardBg} 
            h="full" 
            overflow="hidden" 
            display="flex" 
            flexDirection="column"
            borderRadius="xl"
            borderTopLeftRadius="0"
            borderBottomLeftRadius="0"
          >
            {/* Right Panel Header */}
            <Box 
              bg={headerBg}
              backdropFilter="blur(10px)"
              borderBottom="1px"
              borderColor={borderColor}
              px={6}
              py={5}
            >
              <VStack align="start" spacing={1}>
                <Heading 
                  size="lg" 
                  color={useColorModeValue('gray.900', 'white')}
                  fontWeight="600"
                  letterSpacing="-0.02em"
                >
                  Organization Overview
                </Heading>
                <Text 
                  fontSize="sm" 
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontWeight="400"
                >
                  Team statistics and organizational settings
                </Text>
              </VStack>
            </Box>
            
            {/* Right Panel Content */}
            <Box flex={1} overflowY="auto" p={6}>
              <VStack spacing={6} align="stretch">
                {/* Team Statistics */}
                <Card 
                  bg={cardBg}
                  border="1px solid" 
                  borderColor={borderColor}
                  borderRadius="2xl"
                  shadow="md"
                  _hover={{ shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <CardBody p={6}>
                    <Heading size="sm" color={useColorModeValue('gray.900', 'white')} mb={4}>
                      Team Overview
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Box textAlign="center" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('gray.900', 'white')}>
                          {orgUsers.length}
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                          Total Members
                        </Text>
                      </Box>
                      
                      <Box textAlign="center" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('gray.900', 'white')}>
                          {pendingInvites.length}
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                          Pending
                        </Text>
                      </Box>
                      
                      <Box textAlign="center" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('gray.900', 'white')}>
                          {orgUsers.filter(user => getUserRole(user) === 'Admin').length}
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                          Admins
                        </Text>
                      </Box>
                      
                      <Box textAlign="center" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('gray.900', 'white')}>
                          {orgUsers.filter(user => getUserRole(user) === 'Member').length}
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                          Members
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Organization Settings */}
                <Card 
                  bg={cardBg}
                  border="1px solid" 
                  borderColor={borderColor}
                  borderRadius="2xl"
                  shadow="md"
                  _hover={{ shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <CardBody p={6}>
                    <Heading 
                      size="md" 
                      color={useColorModeValue('gray.900', 'white')} 
                      mb={4}
                      fontWeight="600"
                      letterSpacing="-0.01em"
                    >
                      Organization Settings
                    </Heading>
                    
                    <VStack spacing={4} align="stretch">
                      <Box p={4} bg={useColorModeValue('gray.50/50', 'gray.800/50')} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                        <HStack justify="space-between" align="center">
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                              Organization Name
                            </Text>
                            {isEditingOrgName ? (
                              <HStack mt={2} spacing={2} align="center">
                                <Input 
                                  size="sm" 
                                  value={newOrgName}
                                  onChange={(e) => setNewOrgName(e.target.value)}
                                  bg={useColorModeValue('white', 'gray.850')}
                                  borderColor={borderColor}
                                  borderRadius="lg"
                                  maxW="360px"
                                />
                                <Button 
                                  size="sm" 
                                  colorScheme="brand" 
                                  isLoading={savingOrgName}
                                  onClick={async () => {
                                    if (!organization) return
                                    try {
                                      setSavingOrgName(true)
                                      const { error } = await supabase
                                        .from('organizations')
                                        .update({ name: newOrgName })
                                        .eq('id', organization.id)
                                      if (error) throw error
                                      await refreshOrganization()
                                      setIsEditingOrgName(false)
                                      toast({ title: 'Organization name updated', status: 'success' })
                                    } catch (err) {
                                      console.error('Error updating org name:', err)
                                      toast({ title: 'Failed to update name', status: 'error' })
                                    } finally {
                                      setSavingOrgName(false)
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setIsEditingOrgName(false)}
                                >
                                  Cancel
                                </Button>
                              </HStack>
                            ) : (
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                {organization?.name || 'Unknown Organization'}
                              </Text>
                            )}
                          </Box>
                          {userRole.isAdmin && !isEditingOrgName && (
                            <Button 
                              size="xs" 
                              variant="outline" 
                              borderRadius="lg"
                              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                              onClick={() => {
                                setNewOrgName(organization?.name || '')
                                setIsEditingOrgName(true)
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </HStack>
                      </Box>
                      
                      <Box p={4} bg={useColorModeValue('gray.50/50', 'gray.800/50')} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                        <HStack justify="space-between" align="center">
                          <Box>
                            <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.900', 'white')}>
                              Billing Plan
                            </Text>
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                              Professional - $99/month
                            </Text>
                          </Box>
                          {userRole.isAdmin && (
                            <Button 
                              size="xs" 
                              variant="outline"
                              borderRadius="lg"
                              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                            >
                              Manage
                            </Button>
                          )}
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>
          </Box>
        </Panel>
        </PanelGroup>

        {/* Invite User Modal */}
        <Modal isOpen={isInviteOpen} onClose={onInviteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite User to {organization?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!inviteError}>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !inviteLoading) {
                    handleInviteUser()
                  }
                }}
              />
              {inviteError && (
                <FormErrorMessage>{inviteError}</FormErrorMessage>
              )}
            </FormControl>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mt={2}>
              The user will receive an email invitation and will be able to sign up using this email address.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInviteClose} isDisabled={inviteLoading}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleInviteUser}
              isLoading={inviteLoading}
              loadingText="Inviting..."
              isDisabled={!inviteEmail.trim()}
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Organization

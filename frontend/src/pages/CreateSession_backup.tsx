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
  useColorModeValue,
  useDisclosure,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import React, { useState, useRef, useEffect } from 'react'
import { FileText, MessageSquare, Search } from 'lucide-react'
import Vapi from '@vapi-ai/web'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ReactMarkdown from 'react-markdown'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'
import { ALL_BUILT_IN_TEMPLATES } from '../config/templateLibrary'
import { GENERAL_LIFE_INSURANCE_RUBRIC } from '../config/rubricLibrary'

interface Assignment {
  id: number
  title: string
  description: string
  template: number // template ID
  rubric: number // rubric ID
  assigned: string // JSON string of user IDs
  due: string
  created_at: string
}

interface Rubric {
  id: number
  title: string
  grading: any[]
  created_at: string
}

function CreateSession() {
  const { organization, profile, userRole } = useProfile()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templateSearchQuery, setTemplateSearchQuery] = useState('')
  
  // Assignment-related state for employees
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const accountType = 'employee' // Hardcoded account type
  const [isCreatingCall, setIsCreatingCall] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [vapiPublicKey, setVapiPublicKey] = useState<string>('')
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, timestamp: Date}>>([])
  const [fullTranscriptChunks, setFullTranscriptChunks] = useState<Array<{
    speaker: string, 
    text: string, 
    timestamp: Date,
    messageId?: string,
    confidence?: number,
    duration?: number
  }>>([])
  const [scriptText, setScriptText] = useState<string>('')
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const vapiRef = useRef<any>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const transcriptChunksRef = useRef<Array<{
    speaker: string, 
    text: string, 
    timestamp: Date,
    messageId?: string,
    confidence?: number,
    duration?: number
  }>>([])
  const callStartTimeRef = useRef<Date | null>(null)
  
  // Modal dragging and resizing state
  const [modalPosition, setModalPosition] = useState({ x: 20, y: 120 })
  const [modalSize, setModalSize] = useState({ width: 550, height: 650 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // Helper to merge overlapping transcript chunks from the same speaker
  const mergeWithOverlap = (previousText: string, incomingText: string): string => {
    const prev = String(previousText || '').trim()
    const curr = String(incomingText || '').trim()
    if (!prev) return curr
    if (!curr) return prev

    const normalizeWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim()
    const stripPunct = (s: string) => s.replace(/[\u2018\u2019\u201C\u201D]/g, '"').replace(/[^\p{L}\p{N}\s']/gu, ' ')
    const normalizeToken = (t: string) => {
      let x = t.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '')
      // simple stemming for common English suffixes
      if (x.length > 4) x = x.replace(/(ing|ed|ly)$/,'')
      if (x.length > 3) x = x.replace(/(s)$/,'')
      return x
    }
    const tokenize = (s: string) => normalizeWhitespace(stripPunct(s)).split(' ').filter(Boolean)

    const prevLC = prev.toLowerCase()
    const currLC = curr.toLowerCase()

    // Direct containment rules first
    if (currLC.includes(prevLC)) return curr
    if (prevLC.includes(currLC)) return prev
    if (currLC.startsWith(prevLC)) return curr

    // Token-based fuzzy overlap
    const prevTokens = tokenize(prev)
    const currTokens = tokenize(curr)
    const maxOverlapTokens = Math.min(20, prevTokens.length, currTokens.length)
    const minOverlapTokens = 3

    const equalsToken = (a: string, b: string) => normalizeToken(a) === normalizeToken(b)

    // Try largest overlap first
    for (let k = maxOverlapTokens; k >= minOverlapTokens; k--) {
      let match = true
      for (let i = 0; i < k; i++) {
        const a = prevTokens[prevTokens.length - k + i]
        const b = currTokens[i]
        if (!equalsToken(a, b)) { match = false; break }
      }
      if (match) {
        // Append only the non-overlapping tail of current tokens
        const tail = currTokens.slice(k)
        const appended = tail.join(' ')
        return appended ? (prev + ' ' + appended) : prev
      }
    }

    // If no clear token overlap, fall back to character overlap to avoid obvious dupes
    const maxCheck = Math.min(prevLC.length, currLC.length, 200)
    const minOverlapChars = 6
    for (let len = maxCheck; len >= minOverlapChars; len--) {
      if (prevLC.endsWith(currLC.substring(0, len))) {
        return prev + curr.substring(len)
      }
    }

    // Last resort: append with a space
    return prev + ' ' + curr
  }

  // Filter templates based on search query
  const filterTemplates = (templateList: typeof ALL_BUILT_IN_TEMPLATES | Template[]) => {
    if (!templateSearchQuery.trim()) return templateList
    
    const query = templateSearchQuery.toLowerCase()
    return templateList.filter(template => 
      template.title.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.difficulty?.toLowerCase().includes(query)
    )
  }

  const filteredBuiltInTemplates = filterTemplates(ALL_BUILT_IN_TEMPLATES)
  const filteredCustomTemplates = filterTemplates(templates)

  // Load script when selection changes
  useEffect(() => {
      if (!selectedTemplate) {
      setScriptText('')
        return
      }

      // Check if it's a built-in template first
      const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
      if (builtInTemplate) {
        setScriptText(builtInTemplate.script || '')
        return
      }

      // Otherwise check custom templates
      const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
      if (!customTemplate) {
        setScriptText('')
        return
      }

      // Use the custom template script
      setScriptText(customTemplate.script || '')
  }, [selectedTemplate, templates])

  const createAssistantAndStartCall = async () => {
    if (!vapiPublicKey) {
      alert('VAPI configuration not loaded. Please try again.')
      return
    }

    setIsCreatingCall(true)
    
    try {
      // Get the selected template (built-in or custom)
      const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
      const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
      const template = builtInTemplate || customTemplate
      
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
          scriptContent: scriptContent, // Send the script content
          templateTitle: template?.title, // Send template title for built-in templates
          insuranceType: organization?.insurance_type || 'life' // Send organization's insurance type
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
        vapiRef.current.on('call-start', (info: any) => {
          console.log('Call started', info)
          setIsCreatingCall(false)
          setIsCallActive(true)
          setTranscript([])
          setFullTranscriptChunks([])
          transcriptChunksRef.current = []
          callStartTimeRef.current = new Date()
          try {
            const id = info?.id || info?.callId || info?.call?.id || null
            if (id) setActiveCallId(String(id))
          } catch (e) {
            console.warn('Unable to read call id from call-start payload')
          }
        })

        vapiRef.current.on('call-end', async () => {
          console.log('Call ended')
          setIsCreatingCall(false)
          setIsCallActive(false)
          
          // Save session data to database immediately when call ends (ONLY for assignments)
          const chunks = transcriptChunksRef.current
          console.log('Call ended - checking if we should save:', {
            hasChunks: chunks.length > 0,
            hasProfile: !!profile?.id,
            hasOrg: !!organization?.id,
            isAssignment: !!selectedAssignment,
            chunkCount: chunks.length
          })
          
          // Save ALL sessions to database (both playground and assignments)
          if (chunks.length > 0 && profile?.id && organization?.id) {
            try {
              console.log('✅ Conditions met - Saving session to database...')
              const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
              const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
              const template = builtInTemplate || customTemplate
              console.log('Template found:', template?.title)
              
              const sessionData = {
                userId: profile.id,
                orgId: organization.id,
                sessionType: selectedAssignment ? 'assignment' : 'template',
                templateId: template?.id,
                assignmentId: selectedAssignment?.id,
                callId: activeCallId,
                vapiCallId: activeCallId,
                startTime: chunks[0]?.timestamp?.toISOString(),
                endTime: chunks[chunks.length - 1]?.timestamp?.toISOString(),
                durationSeconds: chunks.length > 0 
                  ? Math.round((chunks[chunks.length - 1].timestamp.getTime() - chunks[0].timestamp.getTime()) / 1000)
                  : 0,
                transcript: chunks,
                transcriptClean: chunks.map(c => `${c.speaker}: ${c.text}`).join('\n'),
                status: 'completed'
              }

              console.log('📤 Sending session data to backend:', sessionData)
              
              const saveResponse = await fetch('/api/analytics/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
              })

              console.log('📥 Backend response status:', saveResponse.status)
              
              if (saveResponse.ok) {
                const result = await saveResponse.json()
                console.log('✅ Session saved successfully:', result)
                
                // Grade ALL sessions (assignments and playground) using appropriate rubric
                if (result.data?.id) {
                  let rubricToUse = null
                  let rubricId = null
                  let assignmentId = null
                  
                  // For assignments, use the assignment's rubric
                  if (selectedAssignment) {
                    rubricToUse = rubrics.find(r => r.id === selectedAssignment.rubric)
                    rubricId = selectedAssignment.rubric
                    assignmentId = selectedAssignment.id
                    console.log('🎯 Using assignment rubric:', rubricId)
                  } else {
                    // For playground sessions, use the general life insurance rubric
                    rubricToUse = { 
                      id: GENERAL_LIFE_INSURANCE_RUBRIC.id, 
                      grading: GENERAL_LIFE_INSURANCE_RUBRIC.categories 
                    }
                    rubricId = GENERAL_LIFE_INSURANCE_RUBRIC.id
                    console.log('🎯 Using general rubric for playground session')
                  }
                  
                  if (rubricToUse?.grading && Array.isArray(rubricToUse.grading)) {
                    console.log('🎯 Grading session against rubric...')
                    
                    // Call backend to grade the transcript
                    const gradeResponse = await fetch('/api/analytics/grade-transcript', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId: result.data.id,
                        userId: profile.id,
                        assignmentId: assignmentId, // null for playground sessions
                        rubricId: rubricId,
                        rubricCriteria: rubricToUse.grading,
                        transcript: chunks.map(c => `${c.speaker}: ${c.text}`).join('\n')
                      })
                    })
                    
                    if (gradeResponse.ok) {
                      const gradeResult = await gradeResponse.json()
                      console.log('✅ Session graded:', gradeResult)
                      console.log(`📊 Score: ${Math.round(gradeResult.data.percentage)}%`)
                    } else {
                      console.error('Failed to grade session')
                    }
                  }
                }
              } else {
                const errorText = await saveResponse.text()
                console.error('❌ Failed to save session:', errorText)
              }
            } catch (error) {
              console.error('❌ Error saving session:', error)
            }
            } else {
            console.log('ℹ️  Not saving - this is playground practice (assignments only)')
          }
          
          // Try to fetch finalized transcript from backend using call id
          if (activeCallId) {
            try {
              const res = await fetch(`/api/assistants/call/${activeCallId}`)
              if (res.ok) {
                const data = await res.json()
                const call = data?.call || {}

                const merged: Array<{speaker: string, text: string, timestamp: Date}> = []

                const addSegment = (speaker: string, text: string, ts?: string | number | Date) => {
                  if (!text) return
                  const timestamp = ts ? new Date(ts) : new Date()
                  const last = merged[merged.length - 1]
                  if (last && last.speaker === speaker) {
                    last.text = mergeWithOverlap(last.text, text)
                    last.timestamp = timestamp
                  } else {
                    merged.push({ speaker, text, timestamp })
                  }
                }

                // Common shapes we might receive; handle defensively
                if (Array.isArray(call?.transcript)) {
                  for (const entry of call.transcript) {
                    const role = entry?.role || entry?.speaker || entry?.author
                    const text = entry?.text || entry?.transcript || entry?.content
                    const speaker = role === 'assistant' ? 'AI Customer' : 'You'
                    addSegment(speaker, String(text || ''))
                  }
                } else if (Array.isArray(call?.messages)) {
                  for (const msg of call.messages) {
                    const role = msg?.role || msg?.speaker || msg?.author
                    const content = msg?.content || msg?.text || msg?.transcript
                    if (typeof content === 'string') {
                      const speaker = role === 'assistant' ? 'AI Customer' : 'You'
                      addSegment(speaker, content)
                    } else if (Array.isArray(content)) {
                      // Some providers return content as array of blocks
                      const textBlocks = content.map((c: any) => c?.text || c?.content || '').filter(Boolean).join(' ')
                      const speaker = role === 'assistant' ? 'AI Customer' : 'You'
                      addSegment(speaker, textBlocks)
                    }
                  }
                } else if (typeof call?.transcript === 'string') {
                  // Single combined transcript string, attribute to unknown
                  addSegment('You', String(call.transcript))
                }

                if (merged.length > 0) {
                  setTranscript(merged)
                }
              } else {
                console.warn('Failed to fetch finalized call transcript', await res.text())
              }
            } catch (err) {
              console.warn('Error fetching finalized transcript:', err)
            }
          }
          setActiveCallId(null)
        })

        vapiRef.current.on('message', (message: any) => {
          if (message.type === 'transcript') {
            const speaker = message.role === 'assistant' ? 'AI Customer' : 'You'
            const timestamp = new Date()

            const chunk = {
              speaker,
              text: String(message.transcript || ''),
              timestamp,
              messageId: message.id || `msg_${Date.now()}_${Math.random()}`,
              confidence: message.confidence,
              duration: message.duration
            }

            // Store in ref (for call-end handler to access)
            transcriptChunksRef.current = [...transcriptChunksRef.current, chunk]

            // Store every chunk in fullTranscriptChunks for PDF export
            setFullTranscriptChunks(prevChunks => [...prevChunks, chunk])

            // Continue with existing display logic for merged transcript
            setTranscript(prevTranscript => {
              const lastEntry = prevTranscript[prevTranscript.length - 1]

              if (lastEntry && lastEntry.speaker === speaker) {
                const newText = String(message.transcript || '')
                const prevText = String(lastEntry.text || '')

                const mergedText = mergeWithOverlap(prevText, newText)

                if (mergedText === prevText) {
                  return prevTranscript
                }

                const updatedTranscript = [...prevTranscript]
                updatedTranscript[updatedTranscript.length - 1] = {
                  ...lastEntry,
                  text: mergedText,
                  timestamp: new Date()
                }
                return updatedTranscript
              }

              // Different speaker or first message
              return [
                ...prevTranscript,
                { speaker, text: message.transcript, timestamp: new Date() }
              ]
            })
          }
        })

        vapiRef.current.on('error', (error: any) => {
          console.error('VAPI error:', error)
          setIsCreatingCall(false)
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

  const exportTranscriptToPDF = async () => {
    if (fullTranscriptChunks.length === 0) {
      alert('No transcript data to export')
      return
    }

    setIsExportingPDF(true)
    
    try {
      const template = templates.find(t => t.id.toString() === selectedTemplate)
      const exportData = {
        callId: activeCallId,
        templateTitle: template?.title || 'Training Session',
        templateDescription: template?.description || '',
        startTime: fullTranscriptChunks[0]?.timestamp,
        endTime: fullTranscriptChunks[fullTranscriptChunks.length - 1]?.timestamp,
        duration: fullTranscriptChunks.length > 0 ? 
          Math.round((fullTranscriptChunks[fullTranscriptChunks.length - 1].timestamp.getTime() - fullTranscriptChunks[0].timestamp.getTime()) / 1000) : 0,
        chunks: fullTranscriptChunks,
        script: scriptText,
        // User and organization info for database storage
        userId: profile?.id,
        orgId: organization?.id,
        templateId: template?.id,
        // Add assignment and rubric data if this is an assignment
        ...(selectedAssignment && {
          assignmentId: selectedAssignment.id,
          assignmentTitle: selectedAssignment.title,
          rubricId: selectedAssignment.rubric,
          rubricTitle: rubrics.find(r => r.id === selectedAssignment.rubric)?.title || 'Unknown Rubric',
          rubricCriteria: rubrics.find(r => r.id === selectedAssignment.rubric)?.grading || []
        })
      }

      const response = await fetch('/api/export/transcript-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      })

      if (!response.ok) {
        throw new Error('Failed to export transcript')
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `training-session-${template?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'transcript'}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error exporting transcript:', error)
      alert('Failed to export transcript. Please try again.')
    } finally {
      setIsExportingPDF(false)
    }
  }

  // Modal drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Constrain position to prevent dragging outside screen boundaries
      const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - modalSize.width))
      const constrainedY = Math.max(88, Math.min(newY, window.innerHeight - modalSize.height)) // 88px header, prevent bottom overflow
      
      setModalPosition({
        x: constrainedX,
        y: constrainedY
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height
    })
  }

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      setModalSize({
        width: Math.max(400, resizeStart.width + deltaX),
        height: Math.max(300, resizeStart.height + deltaY)
      })
    }
  }

  // Add global mouse event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, resizeStart])

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

  // Fetch data based on user role
  useEffect(() => {
    // Don't fetch if we don't have the required data yet
    if (!organization?.id || !profile?.id) {
      console.log('Skipping fetch - missing organization or profile')
      return
    }

    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true)
        console.log('Fetching templates for organization:', organization?.id)
        console.log('User role isAdmin:', userRole.isAdmin)
        
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('org', organization?.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching templates:', error)
          return
        }

        console.log('Templates fetched:', data?.length || 0, 'templates found')
        setTemplates(data || [])
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    const fetchAssignments = async () => {
      try {
        setIsLoadingAssignments(true)
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching assignments:', error)
          return
        }

        // Filter assignments that include this user
        const myAssignments = (data || []).filter(assignment => {
          try {
            const assignedUsers = JSON.parse(assignment.assigned || '[]')
            return assignedUsers.includes(profile?.id)
          } catch (error) {
            console.warn('Error parsing assigned users:', error)
            return false
          }
        })

        setAssignments(myAssignments)
        
        // Also fetch templates and rubrics to use with assignments
        await fetchTemplates()
        await fetchRubrics()
      } catch (error) {
        console.error('Error fetching assignments:', error)
      } finally {
        setIsLoadingAssignments(false)
      }
    }

    const fetchRubrics = async () => {
      try {
        const { data, error } = await supabase
          .from('rubrics')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching rubrics:', error)
          return
        }

        setRubrics(data || [])
      } catch (error) {
        console.error('Error fetching rubrics:', error)
      }
    }

    console.log('CreateSession useEffect - Organization ID:', organization?.id)
    console.log('CreateSession useEffect - Profile ID:', profile?.id)
    console.log('CreateSession useEffect - User Role isAdmin:', userRole.isAdmin)
    
    if (userRole.isAdmin) {
      console.log('Admin detected - fetching templates')
      fetchTemplates()
    } else {
      console.log('Employee detected - fetching assignments')
      fetchAssignments()
    }
  }, [organization?.id, profile?.id, userRole.isAdmin])

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


  // Template script previews removed - using direct template script content

  const bg = useColorModeValue('gray.25', 'gray.925')
  const cardBg = useColorModeValue('white', 'gray.850')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const headerBg = useColorModeValue('gray.50/80', 'gray.800/80')
  const accentColor = useColorModeValue('blue.500', 'blue.400')
  
  // Pre-define all color mode values to avoid conditional hook calls
  const textPrimary = useColorModeValue('gray.900', 'white')
  const textSecondary = useColorModeValue('gray.500', 'gray.400')
  const textTertiary = useColorModeValue('gray.600', 'gray.400')
  const textMuted = useColorModeValue('gray.400', 'gray.500')
  const hoverBorder = useColorModeValue('gray.300', 'gray.600')
  const hoverBgSelected = useColorModeValue('blue.50/70', 'blue.900/30')
  const hoverBgUnselected = useColorModeValue('gray.50/50', 'gray.700')
  const assignmentDetailsBg = useColorModeValue('blue.50', 'blue.900/20')
  const assignmentDetailsBorder = useColorModeValue('blue.200', 'blue.700')
  const rubricItemBg = useColorModeValue('white', 'gray.800')
  const rubricItemBorder = useColorModeValue('gray.200', 'gray.600')
  const totalPointsBorder = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box bg={bg} minH="calc(100vh - 88px)" p={8}>
      <VStack spacing={6} align="stretch" maxW="1600px" mx="auto">
        {/* Header Section */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Heading 
              size="2xl" 
              color={textPrimary}
              fontWeight="700"
              letterSpacing="-0.03em"
            >
              {userRole.isAdmin ? 'Practice Playground' : 'My Assignments'}
            </Heading>
            <Text 
              fontSize="md" 
              color={textSecondary}
              fontWeight="400"
            >
              {isCallActive ? "🟢 Training session in progress" : userRole.isAdmin ? "Select a template and start practicing" : "Complete your assigned training sessions"}
            </Text>
          </VStack>

          {/* Call Control Button */}
          {selectedTemplate || selectedAssignment ? (
            <Button
              size="lg"
              colorScheme={isCallActive ? "red" : "blue"}
              onClick={isCallActive ? () => vapiRef.current?.stop() : createAssistantAndStartCall}
              isLoading={isCreatingCall}
              leftIcon={<Icon as={isCallActive ? MessageSquare : FileText} />}
              px={8}
              py={6}
              fontSize="md"
              fontWeight="600"
              borderRadius="xl"
              shadow="lg"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: '2xl'
              }}
              transition="all 0.3s"
            >
              {isCallActive ? 'End Practice' : 'Start Practice Call'}
            </Button>
          ) : null}
        </HStack>

        {/* Main Content Grid */}
        <Box 
          bg={cardBg} 
          borderRadius="2xl" 
          border="1px" 
          borderColor={borderColor}
          shadow="xl"
          overflow="hidden"
        >
          <Flex direction={{ base: 'column', xl: 'row' }} minH="70vh">
            {/* Templates/Assignments Section */}
            <Box 
              flex="1" 
              borderRight={{ xl: "1px" }} 
              borderBottom={{ base: "1px", xl: "none" }}
              borderColor={borderColor}
              p={8}
              overflowY="auto"
              maxH="70vh"
            >
                <VStack spacing={4} align="stretch">
                  <Box>
                    {userRole.isAdmin ? (
                      // Admin Template Selection with Tabs
                      <>
                        <Text 
                          fontSize="xs" 
                          color={textMuted} 
                          fontWeight="500"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                          mb={4}
                        >
                          Available Templates {!selectedTemplate && <Text as="span" color="red.400" ml={1}>•</Text>}
                        </Text>
                        
                        {/* Search Input */}
                        <InputGroup size="sm" mb={4}>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={Search} color={textMuted} boxSize={4} />
                          </InputLeftElement>
                          <Input
                            placeholder="Search templates..."
                            value={templateSearchQuery}
                            onChange={(e) => setTemplateSearchQuery(e.target.value)}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="xl"
                            _hover={{ borderColor: hoverBorder }}
                            _focus={{
                              borderColor: accentColor,
                              boxShadow: `0 0 0 1px ${accentColor}`
                            }}
                          />
                        </InputGroup>
                        
                        <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                          <TabList mb={4} gap={2}>
                            <Tab fontWeight="600" fontSize="xs">
                              Built-In ({filteredBuiltInTemplates.length}{templateSearchQuery && ` of ${ALL_BUILT_IN_TEMPLATES.length}`})
                            </Tab>
                            <Tab fontWeight="600" fontSize="xs">
                              Custom ({filteredCustomTemplates.length}{templateSearchQuery && ` of ${templates.length}`})
                            </Tab>
                          </TabList>

                          <TabPanels>
                            {/* Built-In Templates Tab */}
                            <TabPanel px={0} py={0}>
                              <VStack spacing={3} align="stretch">
                                {filteredBuiltInTemplates.length === 0 ? (
                                  <Text fontSize="sm" color={textMuted} textAlign="center" py={8}>
                                    No templates found matching "{templateSearchQuery}"
                                  </Text>
                                ) : (
                                  filteredBuiltInTemplates.map((template) => (
                                  <Card
                                    key={template.id}
                                    bg={cardBg}
                                    border="2px solid"
                                    borderColor={selectedTemplate === template.id.toString() ? accentColor : borderColor}
                                    borderRadius="2xl"
                                    cursor="pointer"
                                    onClick={() => setSelectedTemplate(selectedTemplate === template.id.toString() ? '' : template.id.toString())}
                                    _hover={{
                                      borderColor: selectedTemplate === template.id.toString() ? accentColor : hoverBorder,
                                      bg: selectedTemplate === template.id.toString() ? hoverBgSelected : hoverBgUnselected,
                                      transform: 'translateY(-1px)',
                                      shadow: selectedTemplate === template.id.toString() ? 'lg' : 'md'
                                    }}
                                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    position="relative"
                                    overflow="hidden"
                                    shadow={selectedTemplate === template.id.toString() ? 'md' : 'sm'}
                                  >
                                    
                                    <CardBody p={5}>
                                      <VStack align="start" spacing={3}>
                                        <HStack justify="space-between" w="full" align="start">
                                          <VStack align="start" spacing={1} flex="1">
                                            <Heading 
                                              size="md" 
                                              color={textPrimary}
                                              fontWeight="600"
                                              letterSpacing="-0.01em"
                                            >
                                              {template.title}
                                            </Heading>
                                            <Text fontSize="sm" color={textSecondary} lineHeight="1.4">
                                              {template.description}
                                            </Text>
                                          </VStack>
                                          <Badge 
                                            colorScheme={
                                              template.difficulty === 'easy' ? 'green' : 
                                              template.difficulty === 'medium' ? 'yellow' : 
                                              template.difficulty === 'hard' ? 'orange' : 'red'
                                            } 
                                            variant="subtle"
                                            textTransform="capitalize"
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="500"
                                          >
                                            {template.difficulty}
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                ))
                                )}
                              </VStack>
                            </TabPanel>

                            {/* Custom Templates Tab */}
                            <TabPanel px={0} py={0}>
                              <VStack spacing={3} align="stretch">
                                {isLoadingTemplates ? (
                                  <Box p={4} textAlign="center">
                                    <Text color={textSecondary}>
                                      Loading templates...
                                    </Text>
                                  </Box>
                                ) : templates.length === 0 ? (
                                  <Box p={4} textAlign="center">
                                    <Text color={textSecondary}>
                                      No custom templates found. Create some in Admin Tools!
                                    </Text>
                                  </Box>
                                ) : filteredCustomTemplates.length === 0 ? (
                                  <Text fontSize="sm" color={textMuted} textAlign="center" py={8}>
                                    No templates found matching "{templateSearchQuery}"
                                  </Text>
                                ) : (
                                  filteredCustomTemplates.map((template) => (
                            <Card
                              key={template.id}
                              bg={cardBg}
                              border="2px solid"
                              borderColor={selectedTemplate === template.id.toString() ? accentColor : borderColor}
                              borderRadius="2xl"
                              cursor="pointer"
                                onClick={() => setSelectedTemplate(selectedTemplate === template.id.toString() ? '' : template.id.toString())}
                              _hover={{
                                borderColor: selectedTemplate === template.id.toString() ? accentColor : hoverBorder,
                                bg: selectedTemplate === template.id.toString() ? hoverBgSelected : hoverBgUnselected,
                                transform: 'translateY(-1px)',
                                shadow: selectedTemplate === template.id.toString() ? 'lg' : 'md'
                              }}
                              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                              position="relative"
                              overflow="hidden"
                              shadow={selectedTemplate === template.id.toString() ? 'md' : 'sm'}
                            >
                              
                              <CardBody p={5}>
                                <VStack align="start" spacing={3}>
                                  <HStack justify="space-between" w="full" align="start">
                                    <VStack align="start" spacing={1} flex="1">
                                      <Heading 
                                        size="md" 
                                        color={textPrimary}
                                        fontWeight="600"
                                        letterSpacing="-0.01em"
                                      >
                                      {template.title}
                                  </Heading>
                                      <Text fontSize="sm" color={textSecondary} lineHeight="1.4">
                                        {template.description}
                                      </Text>
                                    </VStack>
                                    <Badge 
                                      colorScheme={
                                        template.difficulty === 'easy' ? 'green' : 
                                        template.difficulty === 'medium' ? 'yellow' : 
                                        template.difficulty === 'hard' ? 'orange' : 'red'
                                      } 
                                      variant="subtle"
                                      textTransform="capitalize"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontWeight="500"
                                    >
                                    {template.difficulty}
                                  </Badge>
                                </HStack>
                                  
                                  {'created_at' in template && (
                                    <HStack spacing={2} w="full">
                                      <Badge 
                                        size="sm" 
                                        colorScheme="gray" 
                                        variant="outline"
                                        borderRadius="full"
                                        fontSize="xs"
                                      >
                                        {new Date(template.created_at).toLocaleDateString()}
                                      </Badge>
                                    </HStack>
                                  )}
                              </VStack>
                              </CardBody>
                            </Card>
                                  ))
                                )}
                              </VStack>
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </>
                    ) : (
                      // Employee Assignment Selection
                      <>
                        <Text 
                          fontSize="xs" 
                          color={textMuted} 
                          fontWeight="500"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                          mb={4}
                        >
                          My Assignments {!selectedAssignment && <Text as="span" color="red.400" ml={1}>•</Text>}
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {isLoadingAssignments ? (
                            <Box p={4} textAlign="center">
                              <Text color={textSecondary}>
                                Loading assignments...
                              </Text>
                            </Box>
                          ) : assignments.length === 0 ? (
                            <Box p={4} textAlign="center">
                              <Text color={textSecondary}>
                                No assignments yet. Your trainer will assign practice sessions soon!
                              </Text>
                            </Box>
                          ) : (
                            assignments.map((assignment) => {
                              const assignmentTemplate = templates.find(t => t.id === assignment.template)
                              const isSelected = selectedAssignment?.id === assignment.id
                              
                              return (
                                <Card
                                  key={assignment.id}
                                  bg={cardBg}
                                  border="1px solid"
                                  borderColor={isSelected ? accentColor : borderColor}
                                  borderRadius="2xl"
                                  cursor="pointer"
                                  onClick={() => {
                                    setSelectedAssignment(assignment)
                                    if (assignmentTemplate) {
                                      setSelectedTemplate(assignmentTemplate.id.toString())
                                    }
                                  }}
                                  _hover={{
                                    borderColor: isSelected ? accentColor : hoverBorder,
                                    bg: isSelected ? hoverBgSelected : hoverBgUnselected,
                                    transform: 'translateY(-1px)',
                                    shadow: isSelected ? 'lg' : 'md'
                                  }}
                                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                  position="relative"
                                  overflow="hidden"
                                  shadow={isSelected ? 'md' : 'sm'}
                                >
                                  {/* Selected indicator */}
                                  {isSelected && (
                                    <Box
                                      position="absolute"
                                      top="0"
                                      right="0"
                                      w="0"
                                      h="0"
                                      borderStyle="solid"
                                      borderWidth="0 20px 20px 0"
                                      borderColor={`transparent ${accentColor} transparent transparent`}
                                    >
                                      <Box
                                        position="absolute"
                                        top="2px"
                                        right="-14px"
                                        color="white"
                                        fontSize="10px"
                                      >
                                        ✓
                                      </Box>
                                    </Box>
                                  )}
                                  
                                  <CardBody p={5}>
                                    <VStack align="start" spacing={3}>
                                      <HStack justify="space-between" w="full" align="start">
                                        <VStack align="start" spacing={1} flex="1">
                                          <Heading 
                                            size="md" 
                                            color={textPrimary}
                                            fontWeight="600"
                                            letterSpacing="-0.01em"
                                          >
                                            {assignment.title}
                                          </Heading>
                                          <Text fontSize="sm" color={textSecondary} lineHeight="1.4">
                                            {assignment.description}
                                          </Text>
                                        </VStack>
                                        {assignmentTemplate && (
                                          <Badge 
                                            colorScheme={
                                              assignmentTemplate.difficulty === 'easy' ? 'green' : 
                                              assignmentTemplate.difficulty === 'medium' ? 'yellow' : 
                                              assignmentTemplate.difficulty === 'hard' ? 'orange' : 'red'
                                            } 
                                            variant="subtle"
                                            textTransform="capitalize"
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="500"
                                          >
                                            {assignmentTemplate.difficulty}
                                          </Badge>
                                        )}
                                      </HStack>
                                      
                                      <HStack spacing={2} w="full">
                                        {assignmentTemplate && (
                                          <Badge 
                                            size="sm" 
                                            colorScheme="purple" 
                                            variant="outline" 
                                            textTransform="capitalize"
                                            borderRadius="full"
                                            fontSize="xs"
                                          >
                                            {assignmentTemplate.title}
                                          </Badge>
                                        )}
                                        {assignment.due && (
                                          <Badge 
                                            size="sm" 
                                            colorScheme="orange" 
                                            variant="outline"
                                            borderRadius="full"
                                            fontSize="xs"
                                          >
                                            Due: {new Date(assignment.due).toLocaleDateString()}
                                          </Badge>
                                        )}
                                      </HStack>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              )
                            })
                          )}
                        </VStack>
                      </>
                    )}
                  </Box>
                  
                  {/* Assignment Details for Employees */}
                  {!userRole.isAdmin && selectedAssignment && (
                    <Box>
                      <Text 
                        fontSize="xs" 
                        color={useColorModeValue('gray.400', 'gray.500')} 
                        fontWeight="500"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        mb={4}
                      >
                        Assignment Details
                      </Text>
                      <Card 
                        bg={assignmentDetailsBg}
                        border="1px solid"
                        borderColor={assignmentDetailsBorder}
                        borderRadius="xl"
                      >
                        <CardBody p={4}>
                          <VStack align="stretch" spacing={3}>
                            <Box>
                              <Text fontSize="xs" color={textSecondary} fontWeight="600" mb={1}>
                                ASSIGNMENT
                              </Text>
                              <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                                {selectedAssignment.title}
                              </Text>
                              {selectedAssignment.description && (
                                <Text fontSize="xs" color={textTertiary} mt={1}>
                                  {selectedAssignment.description}
                                </Text>
                              )}
                            </Box>
                            
                            {(() => {
                              const assignmentTemplate = templates.find(t => t.id === selectedAssignment.template)
                              return assignmentTemplate ? (
                                <Box>
                                  <Text fontSize="xs" color={textSecondary} fontWeight="600" mb={1}>
                                    TEMPLATE
                                  </Text>
                                  <Text fontSize="sm" fontWeight="500" color={textPrimary}>
                                    {assignmentTemplate.title}
                                  </Text>
                                  <Text fontSize="xs" color={textTertiary} mt={1}>
                                    {assignmentTemplate.description}
                                  </Text>
                                  <HStack spacing={2} mt={2}>
                                    <Badge 
                                      colorScheme={
                                        assignmentTemplate.difficulty === 'easy' ? 'green' : 
                                        assignmentTemplate.difficulty === 'medium' ? 'yellow' : 
                                        assignmentTemplate.difficulty === 'hard' ? 'orange' : 'red'
                                      } 
                                      variant="subtle"
                                      textTransform="capitalize"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontWeight="500"
                                    >
                                      {assignmentTemplate.difficulty}
                                    </Badge>
                                    <Badge 
                                      colorScheme="blue" 
                                      variant="outline" 
                                      textTransform="capitalize"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontWeight="500"
                                    >
                                      {assignmentTemplate.type}
                                    </Badge>
                                  </HStack>
                                </Box>
                              ) : null
                            })()}
                            
                            {(() => {
                              const assignmentRubric = rubrics.find(r => r.id === selectedAssignment.rubric)
                              return assignmentRubric ? (
                                <Box>
                                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="600" mb={2}>
                                    RUBRIC
                                  </Text>
                                  <Text fontSize="sm" fontWeight="500" color={useColorModeValue('gray.900', 'white')} mb={3}>
                                    {assignmentRubric.title}
                                  </Text>
                                  
                                  {/* Rubric Items */}
                                  <VStack spacing={3} align="stretch">
                                    {assignmentRubric.grading?.map((item: any, index: number) => (
                                      <Box 
                                        key={index}
                                        p={3}
                                        bg={rubricItemBg}
                                        border="1px solid"
                                        borderColor={rubricItemBorder}
                                        borderRadius="lg"
                                      >
                                        <HStack justify="space-between" align="start" mb={2}>
                                          <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                                            {item.title}
                                          </Text>
                                          <Badge 
                                            colorScheme="blue" 
                                            variant="solid"
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="600"
                                          >
                                            {item.maxPoints || 0} pts
                                          </Badge>
                                        </HStack>
                                        {item.description && (
                                          <Text fontSize="xs" color={textTertiary} lineHeight="1.4">
                                            {item.description}
                                          </Text>
                                        )}
                                      </Box>
                                    )) || (
                                      <Text fontSize="xs" color={textSecondary} fontStyle="italic">
                                        No rubric items defined
                                      </Text>
                                    )}
                                  </VStack>
                                  
                                  {/* Total Points */}
                                  <HStack justify="space-between" align="center" mt={3} pt={3} borderTop="1px solid" borderColor={totalPointsBorder}>
                                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                                      Total Points:
                                    </Text>
                                    <Badge 
                                      colorScheme="green" 
                                      variant="solid" 
                                      fontSize="sm"
                                      px={3}
                                      py={1}
                                      borderRadius="full"
                                      fontWeight="600"
                                    >
                                      {assignmentRubric.grading?.reduce((sum: number, item: any) => sum + (item.maxPoints || 0), 0) || 0} points
                                    </Badge>
                                  </HStack>
                                </Box>
                              ) : null
                            })()}
                            
                            {selectedAssignment.due && (
                              <Box>
                                <Text fontSize="xs" color={textSecondary} fontWeight="600" mb={1}>
                                  DUE DATE
                                </Text>
                                <Text fontSize="sm" fontWeight="500" color={useColorModeValue('gray.900', 'white')}>
                                  {new Date(selectedAssignment.due).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </Box>
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

          {/* Right Panel - Live Transcript */}
          <Panel defaultSize={50} minSize={30} maxSize={70}>
            <Box 
              bg={cardBg}
              h="full"
              display="flex"
              flexDirection="column"
              borderRadius="xl"
              borderTopLeftRadius="0"
              borderBottomLeftRadius="0"
            >
                <Flex 
                bg={headerBg}
                backdropFilter="blur(10px)"
                borderBottom="1px"
                borderColor={borderColor}
                px={6}
                py={5}
                justify="space-between"
                align="center"
              >
                <VStack align="start" spacing={1} flex={1}>
                  <Heading 
                    size="lg" 
                    color={textPrimary}
                    fontWeight="600"
                    letterSpacing="-0.02em"
                  >
                    Live Transcript
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={textSecondary}
                    fontWeight="400"
                  >
                    AI-powered conversation analysis
                  </Text>
                </VStack>
                
                <HStack spacing={3} flexShrink={0}>
            {/* Script Button */}
            {selectedTemplate && (
                    <Button
                      leftIcon={<Icon as={FileText} boxSize="4" />}
                      size="sm"
                      variant="ghost"
                      color={useColorModeValue('gray.600', 'gray.400')}
                      bg={isOpen ? useColorModeValue('blue.50', 'blue.900/30') : 'transparent'}
                _hover={{
                        bg: useColorModeValue('gray.100/70', 'gray.700/70'),
                        color: useColorModeValue('gray.800', 'gray.200')
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
                      borderRadius="xl"
                      fontWeight="500"
                      px={4}
                      transition="all 0.3s"
                    >
                      Script
                    </Button>
                  )}
                  
                  {/* Call Button */}
                  <Button
                    size="sm"
                    onClick={isCallActive ? endCall : createAssistantAndStartCall}
                    isLoading={isCreatingCall}
                    loadingText="Starting..."
                    isDisabled={
                      !vapiPublicKey || 
                      (userRole.isAdmin ? !selectedTemplate : !selectedAssignment)
                    }
                    bg={isCallActive 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    }
                    color="white"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: '2xl',
                      bg: isCallActive 
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
                        : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      _before: {
                        left: '100%'
                      }
                    }}
                    _active={{
                      transform: 'translateY(-1px)',
                      shadow: 'lg'
                    }}
                    borderRadius="xl"
                    fontWeight="600"
                    px={6}
                    shadow="lg"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s'
                    }}
                  >
                    {isCallActive ? "End Call" : "Start Training"}
                  </Button>
                  
                  {/* Export PDF Button */}
                  {!isCallActive && fullTranscriptChunks.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="green"
                      onClick={exportTranscriptToPDF}
                      isLoading={isExportingPDF}
                      loadingText="Exporting..."
                      flexShrink={0}
                      borderRadius="xl"
                      fontWeight="500"
                    >
                      Export PDF
                    </Button>
                  )}
                  
                  {/* Clear Button */}
                {transcript.length > 0 && (
                  <Button
                    size="xs"
                      variant="ghost"
                    colorScheme="red"
                    onClick={() => {
                      setTranscript([])
                      setFullTranscriptChunks([])
                    }}
                    flexShrink={0}
                      borderRadius="lg"
                      fontWeight="500"
                  >
                    Clear
                  </Button>
            )}
                </HStack>
          </Flex>
                
                <Box flex={1} overflowY="auto" p={6}>
                  {transcript.length === 0 ? (
                    <VStack spacing={4} justify="center" h="full" color={useColorModeValue('gray.400', 'gray.500')}>
                      <Flex
                        w="16"
                        h="16"
                        borderRadius="full"
                        bg={useColorModeValue('gray.100', 'gray.700')}
                        align="center"
                        justify="center"
                      >
                        <Icon as={MessageSquare} boxSize={7} color={useColorModeValue('gray.500', 'gray.400')} />
                      </Flex>
                      <VStack spacing={1} textAlign="center">
                        <Text fontSize="sm" fontWeight="500">
                          {isCallActive ? "Listening for conversation..." : "Ready to train"}
                </Text>  
                        <Text fontSize="xs">
                          {isCallActive ? "Your transcript will appear here" : "Start a training session to see the live transcript"}
                        </Text>
                      </VStack>
                    </VStack>
                        ) : (
                          <VStack align="stretch" spacing={4}>
                            {/* One block per speaker segment */}
                            {transcript.map((segment, index) => (
                              <Box key={index}>
                                <HStack spacing={3} mb={3} align="center">
                                  <Badge 
                                    colorScheme={segment.speaker === 'You' ? "blue" : "green"}
                                    variant="solid"
                                    fontSize="xs"
                                    px="3"
                                    py="1"
                                    borderRadius="full"
                                    fontWeight="600"
                                  >
                                    {segment.speaker}
                                  </Badge>
                                  <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')} fontWeight="500">
                                    {segment.timestamp.toLocaleTimeString()}
                                  </Text>
                                </HStack>
                                <Box 
                                  bg={segment.speaker === 'You' 
                                    ? useColorModeValue('blue.50/50', 'blue.900/20') 
                                    : useColorModeValue('green.50/50', 'green.900/20')
                                  }
                                  p={5}
                                  borderRadius="2xl"
                                  border="1px solid"
                                  borderColor={segment.speaker === 'You' 
                                    ? useColorModeValue('blue.100', 'blue.800/50') 
                                    : useColorModeValue('green.100', 'green.800/50')
                                  }
                                  position="relative"
                                >
                                  <Text 
                                    fontSize="sm" 
                                    color={useColorModeValue('gray.700', 'gray.200')}
                                    lineHeight="1.6"
                                    fontWeight="400"
                                  >
                                    {segment.text}
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

      {/* Script Modal */}
      {isOpen && (
        <Box
          ref={modalRef}
          position="fixed"
          left={`${modalPosition.x}px`}
          top={`${modalPosition.y}px`}
          w={`${modalSize.width}px`}
          h={`${modalSize.height}px`}
          bg={useColorModeValue('white', 'gray.850')}
          borderRadius="3xl"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          border="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
          zIndex="100"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          cursor={isDragging ? 'grabbing' : 'default'}
          backdropFilter="blur(20px)"
        >
          <Box 
            borderBottom="1px solid" 
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            bg={headerBg}
            backdropFilter="blur(20px)"
            borderTopRadius="3xl"
            p={6}
            position="relative"
            cursor="grab"
            onMouseDown={handleMouseDown}
            _active={{ cursor: 'grabbing' }}
            userSelect="none"
          >
            <HStack spacing={5} flex="1">
              <Box 
                p={4} 
                bg={useColorModeValue('blue.50/70', 'blue.900/30')} 
                borderRadius="2xl"
                border="1px solid"
                borderColor={useColorModeValue('blue.100', 'blue.800/50')}
              >
                <Icon as={FileText} color={accentColor} boxSize={7} />
              </Box>
              <VStack align="start" spacing={2} flex="1">
                <Text fontSize="xl" fontWeight="700" color={useColorModeValue('gray.900', 'white')} letterSpacing="-0.02em">
                  Script Preview
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                  {templates.find(t => t.id.toString() === selectedTemplate)?.title || 'Training Script'}
                </Text>
              </VStack>
              <IconButton
                aria-label="Close script"
                icon={<Text fontSize="xl" lineHeight="1">×</Text>}
                size="md"
                variant="ghost"
                color={useColorModeValue('gray.500', 'gray.400')}
                _hover={{ 
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  color: useColorModeValue('gray.700', 'gray.200'),
                  transform: 'scale(1.1)'
                }}
                borderRadius="xl"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                transition="all 0.2s"
              />
            </HStack>
          </Box>
          <Box p={6} overflowY="auto" flex="1">
            <Box
              bg={cardBg}
              p={8}
              borderRadius="3xl"
              border="1px solid"
              borderColor={borderColor}
              h="calc(100% - 24px)"
              overflowY="auto"
              position="relative"
              shadow="inner"
              sx={{
                // Hide scrollbar while preserving scroll functionality
                scrollbarWidth: 'none',        // Firefox
                msOverflowStyle: 'none',       // IE/Edge
                '&::-webkit-scrollbar': {      // Chrome/Safari
                  display: 'none',
                  width: '0px',
                  height: '0px',
                },
              }}
            >
              {selectedTemplate && scriptText ? (
                <Box 
                  sx={{
                    '& h1': {
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      color: useColorModeValue('gray.800', 'white'),
                      mb: 4,
                      borderBottom: '2px solid',
                      borderColor: useColorModeValue('gray.200', 'gray.600'),
                      pb: 2
                    },
                    '& h2': {
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: useColorModeValue('blue.600', 'blue.300'),
                      mt: 6,
                      mb: 3
                    },
                    '& h3': {
                      fontSize: 'md',
                      fontWeight: 'semibold',
                      color: useColorModeValue('gray.700', 'gray.300'),
                      mt: 4,
                      mb: 2
                    },
                    '& p': {
                      mb: 3,
                      lineHeight: '1.6'
                    },
                    '& strong': {
                      fontWeight: 'bold',
                      color: useColorModeValue('gray.800', 'white')
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
                <Text color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" py={8}>
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
              bg: useColorModeValue('gray.200', 'gray.600')
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
                background: `linear-gradient(-45deg, transparent 30%, ${useColorModeValue('#666', '#ccc')} 30%, ${useColorModeValue('#666', '#ccc')} 35%, transparent 35%, transparent 65%, ${useColorModeValue('#666', '#ccc')} 65%, ${useColorModeValue('#666', '#ccc')} 70%, transparent 70%)`,
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

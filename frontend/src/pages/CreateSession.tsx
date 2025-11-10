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
  useToast,
  Spinner,
} from '@chakra-ui/react'
import React, { useState, useRef, useEffect } from 'react'
import { FileText, MessageSquare, Search, RefreshCw, Award } from 'lucide-react'
import Vapi from '@vapi-ai/web'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ReactMarkdown from 'react-markdown'
import { supabase, Template } from '../config/supabase'
import { useProfile } from '../contexts/ProfileContext'
import { ALL_BUILT_IN_TEMPLATES } from '../config/templateLibrary'
import { GENERAL_LIFE_INSURANCE_RUBRIC } from '../config/rubricLibrary'
import apiFetch from '../utils/api'

interface Assignment {
  id: number
  title: string
  description: string
  template: number // template ID
  rubric: number // rubric ID
  assigned: string // JSON string of user IDs
  due: string
  created_at: string
  status: 'not started' | 'in progress' | 'complete'
}

// Helper function to find built-in template by matching title (case-insensitive, trimmed)
const findBuiltInTemplateByTitle = (title: string) => {
  if (!title) return null
  
  const normalizedTitle = title.trim().toLowerCase()
  
  // Try exact match first (after normalization)
  let match = ALL_BUILT_IN_TEMPLATES.find(t => 
    t.title.trim().toLowerCase() === normalizedTitle
  )
  
  if (match) return match
  
  // Try fuzzy match - check if titles are very similar (handles minor typos or differences)
  match = ALL_BUILT_IN_TEMPLATES.find(t => {
    const builtInTitle = t.title.trim().toLowerCase()
    // Remove special characters and extra spaces for comparison
    const cleanBuiltIn = builtInTitle.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
    const cleanInput = normalizedTitle.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
    return cleanBuiltIn === cleanInput
  })
  
  return match || null
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
  const [assignmentTab, setAssignmentTab] = useState<'current' | 'completed'>('current')
  const [leftSideTab, setLeftSideTab] = useState<'playground' | 'assignments'>('playground')
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
  const toast = useToast()
  const vapiRef = useRef<any>(null)
  
  // Assignment sessions state
  const [assignmentSessions, setAssignmentSessions] = useState<Array<{
    id: number
    start_time: string
    end_time: string
    duration_seconds: number
    grade?: { percentage: number, score: number }
    submitted_for_review: boolean
  }>>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [submittingSessionId, setSubmittingSessionId] = useState<number | null>(null)
  const [gradingAssignmentId, setGradingAssignmentId] = useState<number | null>(null)
  const [isGradingSession, setIsGradingSession] = useState(false) // General grading indicator for all sessions
  const [playgroundSessionGrade, setPlaygroundSessionGrade] = useState<{ percentage: number, totalScore: number, maxScore: number, sessionId?: number, criteriaGrades?: any[] } | null>(null)
  const [showPlaygroundGradeDetails, setShowPlaygroundGradeDetails] = useState(false)
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
  // Filter out templates with org = null (those are built-in only, not custom)
  const orgSpecificTemplates = templates.filter(t => t.org !== null)
  const filteredCustomTemplates = filterTemplates(orgSpecificTemplates)

  // Fetch assignments function (needs to be accessible from multiple places)
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
      
      // Debug: Log the first assignment to check status
      if (myAssignments.length > 0) {
        console.log('📋 First assignment:', myAssignments[0])
        console.log('📋 Status value:', myAssignments[0].status)
        console.log('📋 Status type:', typeof myAssignments[0].status)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  // Load script when selection changes (for admins with templates OR employees with assignments)
  useEffect(() => {
    console.log('🔄 useEffect triggered - selectedTemplate:', selectedTemplate, 'selectedAssignment:', selectedAssignment?.title)
    
    // CHECK ASSIGNMENTS FIRST - they take priority when both are set
    if (selectedAssignment) {
      const assignmentTemplate = templates.find(t => t.id === selectedAssignment.template)
      
      if (assignmentTemplate) {
        console.log('📋 Assignment template from DB:', assignmentTemplate.title)
        
        // ALWAYS check frontend code first for built-in templates using robust matching
        const builtInMatch = findBuiltInTemplateByTitle(assignmentTemplate.title)
        
        if (builtInMatch) {
          // Use the full script from frontend code (hard-coded templates)
          console.log('✅ Found matching built-in template:', builtInMatch.title)
          console.log('✅ Using hard-coded script, length:', builtInMatch.script.length, 'chars')
          setScriptText(builtInMatch.script || '')
          return
        }
        
        // Not a built-in template - use custom template script from DB
        console.log('⚠️ No built-in match found - using custom template script from DB')
        console.log('⚠️ DB script length:', assignmentTemplate.script?.length || 0, 'chars')
        setScriptText(assignmentTemplate.script || '')
        return
      }
    }
    
    // If a template is selected (playground), use that
    if (selectedTemplate) {
      // Check if it's a built-in template first
      const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
      if (builtInTemplate) {
        console.log('✅ Using built-in template script for playground:', builtInTemplate.title)
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
      console.log('✅ Using custom template script for playground:', customTemplate.title)
      setScriptText(customTemplate.script || '')
      return
    }
    
    // Nothing selected - clear script
    setScriptText('')
  }, [selectedTemplate, selectedAssignment, templates, userRole.isAdmin])

  // Fetch assignment sessions
  const fetchAssignmentSessions = async (assignmentId: number, userId: string) => {
    try {
      setIsLoadingSessions(true)
      const response = await apiFetch(`/api/assignments/${assignmentId}/sessions/${userId}`)
      
      if (response.ok) {
        const result = await response.json()
        setAssignmentSessions(result.data || [])
      } else {
        console.error('Failed to fetch assignment sessions')
      }
    } catch (error) {
      console.error('Error fetching assignment sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // Submit session for admin review and mark assignment as complete
  const submitSessionForReview = async (sessionId: number) => {
    try {
      setSubmittingSessionId(sessionId)
      
      const response = await apiFetch(`/api/analytics/session/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        toast({
          title: 'Session submitted!',
          description: 'Your trainer will review this session.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Mark assignment as complete if not already
        if (selectedAssignment && selectedAssignment.status !== 'complete') {
          await updateAssignmentStatus(selectedAssignment.id, 'complete')
          
          // Switch to completed tab to show it there
          setAssignmentTab('completed')
        }
        
        // Refresh sessions list
        if (selectedAssignment && profile?.id) {
          fetchAssignmentSessions(selectedAssignment.id, profile.id)
        }
      } else {
        toast({
          title: 'Submission failed',
          description: 'Could not submit session. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error submitting session:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while submitting.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSubmittingSessionId(null)
    }
  }


  // Update assignment status to in_progress
  const updateAssignmentStatus = async (assignmentId: number, status: 'not started' | 'in progress' | 'complete') => {
    try {
      console.log(`📝 Updating assignment ${assignmentId} status to: ${status}`)
      
      const response = await apiFetch(`/api/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Assignment status updated to: ${status}`, result)
        
        // Update local state immediately
        if (selectedAssignment && selectedAssignment.id === assignmentId) {
          setSelectedAssignment({
            ...selectedAssignment,
            status
          })
        }
        
        // Update in assignments list
        setAssignments(prevAssignments => 
          prevAssignments.map(a => 
            a.id === assignmentId ? { ...a, status } : a
          )
        )
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to update assignment status:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Error updating assignment status:', error)
    }
  }

  const createAssistantAndStartCall = async () => {
    if (!vapiPublicKey) {
      toast({
        title: 'Configuration error',
        description: 'VAPI not loaded. Please refresh and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsCreatingCall(true)
    
    // Clear existing transcript and playground grade before starting new call
    setTranscript([])
    setFullTranscriptChunks([])
    transcriptChunksRef.current = []
    setPlaygroundSessionGrade(null)
    setShowPlaygroundGradeDetails(false)
    
    try {
      // If this is an assignment and it's not started or undefined, update to in progress
      if (selectedAssignment && (selectedAssignment.status === 'not started' || !selectedAssignment.status)) {
        console.log('📊 First training session - updating status to in progress')
        await updateAssignmentStatus(selectedAssignment.id, 'in progress')
      }
      let template = null
      let scriptContent = ''
      
      // For employees: load template from assignment
      if (!userRole.isAdmin && selectedAssignment) {
        const assignmentTemplate = templates.find(t => t.id === selectedAssignment.template)
        console.log('🚀 STARTING CALL - Employee assignment')
        console.log('🚀 Assignment template from DB:', assignmentTemplate?.title)
        
        if (assignmentTemplate) {
          // Try to find matching built-in template by title using robust matching
          const builtInMatch = findBuiltInTemplateByTitle(assignmentTemplate.title)
          console.log('🚀 Looking for built-in match...')
          console.log('🚀 Built-in match found?', !!builtInMatch)
          
          if (builtInMatch) {
            // Use built-in template's full script from hard-coded templates
            template = builtInMatch
            scriptContent = builtInMatch.script || ''
            console.log('✅✅✅ SUCCESS! Using hard-coded built-in script for VAPI:', builtInMatch.title)
            console.log('📝 Script being sent to VAPI:', scriptContent.length, 'characters')
          } else {
            // Use custom template from database
            template = assignmentTemplate
            scriptContent = assignmentTemplate.script || ''
            console.log('⚠️ No built-in match - using custom template script from DB:', assignmentTemplate.title)
            console.log('📝 Script being sent to VAPI:', scriptContent.length, 'characters')
          }
        } else {
          console.log('❌❌❌ ERROR: Assignment template not found in database!')
        }
      } else {
        // For admins: use selected template from playground
        const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
        const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
        template = builtInTemplate || customTemplate
        scriptContent = scriptText || template?.script || ''
      }
      
      // Update VAPI assistant with new persona/settings
      const response = await apiFetch('/api/assistants', {
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
              
              // Get the correct template - for assignments, always use DB template ID
              let templateIdForDb = null
              let templateTitle = null
              
              if (selectedAssignment) {
                // For assignments, use the DB template ID (numeric)
                templateIdForDb = selectedAssignment.template
                const assignmentTemplate = templates.find(t => t.id === selectedAssignment.template)
                templateTitle = assignmentTemplate?.title || 'Assignment'
                console.log('Assignment - using DB template ID:', templateIdForDb)
              } else {
                // For playground, check if it's custom or built-in
                const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
                if (customTemplate) {
                  templateIdForDb = customTemplate.id
                  templateTitle = customTemplate.title
                  console.log('Playground - using custom template ID:', templateIdForDb)
                } else {
                  // Built-in template - store the string ID and get title from built-in templates
                  const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
                  if (builtInTemplate) {
                    templateIdForDb = selectedTemplate // Store the string ID (e.g., "objection-handling-pro")
                    templateTitle = builtInTemplate.title
                    console.log('Playground - built-in template:', templateIdForDb, templateTitle)
                  }
                }
              }
              
              const sessionData = {
                userId: profile.id,
                orgId: organization.id,
                sessionType: selectedAssignment ? 'assignment' : 'template',
                templateId: templateIdForDb,
                assignmentId: selectedAssignment?.id,
                callId: activeCallId,
                vapiCallId: activeCallId,
                startTime: chunks[0]?.timestamp?.toISOString(),
                endTime: chunks[chunks.length - 1]?.timestamp?.toISOString(),
                durationSeconds: chunks.length > 0 
                  ? Math.round((chunks[chunks.length - 1].timestamp.getTime() - chunks[0].timestamp.getTime()) / 1000)
                  : 0,
                transcript: chunks,
                transcriptClean: chunks.map(c => `${c.speaker}: ${c.text}`).join('\n')
              }

              console.log('📤 Sending session data to backend:', sessionData)
              
              const saveResponse = await apiFetch('/api/analytics/session', {
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
                  let assignmentId = null
                  
                  // Always use the general life insurance rubric
                  rubricToUse = { 
                    id: GENERAL_LIFE_INSURANCE_RUBRIC.id, 
                    grading: GENERAL_LIFE_INSURANCE_RUBRIC.categories 
                  }
                  
                  if (selectedAssignment) {
                    assignmentId = selectedAssignment.id
                    console.log('🎯 Using general rubric for assignment:', assignmentId)
                  } else {
                    console.log('🎯 Using general rubric for playground session')
                  }
                  
                  if (rubricToUse?.grading && Array.isArray(rubricToUse.grading)) {
                    console.log('🎯 Grading session against rubric...')
                    
                    // Set grading indicators
                    setIsGradingSession(true)
                    if (assignmentId) {
                      setGradingAssignmentId(assignmentId)
                    }
                    
                    try {
                    // Call backend to grade the transcript
                    const gradeResponse = await apiFetch('/api/analytics/grade-transcript', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId: result.data.id,
                        userId: profile.id,
                        assignmentId: assignmentId, // null for playground sessions
                          rubricId: null, // Don't send built-in rubric ID to database
                        rubricCriteria: rubricToUse.grading,
                        transcript: chunks.map(c => `${c.speaker}: ${c.text}`).join('\n')
                      })
                    })
                    
                    if (gradeResponse.ok) {
                      const gradeResult = await gradeResponse.json()
                      console.log('✅ Session graded:', gradeResult)
                      console.log(`📊 Score: ${Math.round(gradeResult.data.percentage)}%`)
                      
                      toast({
                        title: 'Session Graded!',
                        description: `Your score: ${Math.round(gradeResult.data.percentage)}%`,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                      })
                      
                      // If this is a playground session (no assignment), store the grade in state
                      if (!assignmentId && gradeResult.data) {
                        setPlaygroundSessionGrade({
                          percentage: gradeResult.data.percentage || 0,
                          totalScore: gradeResult.data.total_score || 0,
                          maxScore: gradeResult.data.max_possible_score || 100,
                          sessionId: gradeResult.data.session_id,
                          criteriaGrades: gradeResult.data.criteria_grades || []
                        })
                        setShowPlaygroundGradeDetails(false) // Reset details view
                      }
                    } else {
                      console.error('Failed to grade session')
                      toast({
                        title: 'Grading Failed',
                        description: 'Could not grade your session. Please try again.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      })
                      }
                    } finally {
                      // Clear grading indicators
                      setIsGradingSession(false)
                      setGradingAssignmentId(null)
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
              const res = await apiFetch(`/api/assistants/call/${activeCallId}`)
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
      toast({
        title: 'Call failed',
        description: 'Could not start training call. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
      toast({
        title: 'No transcript',
        description: 'Complete a training session first to export.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsExportingPDF(true)
    
    try {
      // Get the correct template - for assignments, prefer built-in if available
      let template = null
      
      if (selectedAssignment) {
        // For assignments, find the template from DB and check if it's a built-in
        const assignmentTemplate = templates.find(t => t.id === selectedAssignment.template)
        if (assignmentTemplate) {
          const builtInMatch = findBuiltInTemplateByTitle(assignmentTemplate.title)
          template = builtInMatch || assignmentTemplate
        }
      } else {
        // For playground, use selected template
        const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
        const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
        template = builtInTemplate || customTemplate
      }
      
      const exportData = {
        callId: activeCallId,
        templateTitle: template?.title || 'Training Session',
        templateDescription: template?.description || '',
        startTime: fullTranscriptChunks[0]?.timestamp,
        endTime: fullTranscriptChunks[fullTranscriptChunks.length - 1]?.timestamp,
        duration: fullTranscriptChunks.length > 0 ? 
          Math.round((fullTranscriptChunks[fullTranscriptChunks.length - 1].timestamp.getTime() - fullTranscriptChunks[0].timestamp.getTime()) / 1000) : 0,
        chunks: fullTranscriptChunks,
        script: scriptText, // scriptText is already set to the correct script by useEffect
        // User and organization info for database storage
        userId: profile?.id,
        orgId: organization?.id,
        templateId: template?.id,
        // Add assignment and rubric data if this is an assignment
        ...(selectedAssignment && {
          assignmentId: selectedAssignment.id,
          assignmentTitle: selectedAssignment.title,
          rubricId: GENERAL_LIFE_INSURANCE_RUBRIC.id,
          rubricTitle: GENERAL_LIFE_INSURANCE_RUBRIC.title,
          rubricCriteria: GENERAL_LIFE_INSURANCE_RUBRIC.categories
        })
      }

      const response = await apiFetch('/api/export/transcript-pdf', {
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
      toast({
        title: 'Export failed',
        description: 'Could not export transcript. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
        const response = await apiFetch('/api/config')
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
        
        // Fetch both NULL org templates (for lookups) and org-specific templates
        // BUT we'll filter NULL org templates out of the Custom tab display
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .or(`org.is.null,org.eq.${organization?.id}`)
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

    console.log('CreateSession useEffect - Organization ID:', organization?.id)
    console.log('CreateSession useEffect - Profile ID:', profile?.id)
    console.log('CreateSession useEffect - User Role isAdmin:', userRole.isAdmin)
    
    if (userRole.isAdmin) {
      console.log('Admin detected - fetching templates')
      fetchTemplates()
    } else {
      console.log('Employee detected - fetching assignments')
      // Also fetch templates to use with assignments
      fetchTemplates()
      fetchAssignments()
    }
  }, [organization?.id, profile?.id, userRole.isAdmin])

  // Fetch assignment sessions when an assignment is selected
  useEffect(() => {
    if (selectedAssignment && profile?.id) {
      fetchAssignmentSessions(selectedAssignment.id, profile.id)
    } else {
      setAssignmentSessions([])
    }
  }, [selectedAssignment, profile?.id])

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

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')
  const accentColor = useColorModeValue('#f26f25', '#ff7d31')
  
  // Pre-define all color mode values to avoid conditional hook calls
  const textPrimary = useColorModeValue('gray.900', 'white')
  const textSecondary = useColorModeValue('gray.500', 'gray.400')
  const textMuted = useColorModeValue('gray.400', 'gray.500')
  const hoverBorder = useColorModeValue('gray.300', 'gray.600')
  const hoverBgSelected = useColorModeValue('orange.50/70', 'orange.900/30')
  const hoverBgUnselected = useColorModeValue('gray.50/50', 'gray.700')

  return (
    <Box 
      bgGradient={useColorModeValue('linear(to-br, orange.50, white, orange.50)', 'linear(to-br, gray.900, gray.800)')}
      h="calc(100vh - 88px)" 
      overflow="hidden"
      position="relative"
    >
      {/* Grading Indicator Overlay */}
      {isGradingSession && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          backdropFilter="blur(4px)"
          zIndex="9999"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            spacing={4}
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor={useColorModeValue('gray.200', 'gray.600')}
              color="orange.500"
              size="xl"
            />
            <VStack spacing={1}>
              <Heading size="md" color={useColorModeValue('gray.800', 'white')}>
                Grading Your Performance
              </Heading>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Please wait while we analyze your session...
              </Text>
            </VStack>
          </VStack>
        </Box>
      )}
      
      <PanelGroup direction="horizontal">
          {/* Left Panel - Template/Assignment Selection with Call Controls */}
        <Panel 
            defaultSize={50} 
            minSize={30}
            maxSize={70}
          >
             <Box bg={cardBg} h="full" overflow="hidden" display="flex" flexDirection="column">
              {/* Header */}
              <Box 
                px={6}
                py={4}
                borderBottom="1px"
                borderColor={borderColor}
              >
                <VStack align="start" spacing={1}>
                  <Heading 
                    size="md" 
                    color={textPrimary}
                    fontWeight="600"
                  >
                    Train
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={textSecondary}
                  >
                    {isCallActive ? "Session active" : "Choose a template to practice"}
                  </Text>
                </VStack>
              </Box>

              {/* Tabs for Employees - Playground vs Assignments */}
              {!userRole.isAdmin && (
                <HStack spacing={2} px={6} py={3}>
                  <Button
                    size="sm"
                    onClick={() => setLeftSideTab('playground')}
                    colorScheme="orange"
                    variant={leftSideTab === 'playground' ? 'solid' : 'ghost'}
                    borderRadius="lg"
                    fontWeight="600"
                    flex={1}
                    bg={leftSideTab === 'playground' ? '#f26f25' : 'transparent'}
                    _hover={{
                      transform: leftSideTab === 'playground' ? 'none' : 'translateY(-1px)',
                      bg: leftSideTab === 'playground' ? '#d95e1e' : undefined
                    }}
                  >
                    Playground
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setLeftSideTab('assignments')}
                    colorScheme="orange"
                    variant={leftSideTab === 'assignments' ? 'solid' : 'ghost'}
                    borderRadius="lg"
                    fontWeight="600"
                    flex={1}
                    bg={leftSideTab === 'assignments' ? '#f26f25' : 'transparent'}
                    _hover={{
                      transform: leftSideTab === 'assignments' ? 'none' : 'translateY(-1px)',
                      bg: leftSideTab === 'assignments' ? '#d95e1e' : undefined
                    }}
                  >
                    Assignments
                  </Button>
                </HStack>
              )}
            
              {/* Content - Playground or Assignments based on tab */}
              <Box flex={1} overflowY="auto" p={6}>
                <VStack spacing={4} align="stretch">
                  {/* Show Playground for admins OR employees on playground tab */}
                  {(userRole.isAdmin || leftSideTab === 'playground') && (
                    <Box>
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
                        
                        <Tabs variant="soft-rounded" colorScheme="orange" size="sm">
                          <TabList mb={4} gap={2}>
                            <Tab fontWeight="600" fontSize="xs">
                              Built-In ({filteredBuiltInTemplates.length}{templateSearchQuery && ` of ${ALL_BUILT_IN_TEMPLATES.length}`})
                            </Tab>
                            <Tab fontWeight="600" fontSize="xs">
                              Custom ({filteredCustomTemplates.length}{templateSearchQuery && ` of ${orgSpecificTemplates.length}`})
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
                                    bg={selectedTemplate === template.id.toString() ? 
                                      useColorModeValue('linear-gradient(135deg, rgba(242, 111, 37, 0.1), rgba(217, 94, 30, 0.1))', 'rgba(242, 111, 37, 0.15)') : 
                                      cardBg
                                    }
                                    border="2px solid"
                                    borderColor={selectedTemplate === template.id.toString() ? accentColor : borderColor}
                                    borderRadius="2xl"
                                    cursor="pointer"
                                    onClick={() => {
                                      setSelectedTemplate(selectedTemplate === template.id.toString() ? '' : template.id.toString())
                                      setSelectedAssignment(null) // Clear assignment when selecting a template
                                    }}
                                    backdropFilter="blur(10px)"
                                    _hover={{
                                      borderColor: selectedTemplate === template.id.toString() ? accentColor : useColorModeValue('orange.300', 'orange.600'),
                                      transform: 'translateY(-2px) scale(1.01)',
                                      shadow: 'xl',
                                      bg: selectedTemplate === template.id.toString() ? 
                                        useColorModeValue('linear-gradient(135deg, rgba(242, 111, 37, 0.15), rgba(217, 94, 30, 0.15))', 'rgba(242, 111, 37, 0.2)') : 
                                        useColorModeValue('white', 'gray.750')
                                    }}
                                    transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                                    position="relative"
                                    overflow="hidden"
                                    shadow={selectedTemplate === template.id.toString() ? 'lg' : 'md'}
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
                                            bgGradient={
                                              template.difficulty === 'easy' ? 'linear(to-r, green.400, teal.400)' : 
                                              template.difficulty === 'medium' ? 'linear(to-r, yellow.400, orange.400)' : 
                                              template.difficulty === 'hard' ? 'linear(to-r, orange.400, red.400)' : 
                                              'linear(to-r, red.500, pink.500)'
                                            }
                                            color="white"
                                            textTransform="capitalize"
                                            fontSize="xs"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="600"
                                            shadow="sm"
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
                                ) : orgSpecificTemplates.length === 0 ? (
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
                              bg={selectedTemplate === template.id.toString() ? 
                                useColorModeValue('linear-gradient(135deg, rgba(242, 111, 37, 0.1), rgba(217, 94, 30, 0.1))', 'rgba(242, 111, 37, 0.15)') : 
                                cardBg
                              }
                              border="2px solid"
                              borderColor={selectedTemplate === template.id.toString() ? accentColor : borderColor}
                              borderRadius="2xl"
                              cursor="pointer"
                              onClick={() => {
                                setSelectedTemplate(selectedTemplate === template.id.toString() ? '' : template.id.toString())
                                setSelectedAssignment(null) // Clear assignment when selecting a template
                              }}
                              backdropFilter="blur(10px)"
                              _hover={{
                                borderColor: selectedTemplate === template.id.toString() ? accentColor : useColorModeValue('orange.300', 'orange.600'),
                                transform: 'translateY(-2px) scale(1.01)',
                                shadow: 'xl',
                                bg: selectedTemplate === template.id.toString() ? 
                                  useColorModeValue('linear-gradient(135deg, rgba(242, 111, 37, 0.15), rgba(217, 94, 30, 0.15))', 'rgba(242, 111, 37, 0.2)') : 
                                  useColorModeValue('white', 'gray.750')
                              }}
                              transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                              position="relative"
                              overflow="hidden"
                              shadow={selectedTemplate === template.id.toString() ? 'lg' : 'md'}
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
                                      bgGradient={
                                        template.difficulty === 'easy' ? 'linear(to-r, green.400, teal.400)' : 
                                        template.difficulty === 'medium' ? 'linear(to-r, yellow.400, orange.400)' : 
                                        template.difficulty === 'hard' ? 'linear(to-r, orange.400, red.400)' : 
                                        'linear(to-r, red.500, pink.500)'
                                      }
                                      color="white"
                                      textTransform="capitalize"
                                      fontSize="xs"
                                      px={3}
                                      py={1}
                                      borderRadius="full"
                                      fontWeight="600"
                                      shadow="sm"
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
                    </Box>
                  )}

                  {/* Assignments Section - Only show when on assignments tab */}
                  {!userRole.isAdmin && leftSideTab === 'assignments' && (
                    <Box display="flex" flexDirection="column" h="full">
                      <Box flex="1" overflowY="auto" pb="80px">
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
                            assignments
                              .filter((assignment) => {
                                if (assignmentTab === 'current') {
                                  return assignment.status !== 'complete'
                                } else {
                                  return assignment.status === 'complete'
                                }
                              })
                              .map((assignment) => {
                              const assignmentTemplate = templates.find(t => t.id === assignment.template)
                              const isSelected = selectedAssignment?.id === assignment.id
                              const isOverdue = assignment.due && new Date(assignment.due) < new Date()
                              const isGrading = gradingAssignmentId === assignment.id
                              
                              return (
                                <Card
                                  key={assignment.id}
                                  bg={cardBg}
                                  border="2px solid"
                                  borderColor={isOverdue ? 'red.400' : (isSelected ? accentColor : borderColor)}
                                  borderRadius="2xl"
                                  cursor="pointer"
                                  onClick={() => {
                                    // Toggle selection like playground
                                    if (selectedAssignment?.id === assignment.id) {
                                      setSelectedAssignment(null)
                                      setSelectedTemplate('')
                                    } else {
                                      setSelectedAssignment(assignment)
                                      if (assignmentTemplate) {
                                        setSelectedTemplate(assignmentTemplate.id.toString())
                                      }
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
                                  <CardBody p={4}>
                                    <VStack align="start" spacing={2}>
                                      <HStack justify="space-between" w="full">
                                          <Heading 
                                          size="sm" 
                                            color={textPrimary}
                                            fontWeight="600"
                                          >
                                            {assignment.title}
                                          </Heading>
                                          <HStack spacing={2}>
                                            {isGrading && (
                                              <Badge 
                                                size="sm" 
                                                colorScheme="orange"
                                                variant="solid"
                                                fontSize="xs"
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <Box
                                                  as="span"
                                                  display="inline-block"
                                                  w="8px"
                                                  h="8px"
                                                  borderRadius="full"
                                                  border="2px solid"
                                                  borderColor="white"
                                                  borderTopColor="transparent"
                                                  animation="spin 0.6s linear infinite"
                                                  sx={{
                                                    '@keyframes spin': {
                                                      '0%': { transform: 'rotate(0deg)' },
                                                      '100%': { transform: 'rotate(360deg)' }
                                                    }
                                                  }}
                                                />
                                                Grading...
                                              </Badge>
                                            )}
                                            <Badge 
                                            size="sm" 
                                              colorScheme={
                                              assignment.status === 'complete' ? 'green' :
                                              assignment.status === 'in progress' ? 'blue' : 'gray'
                                              } 
                                            variant="solid"
                                              fontSize="xs"
                                            >
                                            {assignment.status === 'in progress' ? 'In Progress' : 
                                             assignment.status === 'complete' ? 'Completed' : 
                                             'Not Started'}
                                            </Badge>
                                          </HStack>
                                      </HStack>
                                      
                                      {assignment.description && (
                                        <Text fontSize="xs" color={textSecondary} noOfLines={2}>
                                          {assignment.description}
                                        </Text>
                                      )}
                                      
                                      <HStack spacing={2} fontSize="xs" color={textSecondary}>
                                        {assignment.due && (
                                          <Text>
                                            Due {new Date(assignment.due).toLocaleDateString()}
                                          </Text>
                                        )}
                                      </HStack>
                                      
                                      {/* Show recent sessions for selected assignment */}
                                      {isSelected && (
                                        <Box w="full" mt={3}>
                                          <HStack justify="space-between" mb={2}>
                                            <Text fontSize="xs" fontWeight="600" color={textPrimary}>
                                              Recent Practice Sessions ({assignmentSessions.length})
                                            </Text>
                                            <IconButton
                                              aria-label="Refresh sessions"
                                              icon={<Icon as={RefreshCw} boxSize={3} />}
                                              size="xs"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                if (profile?.id) {
                                                  fetchAssignmentSessions(assignment.id, profile.id)
                                                }
                                              }}
                                              isLoading={isLoadingSessions}
                                            />
                                          </HStack>
                                          
                                          {isLoadingSessions ? (
                                            <Box textAlign="center" py={2}>
                                              <Text fontSize="xs" color={textSecondary}>Loading...</Text>
                                            </Box>
                                          ) : assignmentSessions.length === 0 ? (
                                            <Box 
                                              p={3} 
                                              bg={useColorModeValue('gray.50', 'gray.800')}
                                              borderRadius="lg"
                                              textAlign="center"
                                            >
                                              <Text fontSize="xs" color={textSecondary}>
                                                No practice sessions yet. Click "Start Training" to begin!
                                              </Text>
                                            </Box>
                                          ) : (
                                            <VStack spacing={2} align="stretch">
                                              {assignmentSessions.slice(0, 5).map((session) => (
                                                <Box
                                                  key={session.id}
                                                  p={3}
                                                  bg={session.submitted_for_review ? 
                                                    useColorModeValue('green.50', 'green.900/20') :
                                                    useColorModeValue('gray.50', 'gray.800')
                                                  }
                                                  borderRadius="lg"
                                                  border="1px solid"
                                                  borderColor={session.submitted_for_review ?
                                                    useColorModeValue('green.200', 'green.800') :
                                                    useColorModeValue('gray.200', 'gray.700')
                                                  }
                                                >
                                                  <HStack justify="space-between" align="start" spacing={2}>
                                                    <VStack align="start" spacing={0} flex={1}>
                                                      <Text fontSize="xs" fontWeight="600" color={textPrimary}>
                                                        {new Date(session.end_time).toLocaleDateString()} at {new Date(session.end_time).toLocaleTimeString()}
                                                      </Text>
                                                      <Text fontSize="xs" color={textSecondary}>
                                                        Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                                                      </Text>
                                                      {session.grade && (
                                                        <Text fontSize="xs" color={textSecondary}>
                                                          Score: {Math.round(session.grade.percentage)}%
                                                        </Text>
                                                      )}
                                                      {session.submitted_for_review && (
                                                        <Badge colorScheme="green" size="sm" mt={1}>
                                                          Submitted ✓
                                          </Badge>
                                        )}
                                                    </VStack>
                                                    {!session.submitted_for_review && (
                                                      <Button
                                                        size="xs"
                                                        colorScheme="orange"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          submitSessionForReview(session.id)
                                                        }}
                                                        isLoading={submittingSessionId === session.id}
                                                        borderRadius="md"
                                                      >
                                                        Submit
                                                      </Button>
                                        )}
                                      </HStack>
                                                </Box>
                                              ))}
                                            </VStack>
                                          )}
                                        </Box>
                                      )}
                                    </VStack>
                                  </CardBody>
                                </Card>
                              )
                            })
                          )}
                        </VStack>
                      </Box>
                      
                      {/* Tabs at bottom - Fixed to physical bottom of screen */}
                      <Box
                        position="fixed"
                        bottom="0"
                        left="0"
                        right="50%"
                        p={4}
                        bg={cardBg}
                        backdropFilter="blur(10px)"
                        zIndex={10}
                      >
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant={assignmentTab === 'current' ? 'solid' : 'outline'}
                            colorScheme="orange"
                            bg={assignmentTab === 'current' ? '#f26f25' : 'transparent'}
                            onClick={() => setAssignmentTab('current')}
                            borderRadius="full"
                            fontWeight="600"
                            flex={1}
                            _hover={{
                              transform: assignmentTab === 'current' ? 'none' : 'translateY(-1px)',
                              bg: assignmentTab === 'current' ? '#d95e1e' : undefined
                            }}
                          >
                            Current
                          </Button>
                          <Button
                            size="sm"
                            variant={assignmentTab === 'completed' ? 'solid' : 'outline'}
                            colorScheme="green"
                            onClick={() => setAssignmentTab('completed')}
                            borderRadius="full"
                            fontWeight="600"
                            flex={1}
                            _hover={{
                              transform: assignmentTab === 'completed' ? 'none' : 'translateY(-1px)',
                            }}
                          >
                            Completed
                          </Button>
                        </HStack>
                      </Box>
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
             bg={useColorModeValue('gray.100', 'gray.750')}
             _hover={{ 
               bg: accentColor,
               w: "3px",
               shadow: 'lg'
             }}
             transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
             cursor="col-resize"
             position="relative"
             display="flex"
             alignItems="center"
             justifyContent="center"
           >
             {/* Decorative handle dots */}
             <Box 
               position="absolute"
               bg={useColorModeValue('white', 'gray.800')}
               borderRadius="full"
               p={1}
               shadow="sm"
               opacity={0.7}
               _hover={{ opacity: 1 }}
               transition="opacity 0.2s"
             >
               <VStack spacing={0.5}>
                 <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
                 <Box w="3px" h="3px" bg={useColorModeValue('gray.400', 'gray.500')} borderRadius="full" />
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
              boxShadow="sm"
            >
                <Flex 
                px={6}
                py={4}
                borderBottom="1px"
                borderColor={borderColor}
                justify="space-between"
                align="center"
              >
                <VStack align="start" spacing={1} flex={1}>
                  <Heading 
                    size="md" 
                    color={textPrimary}
                    fontWeight="600"
                  >
                    Live Transcript
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={textSecondary}
                  >
                    AI-powered conversation analysis
                  </Text>
                </VStack>
                
                <HStack spacing={3} flexShrink={0}>
            {/* Script Button - Show for admins with template OR employees with assignment */}
            {(selectedTemplate || (!userRole.isAdmin && selectedAssignment)) && scriptText && (
                    <Button
                      leftIcon={<Icon as={FileText} boxSize="4" />}
                      size="sm"
                      variant="ghost"
                      color={useColorModeValue('gray.600', 'gray.400')}
                      bg={isOpen ? useColorModeValue('orange.50', 'orange.900/30') : 'transparent'}
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
                      (userRole.isAdmin ? !selectedTemplate : (!selectedTemplate && !selectedAssignment))
                    }
                    bg={isCallActive 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #f26f25, #d95e1e)'
                    }
                    color="white"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: '2xl',
                      bg: isCallActive 
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
                        : 'linear-gradient(135deg, #d95e1e, #b84e19)',
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
                                    ? useColorModeValue('orange.50/50', 'orange.900/20') 
                                    : useColorModeValue('green.50/50', 'green.900/20')
                                  }
                                  p={5}
                                  borderRadius="2xl"
                                  border="1px solid"
                                  borderColor={segment.speaker === 'You' 
                                    ? useColorModeValue('orange.100', 'orange.800/50') 
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
                bg={useColorModeValue('orange.50/70', 'orange.900/30')} 
                borderRadius="2xl"
                border="1px solid"
                borderColor={useColorModeValue('orange.100', 'orange.800/50')}
              >
                <Icon as={FileText} color={accentColor} boxSize={7} />
              </Box>
              <VStack align="start" spacing={2} flex="1">
                <Text fontSize="xl" fontWeight="700" color={useColorModeValue('gray.900', 'white')} letterSpacing="-0.02em">
                  Script Preview
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="500">
                  {(() => {
                    // For assignments, get the assignment template and check for built-in match
                    if (selectedAssignment) {
                      const assignmentTemplate = templates.find(t => t.id === selectedAssignment.template)
                      if (assignmentTemplate) {
                        const builtInMatch = findBuiltInTemplateByTitle(assignmentTemplate.title)
                        return (builtInMatch || assignmentTemplate)?.title || 'Training Script'
                      }
                    }
                    // For playground, use selected template
                    const builtInTemplate = ALL_BUILT_IN_TEMPLATES.find(t => t.id === selectedTemplate)
                    const customTemplate = templates.find(t => t.id.toString() === selectedTemplate)
                    return (builtInTemplate || customTemplate)?.title || 'Training Script'
                  })()}
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
                      color: useColorModeValue('#f26f25', '#ff7d31'),
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
                              <Text as="span" fontWeight="bold" color="#f26f25">
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

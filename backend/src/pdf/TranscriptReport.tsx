import React from 'react'
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
} from '@react-pdf/renderer'

// Define styles with Clozone orange branding
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 70,
    paddingBottom: 80,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },
  
  // Header Section
  header: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#f26f25',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
  },
  headerLogo: {
    width: 120,
    height: 30,
    objectFit: 'contain',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#ffffff',
  },
  
  // Footer Section
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    borderTopWidth: 2,
    borderTopColor: '#f26f25',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
  },
  pageNumber: {
    fontSize: 9,
    color: '#f26f25',
    fontWeight: 600,
  },
  
  // Title Section
  titleSection: {
    marginBottom: 20,
    marginTop: 5,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: '#fff5f0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#f26f25',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 600,
    width: 120,
  },
  infoValue: {
    fontSize: 10,
    color: '#1a1a1a',
    flex: 1,
  },
  
  // Score Section
  scoreSection: {
    backgroundColor: '#f26f25',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    marginTop: 5,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 600,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: 700,
    color: '#ffffff',
  },
  scoreSmall: {
    fontSize: 24,
    color: '#ffffff',
    opacity: 0.9,
  },
  scorePercentage: {
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontWeight: 600,
  },
  
  // Section Headers
  sectionHeader: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: 15,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#f26f25',
  },
  
  // Conversation
  conversationContainer: {
    marginBottom: 20,
  },
  messageBlock: {
    marginBottom: 10,
    paddingLeft: 8,
  },
  speakerYou: {
    fontSize: 11,
    fontWeight: 700,
    color: '#f26f25',
    marginBottom: 5,
  },
  speakerAI: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2196F3',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
    paddingLeft: 10,
  },
  
  // Criteria Cards
  criteriaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a1a1a',
    flex: 1,
  },
  criteriaScore: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f26f25',
  },
  criteriaDescription: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  evidenceSection: {
    marginTop: 10,
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 4,
  },
  evidenceLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 5,
  },
  evidenceItem: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 4,
    paddingLeft: 10,
    lineHeight: 1.4,
  },
  reasoningSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff5f0',
    borderLeftWidth: 3,
    borderLeftColor: '#f26f25',
    borderRadius: 4,
  },
  reasoningLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 5,
  },
  reasoningText: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.4,
  },
  
  // Badge
  badge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 9,
    color: '#2e7d32',
    fontWeight: 600,
  },
})

interface TranscriptChunk {
  speaker: string
  text: string
  timestamp: Date
}

interface CriteriaGrade {
  title: string
  description: string
  maxPoints: number
  earnedPoints: number
  evidence?: string[]
  reasoning: string
}

interface TranscriptReportProps {
  templateTitle: string
  templateDescription?: string
  assignmentTitle?: string
  startTime: Date
  endTime: Date
  duration: number
  cleanedTranscript: string
  gradingResult?: {
    totalScore: number
    maxPossibleScore: number
    criteriaGrades: CriteriaGrade[]
  }
  isAssignment: boolean
}

// Helper to format time
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Helper to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper to format duration
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

// Helper to get score color badge
const getScoreColor = (percentage: number) => {
  if (percentage >= 85) return '#4caf50' // Green
  if (percentage >= 70) return '#ff9800' // Orange
  return '#f44336' // Red
}

export const TranscriptReportDocument = ({
  templateTitle,
  templateDescription,
  assignmentTitle,
  startTime,
  endTime,
  duration,
  cleanedTranscript,
  gradingResult,
  isAssignment,
}: TranscriptReportProps) => {
  // Parse the cleaned transcript into conversation blocks
  const conversationLines = cleanedTranscript
    .split('\n')
    .filter(line => line.trim() !== '')
  
  // Calculate score percentage
  const scorePercentage = gradingResult 
    ? Math.round((gradingResult.totalScore / gradingResult.maxPossibleScore) * 100)
    : 0

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>CLOZONE AI</Text>
          <Text style={{ ...styles.headerTitle, fontSize: 12 }}>Training Report</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Clozone AI - Sales Training Platform</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{isAssignment ? 'Assignment Report' : 'Training Session'}</Text>
          <Text style={styles.subtitle}>{templateTitle || 'Training Session'}</Text>
          {assignmentTitle && assignmentTitle.trim() !== '' && (
            <Text style={styles.subtitle}>Assignment: {assignmentTitle}</Text>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(startTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Time</Text>
            <Text style={styles.infoValue}>{formatTime(startTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Time</Text>
            <Text style={styles.infoValue}>{formatTime(endTime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{formatDuration(duration)}</Text>
          </View>
          {templateDescription && templateDescription.trim() !== '' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{templateDescription}</Text>
            </View>
          )}
        </View>

        {/* Score Section - Only for assignments with grading */}
        {gradingResult && isAssignment && (
          <View style={styles.scoreSection}>
            <Text style={styles.scoreTitle}>Overall Performance Score</Text>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreBig}>{gradingResult.totalScore}</Text>
              <Text style={styles.scoreSmall}>/{gradingResult.maxPossibleScore}</Text>
            </View>
            <Text style={styles.scorePercentage}>{scorePercentage}%</Text>
          </View>
        )}

        {/* Conversation Transcript Section */}
        <Text style={styles.sectionHeader}>Conversation Transcript</Text>
        <View style={styles.conversationContainer}>
          {conversationLines.map((line, index) => {
            if (!line || line.trim() === '') return null
            
            if (line.startsWith('You:')) {
              const message = line.substring(4).trim()
              if (!message) return null
              return (
                <View key={index} style={styles.messageBlock}>
                  <Text style={styles.speakerYou}>You</Text>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              )
            } else if (line.startsWith('AI Customer:')) {
              const message = line.substring(12).trim()
              if (!message) return null
              return (
                <View key={index} style={styles.messageBlock}>
                  <Text style={styles.speakerAI}>AI Customer</Text>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              )
            } else {
              return (
                <View key={index} style={styles.messageBlock}>
                  <Text style={styles.messageText}>{line}</Text>
                </View>
              )
            }
          })}
        </View>
      </Page>

      {/* Grading Report Page - Only for assignments */}
      {gradingResult && isAssignment && (
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header} fixed>
            <Text style={styles.headerTitle}>CLOZONE AI</Text>
            <Text style={{ ...styles.headerTitle, fontSize: 12 }}>Evaluation Criteria</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Clozone AI - Sales Training Platform</Text>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
          </View>

          <Text style={styles.sectionHeader}>Detailed Evaluation</Text>

          {gradingResult.criteriaGrades.map((criteria, index) => {
            const criteriaPercentage = Math.round((criteria.earnedPoints / criteria.maxPoints) * 100)
            
            return (
              <View key={index} style={styles.criteriaCard} wrap={false}>
                <View style={styles.criteriaHeader}>
                  <Text style={styles.criteriaTitle}>{criteria.title || 'Criteria'}</Text>
                  <Text style={styles.criteriaScore}>
                    {criteria.earnedPoints || 0}/{criteria.maxPoints || 0} pts
                  </Text>
                </View>

                {criteria.description && criteria.description.trim() !== '' && (
                  <Text style={styles.criteriaDescription}>{criteria.description}</Text>
                )}

                {/* Evidence Section */}
                {criteria.evidence && criteria.evidence.length > 0 && (
                  <View style={styles.evidenceSection}>
                    <Text style={styles.evidenceLabel}>Evidence from Transcript:</Text>
                    {criteria.evidence.filter(e => e && e.trim() !== '').map((evidence, evidenceIndex) => (
                      <Text key={evidenceIndex} style={styles.evidenceItem}>
                        • "{evidence}"
                      </Text>
                    ))}
                  </View>
                )}

                {/* Reasoning Section */}
                {criteria.reasoning && criteria.reasoning.trim() !== '' && (
                  <View style={styles.reasoningSection}>
                    <Text style={styles.reasoningLabel}>Evaluation:</Text>
                    <Text style={styles.reasoningText}>{criteria.reasoning}</Text>
                  </View>
                )}
              </View>
            )
          })}
        </Page>
      )}
    </Document>
  )
}


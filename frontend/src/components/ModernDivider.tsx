import React from 'react'
import { Box } from '@chakra-ui/react'

interface ModernDividerProps {
  orientation?: 'horizontal' | 'vertical'
  inset?: boolean
  thickness?: number
  length?: string | number
  rounded?: boolean
  fade?: 'soft' | 'strong'
  style?: React.CSSProperties
}

const ModernDivider: React.FC<ModernDividerProps> = ({
  orientation = 'horizontal',
  inset = false,
  thickness = 2,
  length,
  rounded = true,
  fade = 'soft',
  style
}) => {
  const isVertical = orientation === 'vertical'

  // Use currentColor so the divider automatically contrasts with the surrounding text color,
  // independent of Chakra's color mode. Add a faint shadow layer underneath to improve
  // visibility across busy backgrounds and when not hovered.
  const baseGradient = 'linear-gradient(to right, transparent, currentColor, transparent)'
  const shadowGradient = 'linear-gradient(to right, transparent, rgba(0,0,0,0.35), transparent)'
  const opacity = fade === 'strong' ? 0.85 : 0.5
  const background = `${baseGradient}, ${shadowGradient}`

  const commonRadius = rounded ? (isVertical ? `${thickness}px` : `${thickness}px`) : '0px'

  return (
    <Box
      as="span"
      aria-hidden
      position="relative"
      display="block"
      width={isVertical ? `${thickness}px` : '100%'}
      height={isVertical ? (length || '100%') : (length || `${thickness}px`)}
      my={isVertical ? 0 : (inset ? 2 : 4)}
      mx={isVertical ? (inset ? 2 : 3) : 0}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        background,
        borderRadius: commonRadius,
        opacity,
      }}
      style={style}
    />
  )
}

export default ModernDivider



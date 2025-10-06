import React, { useCallback, memo, useEffect, useState } from 'react';
import { getSentenceColors, getActiveSentenceColor, getHighlightColor } from '@/lib/sentenceUtils';
import { SuggestionHighlighter } from './SuggestionHighlighter';

interface InlineFeedback {
  originalText: string;
  startIndex?: number;
  endIndex?: number;
  category: string;
  explanation: string;
  suggestion: string;
  suggestionExplanation: string;
}

interface SentenceWrapperProps {
  sentence: {
    id: string;
    text: string;
    index: number;
  };
  dataId: string;
  isActive: boolean;
  onHover: (sentenceId: string | null) => void;
  onFocus: (sentenceId: string | null) => void;
  className?: string;
  inlineFeedback?: InlineFeedback[];
  improvedTextsnippets?: InlineFeedback[];
  showErrors?: boolean;
}

let globalHoveredDataId: string | null = null;
const hoverListeners: Set<(dataId: string | null) => void> = new Set();

const setGlobalHoveredDataId = (dataId: string | null) => {
  globalHoveredDataId = dataId;
  hoverListeners.forEach(listener => listener(dataId));
};

// Helper function to get corresponding dataId for cross-highlighting
const getCorrespondingDataId = (dataId: string, isOriginal: boolean): string => {
  if (!dataId) return '';
  
  // Extract the sentence index from the dataId
  const parts = dataId.split('-');
  if (parts.length < 2) return '';
  
  const sentenceIndex = parts[parts.length - 1];
  const paragraphType = parts.slice(0, -1).join('-');
  
  // Map between original and improved versions
  if (isOriginal) {
    // Convert original to improved
    if (paragraphType.includes('original')) {
      const improvedType = paragraphType.replace('original', 'improved');
      const result = `${improvedType}-${sentenceIndex}`;
      return result;
    }
  } else {
    // Convert improved to original
    if (paragraphType.includes('improved')) {
      const originalType = paragraphType.replace('improved', 'original');
      const result = `${originalType}-${sentenceIndex}`;
      return result;
    }
  }
  
  return dataId;
};

export const SentenceWrapper: React.FC<SentenceWrapperProps> = memo(({
  sentence,
  dataId,
  isActive,
  onHover,
  onFocus,
  className = '',
  inlineFeedback = [],
  improvedTextsnippets = [],
  showErrors = false
}) => {
  const baseColors = getSentenceColors(sentence.index);
  const activeColors = getActiveSentenceColor(sentence.index);
  const [isGloballyHovered, setIsGloballyHovered] = useState(false);
  
  useEffect(() => {
    const listener = (hoveredDataId: string | null) => {
      // Check if this sentence should be highlighted based on cross-highlighting
      const isOriginal = dataId.includes('original');
      const correspondingId = getCorrespondingDataId(hoveredDataId || '', !isOriginal);
      const shouldHighlight = hoveredDataId === dataId || correspondingId === dataId;
      
      setIsGloballyHovered(shouldHighlight);
    };
    
    hoverListeners.add(listener);
    
    // Check initial state
    const isOriginal = dataId.includes('original');
    const correspondingId = getCorrespondingDataId(globalHoveredDataId || '', !isOriginal);
    const shouldHighlight = globalHoveredDataId === dataId || correspondingId === dataId;
    setIsGloballyHovered(shouldHighlight);
    
    return () => {
      hoverListeners.delete(listener);
    };
  }, [dataId]);
  
  const handleMouseEnter = useCallback(() => {
    // Always allow hover for cross-highlighting, but be careful with SuggestionHighlighter
    setGlobalHoveredDataId(dataId);
    onHover(sentence.id);
  }, [dataId, onHover, sentence.id]);
  
  const handleMouseLeave = useCallback(() => {
    // Always allow hover clearing for cross-highlighting
    setGlobalHoveredDataId(null);
    onHover(null);
  }, [onHover]);
  
  const handleFocus = useCallback(() => {
    onFocus(sentence.id);
  }, [onFocus, sentence.id]);
  
  const handleBlur = useCallback(() => {
    onFocus(null);
  }, [onFocus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMouseEnter();
    } else if (e.key === 'Escape') {
      handleMouseLeave();
    }
  }, [handleMouseEnter, handleMouseLeave]);
  
  const currentColors = isGloballyHovered 
    ? getHighlightColor(sentence.index)
    : (isActive ? activeColors : baseColors);
  
  return (
    <span
      data-sentence-id={dataId}
      className={`
        inline transition-colors duration-200 cursor-pointer
        ${currentColors}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Sentence ${sentence.index + 1}: ${sentence.text.substring(0, 50)}${sentence.text.length > 50 ? '...' : ''}`}
      aria-describedby={`sentence-${sentence.id}-description`}
    >
      {showErrors && (inlineFeedback.length > 0 || improvedTextsnippets.length > 0) ? (
        <SuggestionHighlighter
          text={sentence.text}
          inlineFeedback={inlineFeedback}
          improvedTextsnippets={improvedTextsnippets}
        />
      ) : (
        sentence.text
      )}
    </span>
  );
});
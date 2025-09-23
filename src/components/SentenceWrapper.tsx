import React, { useCallback, memo, useEffect, useState } from 'react';
import { getSentenceColors, getActiveSentenceColor, getHighlightColor } from '@/lib/sentenceUtils';
import { SuggestionHighlighter } from './SuggestionHighlighter';

interface InlineFeedback {
  originalText: string;
  startIndex: number;
  endIndex: number;
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
  mistakes?: string[];
  suggestions?: string[];
  inlineFeedback?: InlineFeedback[];
  showErrors?: boolean;
}

let globalHoveredDataId: string | null = null;
const hoverListeners: Set<(dataId: string | null) => void> = new Set();

const setGlobalHoveredDataId = (dataId: string | null) => {
  globalHoveredDataId = dataId;
  hoverListeners.forEach(listener => listener(dataId));
};

export const SentenceWrapper: React.FC<SentenceWrapperProps> = memo(({
  sentence,
  dataId,
  isActive,
  onHover,
  onFocus,
  className = '',
  mistakes = [],
  suggestions = [],
  inlineFeedback = [],
  showErrors = false
}) => {
  const baseColors = getSentenceColors(sentence.index);
  const activeColors = getActiveSentenceColor(sentence.index);
  const [isGloballyHovered, setIsGloballyHovered] = useState(false);
  
  useEffect(() => {
    const listener = (hoveredDataId: string | null) => {
      setIsGloballyHovered(hoveredDataId === dataId);
    };
    
    hoverListeners.add(listener);
    
    setIsGloballyHovered(globalHoveredDataId === dataId);
    
    return () => {
      hoverListeners.delete(listener);
    };
  }, [dataId]);
  
  const handleMouseEnter = useCallback(() => {
    setGlobalHoveredDataId(dataId);
    onHover(sentence.id);
  }, [dataId, onHover, sentence.id]);
  
  const handleMouseLeave = useCallback(() => {
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
        inline-block px-2 py-1 rounded-md transition-all duration-300 cursor-pointer
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
      {showErrors && (mistakes.length > 0 || suggestions.length > 0 || inlineFeedback.length > 0) ? (
        <SuggestionHighlighter
          text={sentence.text}
          mistakes={mistakes}
          suggestions={suggestions}
          inlineFeedback={inlineFeedback}
        />
      ) : (
        sentence.text
      )}
    </span>
  );
});

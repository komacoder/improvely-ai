import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface SuggestionHighlight {
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'mistake' | 'improvement';
  description: string;
  category: string;
  suggestion?: string;
  suggestionExplanation?: string;
}

interface InlineFeedback {
  originalText: string;
  startIndex?: number;
  endIndex?: number;
  category: string;
  explanation: string;
  suggestion: string;
  suggestionExplanation: string;
}

interface SuggestionHighlighterProps {
  text: string;
  inlineFeedback?: InlineFeedback[];
  improvedTextsnippets?: InlineFeedback[];
  className?: string;
}

// Helper function to find ALL text positions in the content
const findAllTextPositions = (text: string, searchText: string) => {
  const positions: { startIndex: number; endIndex: number }[] = [];
  let startIndex = 0;
  
  while ((startIndex = text.indexOf(searchText, startIndex)) !== -1) {
    positions.push({
      startIndex: startIndex,
      endIndex: startIndex + searchText.length
    });
    startIndex += searchText.length; // Move past the current match to find the next one
  }
  
  return positions;
};

// Enhanced Tooltip Component with mobile optimization
const SimpleTooltip: React.FC<{ highlight: SuggestionHighlight; isVisible: boolean }> = ({ highlight, isVisible }) => {
  if (!isVisible) return null;

  const isMistake = highlight.type === 'mistake';
  const iconColor = isMistake ? 'text-red-400' : 'text-green-500';
  const badgeColor = isMistake 
    ? 'bg-red-500/20 text-red-100 border-red-400/30' 
    : 'bg-green-500/30 text-green-100 border-green-500/40';

  return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200 max-w-[90vw] sm:max-w-none">
          <div className="relative rounded-2xl bg-gray-900/95 backdrop-blur-sm text-white shadow-2xl ring-1 ring-white/10 max-w-xs sm:max-w-sm w-max px-4 py-3 sm:px-5 sm:py-4">
        {/* Arrow with better positioning */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-900/95 backdrop-blur-sm shadow-[2px_2px_4px_0_rgba(0,0,0,0.1)]" />
        
        {/* Header with improved spacing */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            {isMistake ? (
              <AlertCircle className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
            ) : (
              <Lightbulb className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
            )}
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">
              {isMistake ? 'Issue Found' : 'Improvement'}
            </span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-lg font-medium border ${badgeColor} whitespace-nowrap`}
          >
            {highlight.category || 'General'}
          </span>
        </div>

        {/* Body with better typography */}
        <div className="text-xs sm:text-sm leading-relaxed text-gray-100 pr-1">
          {highlight.description}
        </div>

        {/* Suggestion section */}
        {highlight.suggestion && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-[10px] sm:text-xs font-medium text-gray-300 mb-1">
              💡 Suggestion:
            </div>
            <div className="text-xs sm:text-sm leading-relaxed text-green-100 bg-green-800/30 rounded-md p-2 mb-2 border border-green-600/30">
              "{highlight.suggestion}"
            </div>
            {highlight.suggestionExplanation && (
              <div className="text-[10px] sm:text-xs leading-relaxed text-gray-300">
                {highlight.suggestionExplanation}
              </div>
            )}
          </div>
        )}

        {/* Mobile touch indicator */}
        <div className="mt-2 text-[10px] text-gray-400 sm:hidden">
          Tap to dismiss
        </div>
      </div>
    </div>
  );
};

const getColorForType = (type: 'mistake' | 'improvement') => {
  if (type === 'mistake') {
    // Inline red highlighting that doesn't break sentence flow
    return 'bg-red-200/40 text-red-900 hover:bg-red-300/60 cursor-pointer touch-manipulation select-none';
  } else {
    // Enhanced green highlighting for improved versions - more visible
    return 'bg-green-300/70 text-green-900 hover:bg-green-400/80 cursor-pointer touch-manipulation select-none font-medium';
  }
};

export const SuggestionHighlighter: React.FC<SuggestionHighlighterProps> = ({
  text,
  inlineFeedback = [],
  improvedTextsnippets = [],
  className = ''
}) => {
  const [activeHighlight, setActiveHighlight] = useState<SuggestionHighlight | null>(null);

  // Add click outside handler for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-highlight]')) {
        setActiveHighlight(null);
      }
    };

    if (activeHighlight) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeHighlight]);
  
  // Debug logging
  console.log('SuggestionHighlighter received:', {
    textLength: text.length,
    inlineFeedbackCount: inlineFeedback.length,
    improvedTextsnippetsCount: improvedTextsnippets.length,
    textPreview: text.substring(0, 100) + '...'
  });
  
  const suggestionHighlights = useMemo(() => {
    const highlights: SuggestionHighlight[] = [];
    const coveredRanges: { start: number; end: number }[] = [];
    
    // Helper function to check if a position overlaps with existing highlights
    const isOverlapping = (start: number, end: number) => {
      return coveredRanges.some(range => 
        (start >= range.start && start < range.end) ||
        (end > range.start && end <= range.end) ||
        (start <= range.start && end >= range.end)
      );
    };
    
    // Helper function to add highlight and mark range as covered
    const addHighlight = (highlight: SuggestionHighlight) => {
      if (!isOverlapping(highlight.startIndex, highlight.endIndex)) {
        highlights.push(highlight);
        coveredRanges.push({ start: highlight.startIndex, end: highlight.endIndex });
        return true;
      }
      return false;
    };
    
    // Process inline feedback for original essay (red highlights)
    inlineFeedback.forEach((feedback, index) => {
      const originalText = feedback.originalText;
      const positions = findAllTextPositions(text, originalText);
      
      positions.forEach((position, positionIndex) => {
        const highlight = {
          text: originalText,
          startIndex: position.startIndex,
          endIndex: position.endIndex,
          type: 'mistake' as const,
          description: feedback.explanation,
          category: feedback.category,
          suggestion: feedback.suggestion,
          suggestionExplanation: feedback.suggestionExplanation
        };
        
        if (addHighlight(highlight)) {
          console.log(`Added mistake highlight ${index}-${positionIndex}:`, originalText, 'at position', position.startIndex);
        } else {
          console.log(`Skipped overlapping mistake highlight ${index}-${positionIndex}:`, originalText);
        }
      });
    });
    
    // Process improved textsnippets for improved versions (green highlights)
    improvedTextsnippets.forEach((snippet, index) => {
      const originalText = snippet.originalText;
      const positions = findAllTextPositions(text, originalText);
      
      positions.forEach((position, positionIndex) => {
        const highlight = {
          text: originalText,
          startIndex: position.startIndex,
          endIndex: position.endIndex,
          type: 'improvement' as const,
          description: snippet.explanation,
          category: snippet.category,
          suggestion: snippet.suggestion,
          suggestionExplanation: snippet.suggestionExplanation
        };
        
        if (addHighlight(highlight)) {
          console.log(`Added improvement highlight ${index}-${positionIndex}:`, originalText, 'at position', position.startIndex);
        } else {
          console.log(`Skipped overlapping improvement highlight ${index}-${positionIndex}:`, originalText);
        }
      });
    });
    
    // Sort by start index
    const sortedHighlights = highlights.sort((a, b) => a.startIndex - b.startIndex);
    
    console.log('SuggestionHighlighter highlights created:', sortedHighlights.length);
    sortedHighlights.forEach((highlight, index) => {
      console.log(`Highlight ${index}:`, highlight.text, 'type:', highlight.type, 'at position', highlight.startIndex);
    });
    
    return sortedHighlights;
  }, [text, inlineFeedback, improvedTextsnippets]);

  // Only show highlights if we have any
  if (suggestionHighlights.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Simple hover handlers
  const handleMouseEnter = (highlight: SuggestionHighlight) => {
    setActiveHighlight(highlight);
  };

  const handleMouseLeave = () => {
    setActiveHighlight(null);
  };

  // Split text into parts with highlighted suggestions/errors
  const renderTextWithHighlights = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    suggestionHighlights.forEach((highlight, index) => {
      // Add text before the highlight
      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.startIndex)}
          </span>
        );
      }

      // Add the highlighted suggestion/error as inline text (no containers)
      const colorClasses = getColorForType(highlight.type);
      
      parts.push(
        <span
          key={`highlight-${index}`}
          data-highlight
          className={`
            ${colorClasses}
            transition-colors duration-150 ease-out
            relative cursor-pointer inline
            ${activeHighlight === highlight 
              ? 'ring-1 ring-gray-400 z-20' 
              : ''
            }
          `}
          onMouseEnter={() => handleMouseEnter(highlight)}
          onMouseLeave={handleMouseLeave}
          onTouchStart={() => handleMouseEnter(highlight)}
          onTouchEnd={() => handleMouseLeave()}
          onClick={() => {
            if (activeHighlight === highlight) {
              setActiveHighlight(null);
            } else {
              setActiveHighlight(highlight);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`${highlight.type === 'mistake' ? 'Issue' : 'Improvement'}: ${highlight.description}`}
        >
          {highlight.text}
          {activeHighlight === highlight && (
            <SimpleTooltip highlight={highlight} isVisible={true} />
          )}
        </span>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <span className={className}>
      {renderTextWithHighlights()}
    </span>
  );
};
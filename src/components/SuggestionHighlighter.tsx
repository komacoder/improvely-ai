import React, { useMemo, useState } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface SuggestionHighlight {
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'mistake' | 'suggestion' | 'inline';
  description: string;
  suggestion?: string;
  category: string;
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
  mistakes: string[];
  suggestions: string[];
  inlineFeedback?: InlineFeedback[];
  className?: string;
}

interface SimpleTooltipProps {
  highlight: SuggestionHighlight;
  isVisible: boolean;
}

/**
 * AI-powered suggestion highlighting that uses ONLY backend AI feedback with exact indices
 * No hardcoded patterns - everything comes from AI analysis with precise positioning
 */

// Helper function to find text positions when startIndex/endIndex are not provided
const findTextPosition = (text: string, searchText: string): { startIndex: number; endIndex: number } | null => {
  const index = text.indexOf(searchText);
  if (index === -1) {
    return null;
  }
  return {
    startIndex: index,
    endIndex: index + searchText.length
  };
};


// Helper function to categorize inline feedback based on content
const categorizeFeedback = (feedback: InlineFeedback): 'mistake' | 'suggestion' | 'inline' => {
  const explanation = feedback.explanation.toLowerCase();
  const category = feedback.category.toLowerCase();
  
  // Check if it's a mistake (grammar errors, clarity issues, etc.)
  if (category.includes('grammar') || 
      category.includes('clarity') || 
      explanation.includes('error') || 
      explanation.includes('errors') ||
      explanation.includes('incorrect') || 
      explanation.includes('missing') || 
      explanation.includes('wrong') ||
      explanation.includes('should be') ||
      explanation.includes('requires') ||
      explanation.includes('subject–verb agreement') ||
      explanation.includes('article usage') ||
      explanation.includes('preposition') ||
      explanation.includes('collocation') ||
      explanation.includes('pluralization') ||
      explanation.includes('imprecise') ||
      explanation.includes('informal') ||
      explanation.includes('awkward') ||
      explanation.includes('vague')) {
    return 'mistake';
  }
  
  // Check if it's a suggestion (improvements, better alternatives)
  if (explanation.includes('suggestion') || 
      explanation.includes('better') || 
      explanation.includes('improve') || 
      explanation.includes('preferable') ||
      explanation.includes('more precise') ||
      explanation.includes('more formal') ||
      explanation.includes('enhance') ||
      explanation.includes('corrects') ||
      explanation.includes('uses') ||
      explanation.includes('provides') ||
      explanation.includes('improves') ||
      explanation.includes('more natural') ||
      explanation.includes('more idiomatic') ||
      explanation.includes('sophisticated') ||
      explanation.includes('advanced')) {
    return 'suggestion';
  }
  
  // Default to inline feedback (purple)
  return 'inline';
};

// Simple Tooltip Component
const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ highlight, isVisible }) => {
  if (!isVisible) return null;

  const getTooltipColors = () => {
    const categoryLower = highlight.category?.toLowerCase() || '';
    
    if (categoryLower.includes('grammar') || categoryLower.includes('grammatical')) {
      return 'bg-red-50 text-red-800 border-red-200';
    } else if (categoryLower.includes('lexical') || categoryLower.includes('vocabulary')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (categoryLower.includes('coherence') || categoryLower.includes('cohesion')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    } else if (categoryLower.includes('task') || categoryLower.includes('response')) {
      return 'bg-orange-50 text-orange-800 border-orange-200';
    } else if (categoryLower.includes('clarity') || categoryLower.includes('precision')) {
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getArrowColor = () => {
    const categoryLower = highlight.category?.toLowerCase() || '';
    
    if (categoryLower.includes('grammar') || categoryLower.includes('grammatical')) {
      return 'border-t-red-200';
    } else if (categoryLower.includes('lexical') || categoryLower.includes('vocabulary')) {
      return 'border-t-blue-200';
    } else if (categoryLower.includes('coherence') || categoryLower.includes('cohesion')) {
      return 'border-t-purple-200';
    } else if (categoryLower.includes('task') || categoryLower.includes('response')) {
      return 'border-t-orange-200';
    } else if (categoryLower.includes('clarity') || categoryLower.includes('precision')) {
      return 'border-t-yellow-200';
    } else {
      return 'border-t-gray-200';
    }
  };

  const colors = getTooltipColors();
  const arrowColor = getArrowColor();
  const IconComponent = highlight.type === 'mistake' ? AlertCircle : Lightbulb;

  return (
    <div className={`absolute z-50 ${colors} border rounded-lg shadow-xl p-4 max-w-sm min-w-[280px] transform -translate-y-full -translate-x-1/2 left-1/2 -top-3`}>
      {/* Arrow */}
      <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${arrowColor}`}></div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 flex-shrink-0" />
          <span className="font-semibold text-sm">
            {highlight.type === 'mistake' ? 'Issue' : 
             highlight.type === 'suggestion' ? 'Suggestion' : 'Feedback'}
          </span>
          <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full font-medium">
            {highlight.category}
          </span>
        </div>
        
        <p className="text-sm leading-relaxed">{highlight.description}</p>
        
        {highlight.suggestion && (
          <div className="bg-white bg-opacity-60 rounded-lg p-3 border-l-3 border-blue-400">
            <p className="text-sm font-semibold mb-1 text-blue-800">Suggestion:</p>
            <p className="text-sm font-medium text-blue-700">"{highlight.suggestion}"</p>
            {highlight.suggestionExplanation && (
              <p className="text-xs text-blue-600 mt-1 italic">{highlight.suggestionExplanation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const getColorForType = (type: string, category: string) => {
  if (type === 'mistake') {
    // Softer red highlighting for mistakes - less harsh
    return 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 hover:border-red-300 underline decoration-red-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
  } else if (type === 'suggestion') {
    // Green highlighting for suggestions - mobile optimized
    return 'bg-green-100 text-green-900 border border-green-400 hover:bg-green-200 hover:border-green-500 underline decoration-green-500 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
  } else if (type === 'inline') {
    // Different colors for each inline feedback category
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('grammar') || categoryLower.includes('grammatical')) {
      return 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 hover:border-red-300 underline decoration-red-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
    } else if (categoryLower.includes('lexical') || categoryLower.includes('vocabulary')) {
      return 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 underline decoration-blue-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
    } else if (categoryLower.includes('coherence') || categoryLower.includes('cohesion')) {
      return 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 underline decoration-purple-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
    } else if (categoryLower.includes('task') || categoryLower.includes('response')) {
      return 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 underline decoration-orange-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
    } else if (categoryLower.includes('clarity') || categoryLower.includes('precision')) {
      return 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
    } else {
      // Default for other categories
      return 'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 underline decoration-gray-300 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
    }
  }
  
  // Default fallback - mobile optimized
  return 'bg-gray-100 text-gray-900 border border-gray-400 hover:bg-gray-200 hover:border-gray-500 underline decoration-gray-500 decoration-2 underline-offset-1 sm:underline-offset-2 cursor-pointer';
};

const getIconForType = (type: string) => {
  return type === 'mistake' ? AlertCircle : Lightbulb;
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'vocabulary': return 'Lexical Resource';
    case 'grammar': return 'Grammar & Accuracy';
    case 'coherence': return 'Coherence & Cohesion';
    case 'task': return 'Task Achievement';
    default: return 'General';
  }
};

export const SuggestionHighlighter: React.FC<SuggestionHighlighterProps> = ({
  text,
  mistakes,
  suggestions,
  inlineFeedback = [],
  className = ''
}) => {
  const [activeHighlight, setActiveHighlight] = useState<SuggestionHighlight | null>(null);
  
  const suggestionHighlights = useMemo(() => {
    const highlights: SuggestionHighlight[] = [];
    
    // Debug: Log the feedback data
    console.log('SuggestionHighlighter Debug:', {
      textLength: text.length,
      mistakesLength: mistakes.length,
      suggestionsLength: suggestions.length,
      inlineFeedbackLength: inlineFeedback.length,
      mistakes,
      suggestions,
      inlineFeedback
    });
    
    // Process inline feedback with sentence-level highlighting
    inlineFeedback.forEach((feedback, index) => {
      console.log(`Processing inline feedback ${index}:`, {
        originalText: feedback.originalText,
        startIndex: feedback.startIndex,
        endIndex: feedback.endIndex,
        category: feedback.category,
        explanation: feedback.explanation
      });
      
      let startIndex = feedback.startIndex;
      let endIndex = feedback.endIndex;
      
      // If indices are not provided, try to find the text position
      if (startIndex === undefined || endIndex === undefined) {
        const position = findTextPosition(text, feedback.originalText);
        if (position) {
          startIndex = position.startIndex;
          endIndex = position.endIndex;
          console.log(`Found text position for feedback ${index}:`, position);
        } else {
          console.warn(`Could not find text position for feedback ${index}:`, feedback.originalText);
          return; // Skip this feedback if we can't find the text
        }
      }
      
      // Validate that the indices are within text bounds
      if (startIndex >= 0 && endIndex <= text.length && startIndex < endIndex) {
        // Categorize the feedback to determine the highlight type
        const feedbackType = categorizeFeedback(feedback);
        
        highlights.push({
          text: feedback.originalText,
          startIndex: startIndex,
          endIndex: endIndex,
          type: feedbackType,
          description: feedback.explanation,
          suggestion: feedback.suggestion,
          suggestionExplanation: feedback.suggestionExplanation,
          category: feedback.category
        });
        console.log(`Added ${feedbackType} highlight for feedback ${index}:`, {
          originalText: feedback.originalText,
          type: feedbackType,
          category: feedback.category
        });
      } else {
        console.warn(`Invalid indices for inline feedback ${index}:`, {
          startIndex: startIndex,
          endIndex: endIndex,
          textLength: text.length
        });
      }
    });
    
    // Process mistakes - these are general feedback items that don't have specific text positions
    // We'll log them for debugging but not create highlights since they don't have positions
    mistakes.forEach((mistake, index) => {
      console.log(`General mistake ${index}:`, mistake);
      // Note: General mistakes are displayed elsewhere in the UI, not as inline highlights
    });
    
    // Process suggestions - these are general feedback items that don't have specific text positions
    // We'll log them for debugging but not create highlights since they don't have positions
    suggestions.forEach((suggestion, index) => {
      console.log(`General suggestion ${index}:`, suggestion);
      // Note: General suggestions are displayed elsewhere in the UI, not as inline highlights
    });
    
    console.log('Final highlights:', highlights);
    console.log('Number of highlights created:', highlights.length);
    
    // Sort by start index
    return highlights.sort((a, b) => a.startIndex - b.startIndex);
  }, [text, mistakes, suggestions, inlineFeedback]);

  // Only show highlights if we have inline feedback with specific positions
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

      // Add the highlighted suggestion/error
      const colorClasses = getColorForType(highlight.type, highlight.category);
      
      console.log(`Rendering highlight ${index}:`, {
        text: highlight.text,
        type: highlight.type,
        category: highlight.category,
        colorClasses: colorClasses
      });
      
      parts.push(
        <span
          key={`highlight-${index}`}
          className={`
            ${colorClasses} rounded px-1.5 py-0.5
            transition-all duration-300 ease-in-out text-sm font-medium
            relative cursor-pointer
            ${activeHighlight === highlight ? 'shadow-lg scale-105 z-10' : 'hover:shadow-md hover:scale-102'}
          `}
          onMouseEnter={() => handleMouseEnter(highlight)}
          onMouseLeave={handleMouseLeave}
        >
          {highlight.text}
          {activeHighlight === highlight && (
            <SimpleTooltip highlight={highlight} isVisible={true} />
          )}
        </span>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text after the last highlight
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
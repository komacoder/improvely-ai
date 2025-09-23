import React, { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface SuggestionHighlight {
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'mistake' | 'suggestion';
  description: string;
  suggestion?: string;
  category: 'vocabulary' | 'grammar' | 'coherence' | 'task';
}

interface InlineFeedback {
  originalText: string;
  startIndex: number;
  endIndex: number;
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

/**
 * AI-powered suggestion highlighting that uses ONLY backend AI feedback with exact indices
 * No hardcoded patterns - everything comes from AI analysis with precise positioning
 */

const getColorForType = (type: string, category: string) => {
  if (type === 'mistake') {
    switch (category) {
      case 'vocabulary': return 'bg-red-100 text-red-900 border-red-400 hover:bg-red-200 hover:border-red-500 underline decoration-red-500 decoration-2 underline-offset-2';
      case 'grammar': return 'bg-red-100 text-red-900 border-red-400 hover:bg-red-200 hover:border-red-500 underline decoration-red-500 decoration-2 underline-offset-2';
      case 'coherence': return 'bg-red-100 text-red-900 border-red-400 hover:bg-red-200 hover:border-red-500 underline decoration-red-500 decoration-2 underline-offset-2';
      case 'task': return 'bg-red-100 text-red-900 border-red-400 hover:bg-red-200 hover:border-red-500 underline decoration-red-500 decoration-2 underline-offset-2';
      default: return 'bg-red-100 text-red-900 border-red-400 hover:bg-red-200 hover:border-red-500 underline decoration-red-500 decoration-2 underline-offset-2';
    }
  } else {
    // Positive suggestions with different colors
    switch (category) {
      case 'coherence': return 'bg-blue-200 text-blue-900 border-blue-500 hover:bg-blue-300 hover:border-blue-600 underline decoration-blue-600 decoration-2 underline-offset-2';
      case 'vocabulary': return 'bg-purple-200 text-purple-900 border-purple-500 hover:bg-purple-300 hover:border-purple-600 underline decoration-purple-600 decoration-2 underline-offset-2';
      case 'grammar': return 'bg-green-200 text-green-900 border-green-500 hover:bg-green-300 hover:border-green-600 underline decoration-green-600 decoration-2 underline-offset-2';
      case 'task': return 'bg-indigo-200 text-indigo-900 border-indigo-500 hover:bg-indigo-300 hover:border-indigo-600 underline decoration-indigo-600 decoration-2 underline-offset-2';
      default: return 'bg-purple-200 text-purple-900 border-purple-500 hover:bg-purple-300 hover:border-purple-600 underline decoration-purple-600 decoration-2 underline-offset-2';
    }
  }
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
  const [hoveredHighlight, setHoveredHighlight] = useState<SuggestionHighlight | null>(null);
  
  const suggestionHighlights = useMemo(() => {
    const highlights: SuggestionHighlight[] = [];
    
    // Debug: Log the inline feedback data
    console.log('SuggestionHighlighter Debug:', {
      textLength: text.length,
      inlineFeedbackLength: inlineFeedback.length,
      inlineFeedback: inlineFeedback
    });
    
    // Use ONLY inline feedback with exact indices from AI
    inlineFeedback.forEach((feedback, index) => {
      console.log(`Processing feedback ${index}:`, {
        originalText: feedback.originalText,
        startIndex: feedback.startIndex,
        endIndex: feedback.endIndex,
        category: feedback.category,
        explanation: feedback.explanation
      });
      
      // Validate that the indices are within text bounds
      if (feedback.startIndex >= 0 && feedback.endIndex <= text.length && feedback.startIndex < feedback.endIndex) {
        highlights.push({
          text: feedback.originalText,
          startIndex: feedback.startIndex,
          endIndex: feedback.endIndex,
          type: 'suggestion',
          description: feedback.explanation,
          suggestion: feedback.suggestion,
          category: feedback.category as 'vocabulary' | 'grammar' | 'coherence' | 'task'
        });
        console.log(`Added highlight for feedback ${index}`);
      } else {
        console.warn(`Invalid indices for feedback ${index}:`, {
          startIndex: feedback.startIndex,
          endIndex: feedback.endIndex,
          textLength: text.length
        });
      }
    });
    
    console.log('Final highlights:', highlights);
    
    // Sort by start index
    return highlights.sort((a, b) => a.startIndex - b.startIndex);
  }, [text, inlineFeedback]);

  if (suggestionHighlights.length === 0) {
    return <span className={className}>{text}</span>;
  }

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
      const IconComponent = getIconForType(highlight.type);
      const colorClasses = getColorForType(highlight.type, highlight.category);
      const categoryLabel = getCategoryLabel(highlight.category);
      
      parts.push(
        <TooltipProvider key={`highlight-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  ${colorClasses} border rounded px-1.5 py-0.5 cursor-help
                  transition-all duration-200 text-sm font-medium
                  ${hoveredHighlight === highlight ? 'shadow-lg scale-105' : 'hover:shadow-md'}
                `}
                onMouseEnter={() => setHoveredHighlight(highlight)}
                onMouseLeave={() => setHoveredHighlight(null)}
              >
                {highlight.text}
              </span>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className={`max-w-sm p-3 bg-white border shadow-lg z-50 rounded-lg ${
                highlight.type === 'mistake' 
                  ? 'border-red-200' 
                  : 'border-blue-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${
                    highlight.type === 'mistake' 
                      ? 'text-red-500' 
                      : 'text-blue-500'
                  }`} />
                  <span className={`font-semibold text-sm ${
                    highlight.type === 'mistake' 
                      ? 'text-red-800' 
                      : 'text-blue-800'
                  }`}>
                    {highlight.type === 'mistake' ? 'AI Detected Issue' : 'AI Suggestion'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    highlight.type === 'mistake' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {categoryLabel}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700">
                  {highlight.description}
                </p>
                
                {highlight.suggestion && (
                  <div className={`p-2 rounded border-l-2 ${
                    highlight.type === 'mistake' 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-blue-50 border-blue-300'
                  }`}>
                    <div className="flex items-center gap-1 mb-1">
                      <Lightbulb className={`h-3 w-3 ${
                        highlight.type === 'mistake' 
                          ? 'text-yellow-600' 
                          : 'text-blue-600'
                      }`} />
                      <p className={`text-xs font-medium ${
                        highlight.type === 'mistake' 
                          ? 'text-red-700' 
                          : 'text-blue-700'
                      }`}>
                        {highlight.type === 'mistake' ? 'AI Recommendation:' : 'Why this is good:'}
                      </p>
                    </div>
                    <p className={`text-xs ${
                      highlight.type === 'mistake' 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>{highlight.suggestion}</p>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
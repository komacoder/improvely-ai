import React, { useMemo, memo } from 'react';
import { parseSentences } from '@/lib/sentenceUtils';
import { SentenceWrapper } from './SentenceWrapper';
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

interface SentenceTextProps {
  text: string;
  paragraphId: string;
  activeSentenceId: string | null;
  onSentenceHover: (sentenceId: string | null) => void;
  onSentenceFocus: (sentenceId: string | null) => void;
  className?: string;
  inlineFeedback?: InlineFeedback[];
  improvedTextsnippets?: InlineFeedback[];
  showErrors?: boolean;
}

export const SentenceText: React.FC<SentenceTextProps> = memo(({
  text,
  paragraphId,
  activeSentenceId,
  onSentenceHover,
  onSentenceFocus,
  className = '',
  inlineFeedback = [],
  improvedTextsnippets = [],
  showErrors = false
}) => {
  // For highlighting functionality, we don't need to parse sentences
  // Just render the text with highlighting directly
  if (showErrors && (inlineFeedback.length > 0 || improvedTextsnippets.length > 0)) {
    return (
      <span className={className}>
        <SuggestionHighlighter
          text={text}
          inlineFeedback={inlineFeedback}
          improvedTextsnippets={improvedTextsnippets}
        />
      </span>
    );
  }
  
  return <span className={className}>{text}</span>;
});
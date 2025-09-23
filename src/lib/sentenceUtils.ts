/**
 * Utility functions for sentence parsing and highlighting
 */

export interface Sentence {
  id: string;
  text: string;
  index: number;
}

/**
 * Parse text into individual sentences
 * Splits on periods, question marks, and exclamation marks
 */
export const parseSentences = (text: string): Sentence[] => {
  if (!text || typeof text !== 'string') return [];
  
  const sentenceRegex = /[.!?]+/g;
  const sentences: Sentence[] = [];
  let lastIndex = 0;
  let match;
  let sentenceIndex = 0;
  
  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentenceText = text.slice(lastIndex, match.index + match[0].length).trim();
    if (sentenceText) {
      sentences.push({
        id: `sentence-${sentenceIndex}`,
        text: sentenceText,
        index: sentenceIndex
      });
      sentenceIndex++;
    }
    lastIndex = match.index + match[0].length;
  }
  
  const remainingText = text.slice(lastIndex).trim();
  if (remainingText) {
    sentences.push({
      id: `sentence-${sentenceIndex}`,
      text: remainingText,
      index: sentenceIndex
    });
  }
  
  if (sentences.length === 0 && text.trim()) {
    sentences.push({
      id: 'sentence-0',
      text: text.trim(),
      index: 0
    });
  }
  
  return sentences;
};

/**
 * Create a mapping between sentences in original and improved text
 * Maps sentences by their position/index within the paragraph
 */
export const createSentenceMapping = (
  originalSentences: Sentence[],
  improvedSentences: Sentence[]
): Map<string, string> => {
  const mapping = new Map<string, string>();
  
  const maxLength = Math.max(originalSentences.length, improvedSentences.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originalSentence = originalSentences[i];
    const improvedSentence = improvedSentences[i];
    
    if (originalSentence && improvedSentence) {
      mapping.set(originalSentence.id, improvedSentence.id);
      mapping.set(improvedSentence.id, originalSentence.id);
    }
  }
  
  return mapping;
};

/**
 * Get the corresponding sentence ID for cross-panel highlighting
 * This function maps sentences by their position (index) within the same paragraph type
 */
export const getCorrespondingSentenceId = (
  sentenceId: string,
  paragraphId: string,
  isOriginal: boolean
): string | null => {
  const sentenceIndex = extractSentenceIndex(sentenceId);
  if (sentenceIndex === -1) return null;
  
  const targetType = isOriginal ? 'improved' : 'original';
  
  let paragraphType = '';
  let bodyNumber = '';
  
  if (paragraphId.includes('intro')) {
    paragraphType = 'intro';
  } else if (paragraphId.includes('conclusion')) {
    paragraphType = 'conclusion';
  } else if (paragraphId.includes('body')) {
    paragraphType = 'body';
    const bodyMatch = paragraphId.match(/body-(\d+)/);
    bodyNumber = bodyMatch ? bodyMatch[1] : '';
  }
  
  const targetParagraphId = `${targetType}-${paragraphType}${bodyNumber}`;
  return `${targetParagraphId}-sentence-${sentenceIndex}`;
};

/**
 * Extract sentence index from sentence ID
 */
const extractSentenceIndex = (sentenceId: string): number => {
  const match = sentenceId.match(/sentence-(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
};

/**
 * Color palette for sentence highlighting
 * Each sentence position gets a unique color
 */
const SENTENCE_COLORS = [
  {
    base: 'bg-gray-50 hover:bg-blue-100 text-gray-700',
    active: 'bg-blue-100 text-blue-900',
    highlight: 'bg-blue-200 text-blue-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-green-100 text-gray-700',
    active: 'bg-green-100 text-green-900',
    highlight: 'bg-green-200 text-green-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-yellow-100 text-gray-700',
    active: 'bg-yellow-100 text-yellow-900',
    highlight: 'bg-yellow-200 text-yellow-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-purple-100 text-gray-700',
    active: 'bg-purple-100 text-purple-900',
    highlight: 'bg-purple-200 text-purple-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-pink-100 text-gray-700',
    active: 'bg-pink-100 text-pink-900',
    highlight: 'bg-pink-200 text-pink-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-indigo-100 text-gray-700',
    active: 'bg-indigo-100 text-indigo-900',
    highlight: 'bg-indigo-200 text-indigo-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-orange-100 text-gray-700',
    active: 'bg-orange-100 text-orange-900',
    highlight: 'bg-orange-200 text-orange-900 shadow-md'
  },
  {
    base: 'bg-gray-50 hover:bg-teal-100 text-gray-700',
    active: 'bg-teal-100 text-teal-900',
    highlight: 'bg-teal-200 text-teal-900 shadow-md'
  }
];

/**
 * Generate sentence colors for highlighting based on sentence position
 * Each sentence position gets a unique color that matches across original and improved versions
 */
export const getSentenceColors = (index: number): string => {
  const colorSet = SENTENCE_COLORS[index % SENTENCE_COLORS.length];
  return colorSet.base;
};

/**
 * Get highlight color for active sentence based on sentence position
 * Each sentence position gets a unique active color
 */
export const getActiveSentenceColor = (index: number): string => {
  const colorSet = SENTENCE_COLORS[index % SENTENCE_COLORS.length];
  return colorSet.active;
};

/**
 * Get highlight color for cross-panel highlighting based on sentence position
 * This is used when hovering over a sentence to highlight corresponding sentences
 */
export const getHighlightColor = (index: number): string => {
  const colorSet = SENTENCE_COLORS[index % SENTENCE_COLORS.length];
  return colorSet.highlight;
};

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Copy,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  Target,
  Link,
  PenTool,
  BookMarked,
  DownloadIcon,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Submission } from '@/modules/essay/types/Submission';
import { SentenceText } from './SentenceText';

interface InlineFeedback {
  originalText: string;
  startIndex: number;
  endIndex: number;
  category: string;
  explanation: string;
  suggestion: string;
  suggestionExplanation: string;
}

interface AnalysisOptions {
  colorAlignment: boolean;
  showExplanations: boolean;
  minimalEdits: boolean;
}

interface EssayResultsProps {
  latestSubmission: Submission;
  bandVersions: BandVersion[];
  selectedBand: number;
  setSelectedBand: (band: number) => void;
  hoveredSentence: string | null;
  setHoveredSentence: (sentence: string | null) => void;
  expandedCriteria: string | null;
  setExpandedCriteria: (criteria: string | null) => void;
  options: AnalysisOptions;
  setOptions: (options: AnalysisOptions) => void;
  // New loading state props
  isFeedbackLoading?: boolean;
  isImprovedVersionsLoading?: boolean;
}

interface ParagraphMap {
  original: string;
  improved: string;
  color: string;
  id: string;
}

interface BandVersion {
  band: number;
  sections: {
    introduction: string;
    body: string[];
    conclusion: string;
  };
  improvements: string[];
  paragraphs: ParagraphMap[];
}

const EssayResults = ({
  latestSubmission,
  bandVersions,
  selectedBand,
  setSelectedBand,
  hoveredSentence,
  setHoveredSentence,
  expandedCriteria,
  setExpandedCriteria,
  options,
  setOptions,
  isFeedbackLoading = false,
  isImprovedVersionsLoading = false,
}: EssayResultsProps) => {
  const { toast } = useToast();

  const originalSplitted = useMemo(() => {
    if (!latestSubmission?.body) return [];
    return latestSubmission.body.split('\n').filter(Boolean);
  }, [latestSubmission?.body]);

  const selectedVersion = useMemo(() => {
    console.log('EssayResults - bandVersions:', bandVersions);
    console.log('EssayResults - selectedBand:', selectedBand);
    const version = bandVersions.find(v => v.band === selectedBand);
    console.log('EssayResults - selectedVersion:', version);
    return version;
  }, [bandVersions, selectedBand]);

  const countWords = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Text has been copied to your clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Failed to copy',
        description: 'Could not copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const generatePDF = () => {
    if (!selectedVersion) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    let yPosition = 20;

    const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }

      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.4;
      });
      yPosition += 5;
    };

    addWrappedText(`Band ${selectedVersion.band} Improved Version:`, 14, true);
    addWrappedText(selectedVersion.sections.introduction, 12);
    addWrappedText('', 12);
    selectedVersion.sections.body.forEach((paragraph, index) => {
      addWrappedText(`Body Paragraph ${index + 1}:`, 12, true);
      addWrappedText(paragraph, 12);
      addWrappedText('', 12);
    });
    if (selectedVersion.sections.conclusion) {
      addWrappedText('Conclusion:', 12, true);
      addWrappedText(selectedVersion.sections.conclusion, 12);
    }

    doc.save(`band-${selectedVersion.band}-improved-version.pdf`);
  };

  const formatImprovedText = (text: string) => {
    return text;
  };

  // Get real textsnippet data from the improved version
  const getImprovedTextsnippets = (text: string): InlineFeedback[] => {
    if (!selectedVersion) return [];
    
    // Get the improved version data from the submission
    const improvedVersionData = latestSubmission?.improvedVersion?.[`band${selectedBand}` as keyof typeof latestSubmission.improvedVersion];
    
    if (!improvedVersionData?.inlineFeedback || !Array.isArray(improvedVersionData.inlineFeedback)) {
      console.log('No inlineFeedback data found for band', selectedBand);
      return [];
    }
    
    // Convert the API format to our InlineFeedback format
    const textsnippets: InlineFeedback[] = improvedVersionData.inlineFeedback
      .filter(feedback => feedback && feedback.textsnippet) // Filter out invalid feedback objects
      .map((feedback, index) => {
        const textsnippet = feedback.textsnippet;
        const startIndex = text.indexOf(textsnippet);
        const endIndex = startIndex + textsnippet.length;
        
        return {
          originalText: textsnippet,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex: startIndex >= 0 ? endIndex : textsnippet.length,
          category: feedback.category || 'General',
          explanation: feedback.explanation || '',
          suggestion: '', // API doesn't provide suggestions for improved versions
          suggestionExplanation: ''
        };
      })
      .filter(snippet => snippet.startIndex >= 0); // Only include snippets that were found in the text
    
    console.log(`Textsnippets for band ${selectedBand}:`, textsnippets.length);
    textsnippets.forEach((snippet, index) => {
      console.log(`Snippet ${index}:`, snippet.originalText, 'at position', snippet.startIndex);
    });
    
    return textsnippets;
  };

  const getIELTSCriteria = (band: number) => {
    const criteria = {
      taskAchievement: '',
      coherenceCohesion: '',
      lexicalResource: '',
      grammaticalRange: '',
    };

    switch (band) {
      case 7:
        criteria.taskAchievement = 'Addresses all parts of the task with clear position and relevant ideas';
        criteria.coherenceCohesion = 'Uses a range of cohesive devices appropriately with clear progression';
        criteria.lexicalResource = 'Uses sufficient range of vocabulary with some flexibility and precision';
        criteria.grammaticalRange = 'Uses a variety of complex structures with some errors';
        break;
      case 8:
        criteria.taskAchievement = 'Fully addresses all parts of the task with clear, well-developed ideas';
        criteria.coherenceCohesion = 'Sequences information and ideas logically with clear progression';
        criteria.lexicalResource = 'Uses wide range of vocabulary fluently and flexibly';
        criteria.grammaticalRange = 'Uses wide range of structures with flexibility and accuracy';
        break;
      case 9:
        criteria.taskAchievement = 'Fully addresses all parts of the task with clear, well-developed ideas';
        criteria.coherenceCohesion = 'Uses cohesion in such a way that it attracts no attention';
        criteria.lexicalResource = 'Uses wide range of vocabulary with natural and sophisticated control';
        criteria.grammaticalRange = 'Uses wide range of structures with full flexibility and accuracy';
        break;
    }

    return criteria;
  };

  const LoadingSection = ({ title, description }: { title: string; description: string }) => (
    <div className="text-center text-muted-foreground py-8">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen px-1 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-4 space-y-3 sm:space-y-4 md:space-y-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 items-start">
        {/* Left Column - Original Essay + Mistakes and Suggestions */}
        <div className="space-y-4">
          {/* Original Essay */}
          <Card className="shadow-medium">
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">Original Essay</h3>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-1.5 py-0.5 text-xs sm:px-2 sm:py-1">
                      {countWords(latestSubmission.body)} words
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200 px-1.5 py-0.5 text-xs sm:px-2 sm:py-1 md:px-4 md:py-[6px] font-semibold sm:text-sm md:text-base">
                      {latestSubmission.score.toFixed(1)} Band
                    </Badge>
                  </div>
                </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50/50 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-2 mb-2">
                    <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Introduction</h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded self-start sm:self-auto">
                      {countWords(originalSplitted[0] || '')} words
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <SentenceText
                      text={originalSplitted[0] || 'No introduction found'}
                      paragraphId="original-intro"
                      activeSentenceId={hoveredSentence}
                      onSentenceHover={setHoveredSentence}
                      onSentenceFocus={setHoveredSentence}
                      inlineFeedback={latestSubmission?.aiFeedback?.inlineFeedback || []}
                      showErrors={true}
                    />
                  </div>
                </div>
                <Separator />
                {originalSplitted.slice(1, -1).map((paragraph, index) => (
                  <div key={index}>
                    <div
                      className={`p-4 rounded-lg text-sm ${
                        index === 0 
                          ? 'bg-green-50/50' 
                          : index === 1 
                          ? 'bg-yellow-50/50'
                          : index === 2 
                          ? 'bg-purple-50/50'
                          : 'bg-red-50/50'
                      }`}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-2 mb-2">
                        <h4 className={`font-semibold text-sm sm:text-base ${
                          index === 0 
                            ? 'text-green-800' 
                            : index === 1 
                            ? 'text-yellow-800'
                            : index === 2 
                            ? 'text-purple-800'
                            : 'text-red-800'
                        }`}>
                          Body Paragraph {index + 1}
                        </h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded self-start sm:self-auto ${
                          index === 0 
                            ? 'text-green-600 bg-green-100' 
                            : index === 1 
                            ? 'text-yellow-600 bg-yellow-100'
                            : index === 2 
                            ? 'text-purple-600 bg-purple-100'
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {countWords(paragraph || '')} words
                        </span>
                      </div>
                      <div className="text-gray-700">
                        <SentenceText
                          text={paragraph || `No body paragraph ${index + 1} found`}
                          paragraphId={`original-body-${index + 1}`}
                          activeSentenceId={hoveredSentence}
                          onSentenceHover={setHoveredSentence}
                          onSentenceFocus={setHoveredSentence}
                          inlineFeedback={latestSubmission?.aiFeedback?.inlineFeedback?.map(feedback => ({
                            originalText: feedback.originalText,
                            category: feedback.category,
                            explanation: feedback.explanation,
                            suggestion: feedback.suggestion,
                            suggestionExplanation: feedback.suggestionExplanation
                          })) || []}
                          showErrors={true}
                        />
                      </div>
                    </div>
                    {index < originalSplitted.slice(1, -1).length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
                {originalSplitted.length > 1 && (
                  <>
                    <Separator />
                    <div className="p-4 rounded-lg bg-green-50/50 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-2 mb-2">
                        <h4 className="font-semibold text-green-800 text-sm sm:text-base">Conclusion</h4>
                        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded self-start sm:self-auto">
                          {countWords(originalSplitted[originalSplitted.length - 1] || '')} words
                        </span>
                      </div>
                      <div className="text-gray-700">
                        <SentenceText
                          text={originalSplitted[originalSplitted.length - 1] || 'No conclusion found'}
                          paragraphId="original-conclusion"
                          activeSentenceId={hoveredSentence}
                          onSentenceHover={setHoveredSentence}
                          onSentenceFocus={setHoveredSentence}
                          inlineFeedback={latestSubmission?.aiFeedback?.inlineFeedback?.map(feedback => ({
                            originalText: feedback.originalText,
                            category: feedback.category,
                            explanation: feedback.explanation,
                            suggestion: feedback.suggestion,
                            suggestionExplanation: feedback.suggestionExplanation
                          })) || []}
                          showErrors={true}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {[
                {
                  key: 'taskAchievement',
                  label: 'Task Achievement',
                  icon: Target,
                  scoreKey: 'taskResponse',
                },
                {
                  key: 'coherenceCohesion',
                  label: 'Coherence & Cohesion',
                  icon: Link,
                  scoreKey: 'coherence',
                },
                {
                  key: 'lexicalResource',
                  label: 'Lexical Resource',
                  icon: BookMarked,
                  scoreKey: 'lexical',
                },
                {
                  key: 'grammaticalRange',
                  label: 'Grammar & Accuracy',
                  icon: PenTool,
                  scoreKey: 'grammar',
                },
              ].map(({ key, label, icon: Icon, scoreKey }) => {
                const score = latestSubmission?.criteriaScores?.[
                  scoreKey as keyof typeof latestSubmission.criteriaScores
                ];

                return (
                  <Collapsible key={key}>
                    <CollapsibleTrigger
                      className="w-full"
                      onClick={() =>
                        setExpandedCriteria(expandedCriteria === key ? null : key)
                      }
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs h-auto py-2 px-3"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          <span>{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {score && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs">
                              {score.toFixed(1)}
                            </Badge>
                          )}
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${
                              expandedCriteria === key ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="p-3 bg-muted/30 rounded-md text-xs text-muted-foreground">
                        {score ? `Score: ${score.toFixed(1)}/9.0` : 'No score available'}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
              </div>
            </CardContent>
          </Card>

          {/* Mistakes and Suggestions */}
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">Mistakes and Suggestions</h2>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-1.5 py-0.5 text-xs sm:px-2 sm:py-1">
                    {latestSubmission?.aiFeedback?.mistakes?.length || 0} mistakes
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200 px-1.5 py-0.5 text-xs sm:px-2 sm:py-1">
                    {latestSubmission?.aiFeedback?.suggestions?.length || 0} suggestions
                  </Badge>
                </div>
              </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4">
                {latestSubmission?.aiFeedback?.mistakes && latestSubmission.aiFeedback.mistakes.length > 0 && (
                  <div className="p-4 rounded-lg bg-red-50/50 text-sm">
                    <h4 className="font-semibold mb-2 text-red-800">Mistakes Found</h4>
                    <ul className="space-y-2 text-gray-700">
                      {latestSubmission.aiFeedback.mistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {latestSubmission?.aiFeedback?.suggestions && latestSubmission.aiFeedback.suggestions.length > 0 && (
                  <div className="p-4 rounded-lg bg-green-50/50 text-sm">
                    <h4 className="font-semibold mb-2 text-green-800">Suggestions</h4>
                    <ul className="space-y-2 text-gray-700">
                      {latestSubmission.aiFeedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Improved Version */}
        <div className="space-y-4">
          {isImprovedVersionsLoading ? (
            <>
              {/* First Loading Card - Improved Version */}
              <Card className="shadow-medium">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold">Improved Version</h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating improved versions...</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-sm">AI is generating improved versions for different band levels...</p>
                  </div>
                </CardContent>
              </Card>

              {/* Second Loading Card - Mistakes and Suggestions */}
              <Card className="shadow-medium">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold">Mistakes and Suggestions</h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating feedback...</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium mb-2">Generating Feedback</p>
                    <p className="text-xs text-gray-500">Our AI is analyzing your essay for mistakes and suggestions...</p>
                  </div>
                </CardContent>
              </Card>
            </>
        ) : bandVersions.length > 0 && (
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">Improved Version</h2>
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {bandVersions.map(version => (
                    <Button
                      key={version.band}
                      variant={
                        selectedBand === version.band ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setSelectedBand(version.band)}
                      className={`text-xs px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 sm:text-sm ${
                        selectedBand === version.band
                          ? version.band === 7
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                            : version.band === 8
                            ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                            : 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                          : ''
                      }`}
                    >
                      Band {version.band}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 p-0.5 sm:p-1 md:p-2"
                    onClick={() =>
                      copyToClipboard(
                        selectedVersion?.sections
                          ? [
                              selectedVersion.sections.introduction,
                              ...selectedVersion.sections.body,
                              ...(selectedVersion.sections.conclusion
                                ? [selectedVersion.sections.conclusion]
                                : []),
                            ].join('\n\n')
                          : ''
                      )
                    }
                    title="Copy improved version"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 p-0.5 sm:p-1 md:p-2"
                    onClick={generatePDF}
                  >
                    <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                {selectedVersion && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-blue-50/50 text-sm">
                        <h4 className="font-semibold mb-2 text-blue-800">Introduction</h4>
                        <div className="text-gray-700">
                          <SentenceText
                            text={formatImprovedText(selectedVersion.sections.introduction)}
                            paragraphId="improved-intro"
                            activeSentenceId={hoveredSentence}
                            onSentenceHover={setHoveredSentence}
                            onSentenceFocus={setHoveredSentence}
                            improvedTextsnippets={getImprovedTextsnippets(selectedVersion.sections.introduction)}
                            showErrors={true}
                          />
                        </div>
                      </div>
                      <Separator />
                      {selectedVersion.sections.body.map(
                        (bodyParagraph, index) => (
                          <div key={index}>
                            <div
                              className={`p-4 rounded-lg text-sm ${
                                index === 0 
                                  ? 'bg-green-50/50' 
                                  : index === 1 
                                  ? 'bg-yellow-50/50'
                                  : index === 2 
                                  ? 'bg-purple-50/50'
                                  : 'bg-red-50/50'
                              }`}
                            >
                              <h4 className={`font-semibold mb-2 ${
                                index === 0 
                                  ? 'text-green-800' 
                                  : index === 1 
                                  ? 'text-yellow-800'
                                  : index === 2 
                                  ? 'text-purple-800'
                                  : 'text-red-800'
                              }`}>
                                Body Paragraph {index + 1}
                              </h4>
                              <div className="text-gray-700">
                                <SentenceText
                                  text={formatImprovedText(bodyParagraph)}
                                  paragraphId={`improved-body-${index + 1}`}
                                  activeSentenceId={hoveredSentence}
                                  onSentenceHover={setHoveredSentence}
                                  onSentenceFocus={setHoveredSentence}
                                  improvedTextsnippets={getImprovedTextsnippets(bodyParagraph)}
                                  showErrors={true}
                                />
                              </div>
                            </div>
                            {index < selectedVersion.sections.body.length - 1 && (
                              <Separator />
                            )}
                          </div>
                        )
                      )}
                      {selectedVersion.sections.conclusion && (
                        <>
                          <Separator />
                          <div className="p-4 rounded-lg bg-green-50/50 text-sm">
                            <h4 className="font-semibold mb-2 text-green-800">Conclusion</h4>
                            <div className="text-gray-700">
                              <SentenceText
                                text={formatImprovedText(selectedVersion.sections.conclusion)}
                                paragraphId="improved-conclusion"
                                activeSentenceId={hoveredSentence}
                                onSentenceHover={setHoveredSentence}
                                onSentenceFocus={setHoveredSentence}
                                improvedTextsnippets={getImprovedTextsnippets(selectedVersion.sections.conclusion)}
                                showErrors={true}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        Band {selectedVersion.band} IELTS Criteria Analysis
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          {
                            key: 'taskAchievement',
                            label: 'Task Achievement',
                            icon: Target,
                            scoreKey: 'taskResponse',
                          },
                          {
                            key: 'coherenceCohesion',
                            label: 'Coherence & Cohesion',
                            icon: Link,
                            scoreKey: 'coherence',
                          },
                          {
                            key: 'lexicalResource',
                            label: 'Lexical Resource',
                            icon: BookMarked,
                            scoreKey: 'lexical',
                          },
                          {
                            key: 'grammaticalRange',
                            label: 'Grammar & Accuracy',
                            icon: PenTool,
                            scoreKey: 'grammar',
                          },
                        ].map(({ key, label, icon: Icon, scoreKey }) => {
                          const criteria = getIELTSCriteria(selectedVersion.band);
                          const isExpanded = expandedCriteria === key;
                          const score =
                            latestSubmission?.criteriaScores?.[
                              scoreKey as keyof typeof latestSubmission.criteriaScores
                            ];

                          return (
                            <Collapsible key={key}>
                              <CollapsibleTrigger
                                className="w-full"
                                onClick={() =>
                                  setExpandedCriteria(isExpanded ? null : key)
                                }
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-between text-xs h-auto py-2 px-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3 w-3" />
                                    <span>{label}</span>
                                  </div>
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2">
                                <div className="p-3 bg-muted/30 rounded-md text-xs text-muted-foreground">
                                  {criteria[key as keyof typeof criteria]}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </div>

                    {options.showExplanations && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Lightbulb className="h-4 w-4 text-accent" />
                          Key Improvements Made
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedVersion.improvements.map(
                            (improvement, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                                {improvement}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export { EssayResults };
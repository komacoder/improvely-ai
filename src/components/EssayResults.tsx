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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Submission } from '@/modules/essay/types/Submission';
import { SentenceText } from './SentenceText';

interface AnalysisOptions {
  colorAlignment: boolean;
  showExplanations: boolean;
  minimalEdits: boolean;
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
  paragraphs: string[] | ParagraphMap[];
}

interface EssayResultsProps {
  latestSubmission: Submission;
  bandVersions: BandVersion[];
  selectedBand: number;
  setSelectedBand: (band: number) => void;
  hoveredSentence: string | null;
  setHoveredSentence: (id: string | null) => void;
  expandedCriteria: string | null;
  setExpandedCriteria: (criteria: string | null) => void;
  options: AnalysisOptions;
  setOptions: (options: AnalysisOptions) => void;
}

// Dynamic sentence colors based on AI analysis
const getSentenceColors = (sentenceIndex: number, hasErrors: boolean, hasSuggestions: boolean) => {
  const baseColors = [
    'bg-blue-200 text-blue-900 shadow-sm',
    'bg-green-200 text-green-900 shadow-sm',
    'bg-yellow-200 text-yellow-900 shadow-sm',
    'bg-purple-200 text-purple-900 shadow-sm',
    'bg-pink-200 text-pink-900 shadow-sm',
    'bg-indigo-200 text-indigo-900 shadow-sm',
    'bg-orange-200 text-orange-900 shadow-sm',
    'bg-teal-200 text-teal-900 shadow-sm',
  ];
  
  if (hasErrors) {
    return 'bg-red-50 text-red-800 shadow-sm';
  }
  
  if (hasSuggestions) {
    return 'bg-green-100 text-green-900 shadow-sm';
  }
  
  return baseColors[sentenceIndex % baseColors.length];
};

const formatImprovedText = (text: string) => {
  if (!text) return '';
  
  // Check if this is a placeholder or generic response from AI
  const isPlaceholder = text.includes('This introduction demonstrates') || 
                       text.includes('This paragraph showcases') || 
                       text.includes('This paragraph demonstrates') || 
                       text.includes('This conclusion provides') ||
                       text.includes('Content will be generated') ||
                       text.trim().length < 10;
  
  if (isPlaceholder) {
    return 'AI is generating improved content for this section...';
  }
  
  return text;
};

// Dynamic IELTS criteria based on AI analysis and user's actual performance
const getIELTSCriteria = (band: number, userScores?: any) => {
  // Base criteria structure - can be enhanced with AI-generated personalized feedback
  const baseCriteria = {
    7: {
      taskAchievement:
        'Addresses all parts of the task with clear positions and relevant examples. Ideas are developed and supported, though some may lack full development.',
      coherenceCohesion:
        'Logically organizes information with clear progression. Uses cohesive devices effectively, though sometimes mechanically. Has clear central topic within most paragraphs.',
      lexicalResource:
        'Uses sufficient range of vocabulary with some natural use of less common items. Shows awareness of style and collocation with occasional inappropriacies. Makes some errors in word choice but meaning remains clear.',
      grammaticalRange:
        'Uses variety of complex structures with good control and flexibility. Produces frequent error-free sentences with only occasional errors or inappropriacies.',
    },
    8: {
      taskAchievement:
        'Sufficiently addresses all parts of the task with well-developed response. Presents well-developed position with relevant, extended and supported ideas.',
      coherenceCohesion:
        'Sequences information logically with wide range of cohesive devices used naturally and appropriately. Uses paragraphing sufficiently and appropriately.',
      lexicalResource:
        'Uses wide range of vocabulary naturally and flexibly to convey precise meanings. Uses less common lexical items with awareness of style. Produces rare errors in word choice and collocation.',
      grammaticalRange:
        'Uses wide range of structures with natural flexibility and accuracy. Majority of sentences are error-free with only very occasional inappropriacies.',
    },
    9: {
      taskAchievement:
        'Fully addresses all parts of the task with fully developed position. Presents relevant, fully extended and well-supported ideas throughout.',
      coherenceCohesion:
        'Uses cohesion in such a way that it attracts no attention. Skillfully manages paragraphing with seamless progression throughout.',
      lexicalResource:
        'Uses wide range of vocabulary with very natural and sophisticated control. Uses precise and rare lexical items with complete naturalness and accuracy.',
      grammaticalRange:
        "Uses wide range of structures with full flexibility and accuracy. Rare minor errors occur only as 'slips' in otherwise perfect language.",
    },
  };

  // If user scores are available, add personalized feedback
  if (userScores) {
    const criteria = baseCriteria[band as keyof typeof baseCriteria];
    if (criteria) {
      // Add AI-generated personalized feedback based on user's actual performance
      return {
        ...criteria,
        personalizedFeedback: `Based on your current performance, focus on improving areas where you scored below ${band}.`,
        aiRecommendations: userScores.aiFeedback?.suggestions || []
      };
    }
  }

  return baseCriteria[band as keyof typeof baseCriteria];
};

export const EssayResults = ({
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
}: EssayResultsProps) => {
  const { toast } = useToast();

  const originalSplitted = useMemo(() => {
    if (!latestSubmission?.body) return [];
    return latestSubmission.body.split('\n').filter(Boolean);
  }, [latestSubmission?.body]);

  const selectedVersion = useMemo(() => {
    return bandVersions.find(v => v.band === selectedBand);
  }, [bandVersions, selectedBand]);

  if (!latestSubmission) return null;

  const generatePDF = () => {
    const selectedVersion = bandVersions.find(v => v.band === selectedBand);
    if (!selectedVersion) return;

    const pdf = new jsPDF();
    let yPos = 20;

    const addWrappedText = (text: string, fontSize: number, bold = false) => {
      pdf.setFontSize(fontSize);
      if (bold) pdf.setFont(undefined, 'bold');
      else pdf.setFont(undefined, 'normal');

      const splitText = pdf.splitTextToSize(text, 180);
      pdf.text(splitText, 15, yPos);
      yPos += splitText.length * (fontSize * 0.4) + 5;
    };

    addWrappedText('IELTS Writing Task 2 Analysis', 16, true);
    yPos += 10;

    addWrappedText(
      `Your Current Band Score: ${latestSubmission.score.toFixed(1)}`,
      14,
      true
    );
    yPos += 10;

    addWrappedText(`Band ${selectedVersion.band} Improved Version:`, 14, true);
    yPos += 5;

    addWrappedText('Introduction:', 12, true);
    addWrappedText(selectedVersion.sections.introduction, 12);
    yPos += 5;

    selectedVersion.sections.body.forEach((bodyParagraph, index) => {
      addWrappedText(`Body Paragraph ${index + 1}:`, 12, true);
      addWrappedText(bodyParagraph, 12);
      yPos += 5;
    });

    if (selectedVersion.sections.conclusion) {
      addWrappedText('Conclusion:', 12, true);
      addWrappedText(selectedVersion.sections.conclusion, 12);
      yPos += 5;
    }

    pdf.save(`ielts-essay-analysis-band-${selectedVersion.band}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The improved essay has been copied to your clipboard.',
    });
  };

  return (
    <div className="min-h-screen px-1 sm:px-2 lg:px-4 py-2 space-y-4 sm:space-y-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <Card className="shadow-medium">
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold">Original Essay</h3>
                <Badge className="bg-green-100 text-green-800 border-green-200 px-2 sm:px-4 py-[4px] sm:py-[6px] text-sm sm:text-base font-semibold">
                  {latestSubmission.score.toFixed(1)} Band
                </Badge>
              </div>
              <div className="space-y-4">
                {selectedVersion ? (
                  <>
                    <div className="p-4 rounded-lg bg-blue-50/50 text-sm">
                      <h4 className="font-semibold mb-2 text-blue-800">Introduction</h4>
                      <div className="text-gray-700">
                        <SentenceText
                          text={
                            typeof selectedVersion.paragraphs[0] === 'string'
                              ? (selectedVersion.paragraphs[0] as string)
                              : (selectedVersion.paragraphs[0] as ParagraphMap)
                                  ?.original ||
                                originalSplitted[0] ||
                                'No introduction found'
                          }
                          paragraphId="original-intro"
                          activeSentenceId={hoveredSentence}
                          onSentenceHover={setHoveredSentence}
                          onSentenceFocus={setHoveredSentence}
                          mistakes={latestSubmission?.aiFeedback?.mistakes || []}
                          suggestions={latestSubmission?.aiFeedback?.suggestions || []}
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
                              text={
                                typeof selectedVersion.paragraphs[index + 1] === 'string'
                                  ? (selectedVersion.paragraphs[index + 1] as string)
                                  : (selectedVersion.paragraphs[index + 1] as ParagraphMap)
                                      ?.original || paragraph || `No body paragraph ${index + 1} found`
                              }
                              paragraphId={`original-body-${index + 1}`}
                              activeSentenceId={hoveredSentence}
                              onSentenceHover={setHoveredSentence}
                              onSentenceFocus={setHoveredSentence}
                              mistakes={latestSubmission?.aiFeedback?.mistakes || []}
                              suggestions={latestSubmission?.aiFeedback?.suggestions || []}
                              inlineFeedback={latestSubmission?.aiFeedback?.inlineFeedback || []}
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
                          <h4 className="font-semibold mb-2 text-green-800">Conclusion</h4>
                          <div className="text-gray-700">
                            <SentenceText
                              text={
                                typeof selectedVersion.paragraphs[originalSplitted.length - 1] === 'string'
                                  ? (selectedVersion.paragraphs[originalSplitted.length - 1] as string)
                                  : (selectedVersion.paragraphs[originalSplitted.length - 1] as ParagraphMap)
                                      ?.original || originalSplitted[originalSplitted.length - 1] || 'No conclusion found'
                              }
                              paragraphId="original-conclusion"
                              activeSentenceId={hoveredSentence}
                              onSentenceHover={setHoveredSentence}
                              onSentenceFocus={setHoveredSentence}
                              mistakes={latestSubmission?.aiFeedback?.mistakes || []}
                              suggestions={latestSubmission?.aiFeedback?.suggestions || []}
                              inlineFeedback={latestSubmission?.aiFeedback?.inlineFeedback || []}
                              showErrors={true}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground">
                    {latestSubmission.body}
                  </div>
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
              ].map(({ label, icon: Icon, scoreKey }) => {
                const score =
                  latestSubmission?.criteriaScores?.[
                    scoreKey as keyof typeof latestSubmission.criteriaScores
                  ];

                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </div>
                    <span className="text-xs font-semibold">
                      {score.toFixed(1)}
                    </span>
                  </Button>
                );
              })}
            </div>
            
            {/* Mistakes and Suggestions */}
            {latestSubmission?.aiFeedback && (
              <div className="mt-4 space-y-4">
                {/* Mistakes */}
                {latestSubmission.aiFeedback.mistakes && latestSubmission.aiFeedback.mistakes.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-800">Mistakes ({latestSubmission.aiFeedback.mistakes.length})</span>
                    </div>
                    <ul className="space-y-2 text-sm text-red-700">
                      {latestSubmission.aiFeedback.mistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {latestSubmission.aiFeedback.suggestions && latestSubmission.aiFeedback.suggestions.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Suggestions ({latestSubmission.aiFeedback.suggestions.length})</span>
                    </div>
                    <ul className="space-y-2 text-sm text-green-700">
                      {latestSubmission.aiFeedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center gap-5">
              <h2 className="text-lg sm:text-xl font-semibold">Improved Version</h2>
              <div className="flex gap-2">
                {bandVersions.map(version => (
                  <Button
                    key={version.band}
                    variant={
                      selectedBand === version.band ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedBand(version.band)}
                    className={`text-xs sm:text-sm ${
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
                  className="w-8 h-8 sm:w-9 sm:h-9"
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
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 sm:w-9 sm:h-9"
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
      </div>
    </div>
  );
};

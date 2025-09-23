import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSubmitEssay, useAnalyzeSubmission, useGenerateImprovedVersion, useLatestSubmission, useSubmissionById } from '@/services/essayMutations';
import { SendSubmission } from '@/modules/essay/types/SendSubmission';
import { EssayCreator } from './EssayCreator';
import { EssayResults } from './EssayResults';
import { IELTSWritingSubmissionStatus } from '@/modules/essay/types/Submission';
import {
  getEssayFromStorage,
  clearEssayFromStorage,
  SavedEssayData,
} from '@/lib/essayStorage';
import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { toast } from 'sonner';

interface AnalysisOptions {
  colorAlignment: boolean;
  showExplanations: boolean;
  minimalEdits: boolean;
}

interface UiBandVersion {
  band: number;
  sections: {
    introduction: string;
    body: string[];
    conclusion: string;
  };
  improvements: string[];
  paragraphs: ParagraphMap[];
}

interface ParagraphMap {
  original: string;
  improved: string;
  color: string;
  id: string;
}

interface EssayAnalyzerWrapperProps {
  submissionId?: string | null;
  onScoreUpdate: (band: number | null, hasAnalyzed: boolean) => void;
}

export const EssayAnalyzerWrapper = ({
  submissionId,
  onScoreUpdate,
}: EssayAnalyzerWrapperProps) => {
  const { authenticated } = useAuthContext();
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [currentBand, setCurrentBand] = useState<number | null>(null);
  const [bandVersions, setBandVersions] = useState<UiBandVersion[]>([]);
  const [hoveredSentence, setHoveredSentence] = useState<string | null>(null);
  const [selectedBand, setSelectedBand] = useState<number>(9);
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);
  const [targetScore, setTargetScore] = useState<
    'BAND_SEVEN' | 'BAND_EIGHT' | 'BAND_NINE'
  >('BAND_NINE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isTipVisible, setIsTipVisible] = useState(true);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  // Auto-analysis disabled per requirements. Keep flag removed.

  // Clear any previous results when component mounts (user navigates to the page)
  useEffect(() => {
    clearCurrentResults();
  }, []);

  // Function to clear current results when starting new analysis
const clearCurrentResults = () => {
    setCurrentSubmissionId(null);
    setHasAnalyzed(false);
    setBandVersions([]);
    setCurrentBand(null);
    setIsAnalyzed(false);
    setIsProcessingEssay(false);
    setAnalysisStartTime(null);
    setAnalysisCompleted(false);
    setImprovedVersionCompleted(false);
    onScoreUpdate(null, false);
  };

  // Function to handle essay analysis
  const handleEssayAnalysis = async (submissionData: SendSubmission) => {
    try {
      setIsProcessingEssay(true);
      setAnalysisStartTime(Date.now());
      setAnalysisCompleted(false);
      setImprovedVersionCompleted(false);
      
      // First submit the essay
      const response = await submitEssayMutation.mutateAsync(submissionData);
      
      // Extract submission ID from response
      const submissionId = response?.data?._id ?? response?._id ?? response?.data?.id ?? response?.id;

      if (submissionId) {
        setCurrentSubmissionId(submissionId);
        
        // Add a small delay to ensure submission is fully processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Then trigger analysis
        console.log('Starting analysis for submission ID:', submissionId);
        try {
          await analyzeSubmissionMutation.mutateAsync(submissionId);
          console.log('Analysis completed for submission ID:', submissionId);
          setAnalysisCompleted(true);
        } catch (error) {
          console.error('Analysis failed for submission ID:', submissionId, error);
          throw error;
        }
        
        // Add another small delay before generating improved versions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate improved versions
        console.log('Starting improved version generation for submission ID:', submissionId);
        try {
          await generateImprovedVersionMutation.mutateAsync(submissionId);
          console.log('Improved version generation completed for submission ID:', submissionId);
          setImprovedVersionCompleted(true);
        } catch (error) {
          console.error('Improved version generation failed for submission ID:', submissionId, error);
          // Don't throw here - analysis might have succeeded even if improved version fails
          setImprovedVersionCompleted(true); // Mark as completed even if failed
        }
        
        // Only mark as analyzed when both are completed
        if (analysisCompleted && improvedVersionCompleted) {
          setIsAnalyzed(true);
          // Force a refetch of the submission data
          await refetchSpecificSubmission();
        }
        
        // Don't set isProcessingEssay to false here - let shouldShowProcessing logic handle it
        // based on the actual submission data state
        return submissionId;
      } else {
        console.error('No submission ID found in response:', response);
        throw new Error('No submission ID received');
      }
    } catch (error) {
      console.error('Error analyzing essay:', error);
      setIsProcessingEssay(false);
      setAnalysisStartTime(null); // Clear analysis start time on error
      throw error;
    }
  };

  // Dynamic tips based on AI analysis - no hardcoded tips
  const getDynamicTips = (submission: any) => {
    if (!submission?.aiFeedback) {
      return [
        "AI is analyzing your essay to provide personalized feedback and suggestions.",
        "Our AI will identify specific areas for improvement in your writing.",
        "You'll receive detailed feedback on vocabulary, grammar, coherence, and task achievement."
      ];
    }

    const tips = [];
    const { mistakes, suggestions } = submission.aiFeedback;

    if (mistakes && mistakes.length > 0) {
      tips.push(`AI found ${mistakes.length} areas for improvement in your essay.`);
    }

    if (suggestions && suggestions.length > 0) {
      tips.push(`AI identified ${suggestions.length} positive aspects in your writing.`);
    }

    tips.push("Hover over highlighted text to see detailed AI feedback and suggestions.");
    tips.push("AI analysis covers vocabulary, grammar, coherence, and task achievement.");

    return tips;
  };

  // Use specific submission if provided, otherwise use latest
  const {
    data: specificSubmission,
    isLoading: isLoadingSpecific,
    refetch: refetchSpecificSubmission,
  } = useSubmissionById(submissionId || currentSubmissionId);

  const {
    data: latestSubmission,
    isProcessing,
    isFailed,
    isLoading: submissionsLoading,
    isPendingAnalysed,
  } = useLatestSubmission(authenticated && !submissionId && !currentSubmissionId); // Only fetch latest if no specific submission ID and no current submission

  // Determine which submission to use
  const activeSubmission = (submissionId || currentSubmissionId) ? specificSubmission : latestSubmission;
  
  // If we have a submissionId but specificSubmission is null, we're still loading
  const isWaitingForSpecificSubmission = (submissionId || currentSubmissionId) && !specificSubmission && !isLoadingSpecific;
  
  // Debug logging
  console.log('EssayAnalyzerWrapper Debug:', {
    submissionId,
    currentSubmissionId,
    specificSubmission,
    latestSubmission,
    activeSubmission,
    isLoadingSpecific,
    submissionsLoading
  });

  const dynamicTips = getDynamicTips(activeSubmission);
  const isLoadingSubmission = (submissionId || currentSubmissionId) ? isLoadingSpecific : submissionsLoading;

  const submitEssayMutation = useSubmitEssay();
  const analyzeSubmissionMutation = useAnalyzeSubmission();
  const generateImprovedVersionMutation = useGenerateImprovedVersion();
  
  // Track if we're currently processing an essay
  const [isProcessingEssay, setIsProcessingEssay] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [improvedVersionCompleted, setImprovedVersionCompleted] = useState(false);

  const [options, setOptions] = useState<AnalysisOptions>({
    colorAlignment: true,
    showExplanations: true,
    minimalEdits: false,
  });

  // Auto-analysis after login is disabled; user must click Analyze manually.

  // Determine loading state early for tip rotation
  const shouldShowProcessing = 
    // Show loading when we're processing an essay (immediate feedback)
    isProcessingEssay ||
    // Show loading when mutations are pending
    submitEssayMutation.isPending || 
    analyzeSubmissionMutation.isPending ||
    generateImprovedVersionMutation.isPending ||
    // Show loading when we have a submission that's being processed (but not if it's already analyzed)
    (currentSubmissionId && activeSubmission && 
     !activeSubmission.aiFeedback?.improvedVersions &&
     (activeSubmission.status === IELTSWritingSubmissionStatus.IN_PROGRESS || 
      activeSubmission.status === IELTSWritingSubmissionStatus.IDLE)) ||
    // Show loading when we have a submission but no results yet
    (currentSubmissionId && !activeSubmission) ||
    // Show loading for 300 seconds (5 minutes) after analysis starts, but only if we don't have results yet
    (analysisStartTime && (Date.now() - analysisStartTime) < 300000 && 
     (!activeSubmission?.aiFeedback?.improvedVersions && !activeSubmission?.improvedVersion)) ||
    // Show loading if analysis is completed but improved version is not yet completed
    (analysisCompleted && !improvedVersionCompleted);

  // Debug logging for shouldShowProcessing
  useEffect(() => {
    console.log('shouldShowProcessing:', shouldShowProcessing, {
      isProcessingEssay,
      submitEssayPending: submitEssayMutation.isPending,
      analyzePending: analyzeSubmissionMutation.isPending,
      improvedVersionPending: generateImprovedVersionMutation.isPending,
      hasImprovedVersions: !!activeSubmission?.aiFeedback?.improvedVersions,
      hasImprovedVersion: !!activeSubmission?.improvedVersion,
      analysisStartTime,
      currentSubmissionId,
      activeSubmissionStatus: activeSubmission?.status
    });
  }, [shouldShowProcessing, isProcessingEssay, submitEssayMutation.isPending, analyzeSubmissionMutation.isPending, generateImprovedVersionMutation.isPending, activeSubmission?.aiFeedback?.improvedVersions, activeSubmission?.improvedVersion, analysisStartTime, currentSubmissionId, activeSubmission?.status]);

  // Rotate tips every 4 seconds when processing
  useEffect(() => {
    if (shouldShowProcessing) {
      const interval = setInterval(() => {
        setIsTipVisible(false);
        setTimeout(() => {
          setCurrentTipIndex(prev => (prev + 1) % dynamicTips.length);
          setIsTipVisible(true);
        }, 300);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [dynamicTips.length, shouldShowProcessing]);

  const splitIntoParagraphs = (text: string): string[] => {
    return text.split('\n').filter(paragraph => paragraph.trim().length > 0);
  };

  const createParagraphMapping = useCallback(
    (
      originalText: string,
      improvedSections: {
        introduction: string;
        body_one?: string;
        body_two?: string;
        body?: string[];
        conclusion: string;
      }
    ): ParagraphMap[] => {
      // Dynamic color palette based on AI analysis and content type
      const getSentenceColors = (index: number, hasErrors: boolean, hasSuggestions: boolean) => {
        const baseColors = [
          'bg-blue-100 text-blue-800',
          'bg-green-100 text-green-800',
          'bg-yellow-100 text-yellow-800',
          'bg-purple-100 text-purple-800',
          'bg-pink-100 text-pink-800',
          'bg-indigo-100 text-indigo-800',
          'bg-orange-100 text-orange-800',
          'bg-teal-100 text-teal-800',
        ];
        
        if (hasErrors) {
          return 'bg-red-100 text-red-800';
        }
        
        if (hasSuggestions) {
          return 'bg-green-100 text-green-800';
        }
        
        return baseColors[index % baseColors.length];
      };

      const originalParagraphs = splitIntoParagraphs(originalText);
      
      // Handle both body array format and body_one/body_two format
      const bodyParagraphs = improvedSections.body 
        ? improvedSections.body 
        : [improvedSections.body_one, improvedSections.body_two].filter(Boolean);
      
      const improvedParagraphs = [
        improvedSections.introduction,
        ...bodyParagraphs,
        improvedSections.conclusion,
      ].filter(Boolean);

      const mapping: ParagraphMap[] = [];
      const maxLength = Math.max(
        originalParagraphs.length,
        improvedParagraphs.length
      );

      for (let i = 0; i < maxLength; i++) {
        const id = `paragraph-${i}`;
        mapping.push({
          original: originalParagraphs[i]?.trim() || '',
          improved: improvedParagraphs[i]?.trim() || '',
          color: getSentenceColors(i, false, false),
          id,
        });
      }

      return mapping;
    },
    []
  );

  // Handle latest submission data - only show results for current submission
  useEffect(() => {
    if (activeSubmission && (submissionId || currentSubmissionId)) {
      console.log('Submission data received:', {
        submissionId,
        currentSubmissionId,
        hasImprovedVersions: !!activeSubmission.aiFeedback?.improvedVersions,
        hasImprovedVersion: !!activeSubmission.improvedVersion,
        status: activeSubmission.status,
        score: activeSubmission.score
      });
      
      // If we have improved versions (either from aiFeedback or separate improvedVersion), show the analysis
      if (activeSubmission.aiFeedback?.improvedVersions || activeSubmission.improvedVersion) {
        console.log('Results received, clearing analysis start time');
        setHasAnalyzed(true);
        setAnalysisStartTime(null); // Clear analysis start time when results are ready

        // Convert API data to UiBandVersion format
        const versions: UiBandVersion[] = [];
      
      // First try to get from improvedVersion (new API format)
      if (activeSubmission.improvedVersion) {
        console.log('Using improvedVersion from separate API call');
        
        if (activeSubmission.improvedVersion.band7) {
          const band7Data = activeSubmission.improvedVersion.band7;
          versions.push({
            band: 7,
            sections: {
              introduction: band7Data.introduction,
              body: band7Data.body,
              conclusion: band7Data.conclusion,
            },
            paragraphs: createParagraphMapping(
              activeSubmission.body,
              {
                introduction: band7Data.introduction,
                body_one: band7Data.body[0] || '',
                body_two: band7Data.body[1] || '',
                conclusion: band7Data.conclusion,
              }
            ),
            improvements: activeSubmission.aiFeedback?.suggestions || [],
          });
        }

        if (activeSubmission.improvedVersion.band8) {
          const band8Data = activeSubmission.improvedVersion.band8;
          versions.push({
            band: 8,
            sections: {
              introduction: band8Data.introduction,
              body: band8Data.body,
              conclusion: band8Data.conclusion,
            },
            paragraphs: createParagraphMapping(
              activeSubmission.body,
              {
                introduction: band8Data.introduction,
                body_one: band8Data.body[0] || '',
                body_two: band8Data.body[1] || '',
                conclusion: band8Data.conclusion,
              }
            ),
            improvements: activeSubmission.aiFeedback?.suggestions || [],
          });
        }

        if (activeSubmission.improvedVersion.band9) {
          const band9Data = activeSubmission.improvedVersion.band9;
          versions.push({
            band: 9,
            sections: {
              introduction: band9Data.introduction,
              body: band9Data.body,
              conclusion: band9Data.conclusion,
            },
            paragraphs: createParagraphMapping(
              activeSubmission.body,
              {
                introduction: band9Data.introduction,
                body_one: band9Data.body[0] || '',
                body_two: band9Data.body[1] || '',
                conclusion: band9Data.conclusion,
              }
            ),
            improvements: activeSubmission.aiFeedback?.suggestions || [],
          });
        }
      }
      // Fallback to old format if improvedVersion is not available
      else if (activeSubmission.aiFeedback?.improvedVersions) {
        const versions: UiBandVersion[] = [];

        if (activeSubmission.aiFeedback.improvedVersions.band7) {
          const band7Data = activeSubmission.aiFeedback.improvedVersions.band7;
          versions.push({
            band: 7,
            sections: {
              introduction: band7Data.introduction,
              body: Array.isArray(band7Data.body) ? band7Data.body : [
                band7Data.body_one || '',
                band7Data.body_two || '',
              ].filter(Boolean),
              conclusion: band7Data.conclusion,
            },
            paragraphs: createParagraphMapping(
              activeSubmission.body,
              {
                introduction: band7Data.introduction,
                body_one: Array.isArray(band7Data.body) ? band7Data.body[0] || '' : band7Data.body_one || '',
                body_two: Array.isArray(band7Data.body) ? band7Data.body[1] || '' : band7Data.body_two || '',
                conclusion: band7Data.conclusion,
              }
            ),
            improvements: activeSubmission.aiFeedback.suggestions || [],
          });
        }

        if (activeSubmission.aiFeedback.improvedVersions.band8) {
          const band8Data = activeSubmission.aiFeedback.improvedVersions.band8;
          versions.push({
            band: 8,
            sections: {
              introduction: band8Data.introduction,
              body: Array.isArray(band8Data.body) ? band8Data.body : [
                band8Data.body_one || '',
                band8Data.body_two || '',
              ].filter(Boolean),
              conclusion: band8Data.conclusion,
            },
            paragraphs: createParagraphMapping(
              activeSubmission.body,
              {
                introduction: band8Data.introduction,
                body_one: Array.isArray(band8Data.body) ? band8Data.body[0] || '' : band8Data.body_one || '',
                body_two: Array.isArray(band8Data.body) ? band8Data.body[1] || '' : band8Data.body_two || '',
                conclusion: band8Data.conclusion,
              }
            ),
            improvements: activeSubmission.aiFeedback.suggestions || [],
          });
        }

        if (activeSubmission.aiFeedback.improvedVersions.band9) {
          const band9Data = activeSubmission.aiFeedback.improvedVersions.band9;
          versions.push({
            band: 9,
            sections: {
              introduction: band9Data.introduction,
              body: Array.isArray(band9Data.body) ? band9Data.body : [
                band9Data.body_one || '',
                band9Data.body_two || '',
              ].filter(Boolean),
              conclusion: band9Data.conclusion,
            },
            paragraphs: createParagraphMapping(
              activeSubmission.body,
              {
                introduction: band9Data.introduction,
                body_one: Array.isArray(band9Data.body) ? band9Data.body[0] || '' : band9Data.body_one || '',
                body_two: Array.isArray(band9Data.body) ? band9Data.body[1] || '' : band9Data.body_two || '',
                conclusion: band9Data.conclusion,
              }
            ),
            improvements: activeSubmission.aiFeedback.suggestions || [],
          });
        }
      }

      // Set band versions if we have any
      if (versions.length > 0) {
        setBandVersions(versions);

        // Set current band based on target score
        const targetBandMap = {
          BAND_SEVEN: 7,
          BAND_EIGHT: 8,
          BAND_NINE: 9,
        };
        setCurrentBand(targetBandMap[targetScore]);
        setSelectedBand(targetBandMap[targetScore]);

        // Notify parent component with actual score from API
        onScoreUpdate(activeSubmission.score, true);
        
        // Stop processing state when we have results
        setIsProcessingEssay(false);
      }
      } else {
        // If we have submission data but no improved versions, still show the essay
        console.log('Submission found but no improved versions yet');
        setHasAnalyzed(false);
        onScoreUpdate(activeSubmission.score || null, false);
      }
    }
  }, [
    activeSubmission,
    submissionId,
    currentSubmissionId,
    targetScore,
    onScoreUpdate,
    createParagraphMapping,
  ]);

  // Determine which component to render - show results for current submission or specific submission from URL
  const shouldShowResults =
    activeSubmission &&
    (submissionId || currentSubmissionId) && // Show results if: 1) specific submissionId from URL, or 2) currentSubmissionId exists (user just analyzed)
    (activeSubmission.status === IELTSWritingSubmissionStatus.IN_PROGRESS ||
      activeSubmission.status === IELTSWritingSubmissionStatus.IDLE ||
      activeSubmission.status === IELTSWritingSubmissionStatus.ANALYZED) &&
    // Show results if we have improved versions OR if we're viewing a specific submission (even without improved versions)
    ((activeSubmission.aiFeedback?.improvedVersions || activeSubmission.improvedVersion) || 
     (submissionId && activeSubmission.status === IELTSWritingSubmissionStatus.ANALYZED));

  // Debug logging for shouldShowResults
  useEffect(() => {
    console.log('shouldShowResults:', shouldShowResults, {
      hasActiveSubmission: !!activeSubmission,
      hasImprovedVersions: !!activeSubmission?.aiFeedback?.improvedVersions,
      hasImprovedVersion: !!activeSubmission?.improvedVersion,
      hasSubmissionId: !!(submissionId || currentSubmissionId),
      status: activeSubmission?.status,
      bandVersionsLength: bandVersions.length
    });
  }, [shouldShowResults, activeSubmission, submissionId, currentSubmissionId, bandVersions.length]);


  // Show loading state when fetching specific submission (only for URL-based submissions)
  if (isLoadingSubmission && submissionId) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-accent/10 rounded-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Loading Essay Analysis</h3>
          <p className="text-muted-foreground">Please wait while we load your essay analysis...</p>
        </div>
      </div>
    );
  }

  // Show error state if we have a submissionId but couldn't load the submission
  if (isWaitingForSpecificSubmission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <div className="text-red-600 text-4xl">⚠️</div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-red-600">Essay Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The essay you're looking for could not be found or you don't have permission to view it.
          </p>
          <button 
            onClick={() => window.location.href = '/my-submissions'}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to My Submissions
          </button>
        </div>
      </div>
    );
  }

  if (shouldShowProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="p-4 bg-accent/10 rounded-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Analyzing Your Essay</h3>
          <div className="text-muted-foreground mb-6">
            <p className="mb-2">
              Our AI is analyzing your essay and generating improved versions.
            </p>
            <p className="mb-2 text-sm">
              This process includes both essay analysis and improved version generation.
            </p>
            <p className="mb-4 text-sm font-medium text-blue-600">
              Maximum wait time: 5 minutes (300 seconds)
            </p>
            <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-primary w-full md:w-[600px]">
              <p className="text-xl font-medium text-primary mb-2 text-center">
                💡 IELTS Writing Tip:
              </p>
              <p
                className={`text-xl transition-all duration-300 ease-in-out text-center ${
                  isTipVisible
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 transform -translate-y-2'
                }`}
              >
                {dynamicTips[currentTipIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log why shouldShowResults might be false
  console.log('Rendering decision:', {
    shouldShowResults,
    hasActiveSubmission: !!activeSubmission,
    hasImprovedVersions: !!activeSubmission?.aiFeedback?.improvedVersions,
    hasImprovedVersion: !!activeSubmission?.improvedVersion,
    hasSubmissionId: !!(submissionId || currentSubmissionId),
    status: activeSubmission?.status,
    bandVersionsLength: bandVersions.length
  });

  if (shouldShowResults && activeSubmission) {
    console.log('Showing EssayResults');
    return (
      <EssayResults
        latestSubmission={activeSubmission}
        bandVersions={bandVersions}
        selectedBand={selectedBand}
        setSelectedBand={setSelectedBand}
        hoveredSentence={hoveredSentence}
        setHoveredSentence={setHoveredSentence}
        expandedCriteria={expandedCriteria}
        setExpandedCriteria={setExpandedCriteria}
        options={options}
        setOptions={setOptions}
      />
    );
  }

  return (
    <EssayCreator
      isAnalyzing={isProcessingEssay}
      onAnalyzeEssay={handleEssayAnalysis}
      onStartNewAnalysis={clearCurrentResults}
      submissionId={submissionId}
      activeSubmission={activeSubmission}
    />
  );
};
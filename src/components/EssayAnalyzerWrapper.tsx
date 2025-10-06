import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSubmitEssay, useAnalyzeScores, useAnalyzeFeedback, useGenerateImprovedVersion, useLatestSubmission, useSubmissionById } from '@/services/essayMutations';
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
  const [isImprovedVersionsLoading, setIsImprovedVersionsLoading] = useState(false);
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
    setIsImprovedVersionsLoading(false);
    onScoreUpdate(null, false);
  };

  // Function to handle essay analysis with progressive results
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
        
        // Start Step 1: Analyze scores (this will show results immediately when ready)
        analyzeScoresMutation.mutateAsync(submissionId)
          .then(() => {
            // Start Step 2: Analyze feedback (this will show results immediately when ready)
            return analyzeFeedbackMutation.mutateAsync(submissionId);
          })
          .then(() => {
            setAnalysisCompleted(true);
            // Start Step 3: Generate improved versions for all three bands
            setIsImprovedVersionsLoading(true);
            
            // Generate improved versions for all three bands in parallel
            const bandPromises = [
              generateImprovedVersionMutation.mutateAsync({ submissionId, targetBand: 'BAND_SEVEN' }),
              generateImprovedVersionMutation.mutateAsync({ submissionId, targetBand: 'BAND_EIGHT' }),
              generateImprovedVersionMutation.mutateAsync({ submissionId, targetBand: 'BAND_NINE' })
            ];
            
            return Promise.allSettled(bandPromises).then((results) => {
              
              // Process results and create band versions
              const versions: UiBandVersion[] = [];
              
              results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                  const band = index === 0 ? 7 : index === 1 ? 8 : 9;
                  const improvedData = result.value.data || result.value;
                  
                  // Extract text content from the response - API returns data in improvedVersion object
                  const improvedVersionData = improvedData.improvedVersion || improvedData;
                  const introduction = improvedVersionData.introduction || '';
                  const body = improvedVersionData.body || [];
                  const conclusion = improvedVersionData.conclusion || '';
                  
                  // Convert body to array if it's a string
                  const bodyArray = Array.isArray(body) ? body : (body ? [body] : []);
                  
                  versions.push({
                    band,
                    sections: {
                      introduction: introduction,
                      body: bodyArray,
                      conclusion: conclusion,
                    },
                    paragraphs: createParagraphMapping(
                      activeSubmission?.body || '',
                      {
                        introduction: introduction,
                        body_one: bodyArray[0] || '',
                        body_two: bodyArray[1] || '',
                        conclusion: conclusion,
                      }
                    ),
                    improvements: activeSubmission?.aiFeedback?.suggestions || [],
                  });
                }
              });
              
              if (versions.length > 0) {
                setBandVersions(versions);
                setSelectedBand(versions[0].band);
              }
              
              return results;
            });
          })
          .then(() => {
            setImprovedVersionCompleted(true);
            setIsImprovedVersionsLoading(false);
          })
          .catch((error) => {
            // Don't throw here - partial results might still be useful
            setImprovedVersionCompleted(true); // Mark as completed even if failed
            setIsImprovedVersionsLoading(false);
          });
        
        return submissionId;
      } else {
        throw new Error('No submission ID received');
      }
    } catch (error) {
      setIsProcessingEssay(false);
      setAnalysisStartTime(null); // Clear analysis start time on error
      throw error;
    }
  };

  // Dynamic tips based on current analysis progress
  const getDynamicTips = (submission: any) => {
    if (!submission) {
      return [
        "AI is analyzing your essay in multiple steps for the best results.",
        "Step 1: Analyzing scores and criteria...",
        "Step 2: Generating detailed feedback...",
        "Step 3: Creating improved versions..."
      ];
    }

    const tips = [];
    
    // Check what analysis steps are complete
    if (submission.score) {
      tips.push(`✅ Scores analysis complete! Your essay scored ${submission.score.toFixed(1)} band.`);
    } else {
      tips.push("🔄 Step 1: Analyzing scores and criteria...");
    }

    if (submission.aiFeedback?.suggestions || submission.aiFeedback?.mistakes) {
      tips.push("✅ Feedback analysis complete! Detailed suggestions are ready.");
    } else if (submission.score) {
      tips.push("🔄 Step 2: Generating detailed feedback and suggestions...");
    }

    if (submission.aiFeedback?.improvedVersions || submission.improvedVersion) {
      tips.push("✅ Improved versions ready! You can now compare different band levels.");
    } else if (submission.aiFeedback?.suggestions || submission.aiFeedback?.mistakes) {
      tips.push("🔄 Step 3: Creating improved versions for different band levels...");
    }

    if (tips.length === 0) {
      tips.push("AI is analyzing your essay to provide personalized feedback and suggestions.");
    }

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

  const dynamicTips = getDynamicTips(activeSubmission);
  const isLoadingSubmission = (submissionId || currentSubmissionId) ? isLoadingSpecific : submissionsLoading;

  const submitEssayMutation = useSubmitEssay();
  const analyzeScoresMutation = useAnalyzeScores();
  const analyzeFeedbackMutation = useAnalyzeFeedback();
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

  // Determine loading state - show processing only when we have no results at all
  const shouldShowProcessing = 
    // Show loading when we're processing an essay (immediate feedback)
    isProcessingEssay ||
    // Show loading when mutations are pending AND we have no results yet
    (submitEssayMutation.isPending || 
     analyzeScoresMutation.isPending ||
     analyzeFeedbackMutation.isPending ||
     generateImprovedVersionMutation.isPending) &&
    !activeSubmission?.score && 
    !activeSubmission?.aiFeedback?.suggestions && 
    !activeSubmission?.aiFeedback?.mistakes ||
    // Show loading when we have a submission but no results yet
    (currentSubmissionId && !activeSubmission);


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
    // Initialize versions array at the top of useEffect
    const versions: UiBandVersion[] = [];
    let defaultSelectedBand: number | null = null;
    
    if (activeSubmission && activeSubmission !== null && (submissionId || currentSubmissionId)) {
      
      // If we have scores, stop processing and show results immediately
      if (activeSubmission?.score) {
        setIsProcessingEssay(false);
        setAnalysisStartTime(null);
        setHasAnalyzed(true);
        onScoreUpdate(activeSubmission?.score, true);
      }
      
      // If we have feedback, show it immediately
      if (activeSubmission?.aiFeedback?.suggestions || activeSubmission?.aiFeedback?.mistakes) {
        setAnalysisCompleted(true);
      }
      
      // If we have improved versions (either from aiFeedback or separate improvedVersion), show the analysis
      if (activeSubmission?.aiFeedback?.improvedVersions || activeSubmission?.improvedVersion) {
        setHasAnalyzed(true);
        setAnalysisStartTime(null); // Clear analysis start time when results are ready
        setImprovedVersionCompleted(true);
        
        // Set default selected band to 7 if available, otherwise 8, then 9
        if (activeSubmission?.improvedVersion?.band7 || activeSubmission?.aiFeedback?.improvedVersions?.band7) {
          setSelectedBand(7);
        } else if (activeSubmission?.improvedVersion?.band8 || activeSubmission?.aiFeedback?.improvedVersions?.band8) {
          setSelectedBand(8);
        } else if (activeSubmission?.improvedVersion?.band9 || activeSubmission?.aiFeedback?.improvedVersions?.band9) {
          setSelectedBand(9);
        }
      } else {
        // If we have scores and feedback but no improved versions, still show the analysis
        if (activeSubmission?.score && (activeSubmission?.aiFeedback?.suggestions || activeSubmission?.aiFeedback?.mistakes)) {
          setHasAnalyzed(true);
          setAnalysisStartTime(null);
          setImprovedVersionCompleted(false); // Mark as not completed since we don't have improved versions
        }
      }

        // NEW LOGIC: Handle improved versions from MySubmissions (already processed data)
        
        // Handle new improvedVersion structure with band7, band8, band9 properties
        if (activeSubmission && activeSubmission !== null && activeSubmission?.improvedVersion) {
          
          const improvedVersionData = activeSubmission?.improvedVersion;
          
          // Check for Band 7
          if (improvedVersionData.band7) {
            const band7Data = improvedVersionData.band7;
            versions.push({
              band: 7,
              sections: {
                introduction: band7Data.introduction || '',
                body: Array.isArray(band7Data.body) ? band7Data.body : [band7Data.body || ''],
                conclusion: band7Data.conclusion || '',
              },
              paragraphs: createParagraphMapping(
                activeSubmission?.body || '',
                {
                  introduction: band7Data.introduction || '',
                  body_one: Array.isArray(band7Data.body) ? band7Data.body[0] || '' : band7Data.body || '',
                  body_two: Array.isArray(band7Data.body) ? band7Data.body[1] || '' : '',
                  conclusion: band7Data.conclusion || '',
                }
              ),
              improvements: activeSubmission?.aiFeedback?.suggestions || [],
            });
            if (!defaultSelectedBand) defaultSelectedBand = 7;
          }
          
          // Check for Band 8
          if (improvedVersionData.band8) {
            const band8Data = improvedVersionData.band8;
            versions.push({
              band: 8,
              sections: {
                introduction: band8Data.introduction || '',
                body: Array.isArray(band8Data.body) ? band8Data.body : [band8Data.body || ''],
                conclusion: band8Data.conclusion || '',
              },
              paragraphs: createParagraphMapping(
                activeSubmission?.body || '',
                {
                  introduction: band8Data.introduction || '',
                  body_one: Array.isArray(band8Data.body) ? band8Data.body[0] || '' : band8Data.body || '',
                  body_two: Array.isArray(band8Data.body) ? band8Data.body[1] || '' : '',
                  conclusion: band8Data.conclusion || '',
                }
              ),
              improvements: activeSubmission?.aiFeedback?.suggestions || [],
            });
            if (!defaultSelectedBand) defaultSelectedBand = 8;
          }
          
          // Check for Band 9
          if (improvedVersionData.band9) {
            const band9Data = improvedVersionData.band9;
            versions.push({
              band: 9,
              sections: {
                introduction: band9Data.introduction || '',
                body: Array.isArray(band9Data.body) ? band9Data.body : [band9Data.body || ''],
                conclusion: band9Data.conclusion || '',
              },
              paragraphs: createParagraphMapping(
                activeSubmission?.body || '',
                {
                  introduction: band9Data.introduction || '',
                  body_one: Array.isArray(band9Data.body) ? band9Data.body[0] || '' : band9Data.body || '',
                  body_two: Array.isArray(band9Data.body) ? band9Data.body[1] || '' : '',
                  conclusion: band9Data.conclusion || '',
                }
              ),
              improvements: activeSubmission?.aiFeedback?.suggestions || [],
            });
            if (!defaultSelectedBand) defaultSelectedBand = 9;
          }
        }
        
        // Set band versions if we have any
        if (versions.length > 0) {
          setBandVersions(versions);
          setSelectedBand(defaultSelectedBand || versions[0].band);
          setCurrentBand(defaultSelectedBand || versions[0].band);
          
          // Notify parent component with actual score from API
          if (activeSubmission && activeSubmission !== null) {
            onScoreUpdate(activeSubmission?.score, true);
          }
          
          // Stop processing state when we have results
          setIsProcessingEssay(false);
        } else {
          setHasAnalyzed(false);
          if (activeSubmission && activeSubmission !== null) {
            onScoreUpdate(activeSubmission?.score || null, false);
          }
        }
      }
      // Fallback to old format if improvedVersion is not available
      else if (activeSubmission && activeSubmission !== null && activeSubmission.aiFeedback?.improvedVersions) {
        if (activeSubmission?.aiFeedback?.improvedVersions?.band7) {
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
              activeSubmission?.body,
              {
                introduction: band7Data.introduction,
                body_one: Array.isArray(band7Data.body) ? band7Data.body[0] || '' : band7Data.body_one || '',
                body_two: Array.isArray(band7Data.body) ? band7Data.body[1] || '' : band7Data.body_two || '',
                conclusion: band7Data.conclusion,
              }
            ),
            improvements: activeSubmission?.aiFeedback?.suggestions || [],
          });
        }

        if (activeSubmission?.aiFeedback?.improvedVersions?.band8) {
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
              activeSubmission?.body,
              {
                introduction: band8Data.introduction,
                body_one: Array.isArray(band8Data.body) ? band8Data.body[0] || '' : band8Data.body_one || '',
                body_two: Array.isArray(band8Data.body) ? band8Data.body[1] || '' : band8Data.body_two || '',
                conclusion: band8Data.conclusion,
              }
            ),
            improvements: activeSubmission?.aiFeedback?.suggestions || [],
          });
        }

        if (activeSubmission?.aiFeedback?.improvedVersions?.band9) {
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
              activeSubmission?.body,
              {
                introduction: band9Data.introduction,
                body_one: Array.isArray(band9Data.body) ? band9Data.body[0] || '' : band9Data.body_one || '',
                body_two: Array.isArray(band9Data.body) ? band9Data.body[1] || '' : band9Data.body_two || '',
                conclusion: band9Data.conclusion,
              }
            ),
            improvements: activeSubmission?.aiFeedback?.suggestions || [],
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
        onScoreUpdate(activeSubmission?.score, true);
        
        // Stop processing state when we have results
        setIsProcessingEssay(false);
      } else {
        // If we have submission data but no improved versions, still show the essay
        setHasAnalyzed(false);
        if (activeSubmission && activeSubmission !== null) {
          onScoreUpdate(activeSubmission?.score || null, false);
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

  // Determine which component to render - show results when scores are ready
  const shouldShowResults =
    activeSubmission &&
    (submissionId || currentSubmissionId) && // Show results if: 1) specific submissionId from URL, or 2) currentSubmissionId exists (user just analyzed)
    (activeSubmission?.status === IELTSWritingSubmissionStatus.IN_PROGRESS ||
      activeSubmission?.status === IELTSWritingSubmissionStatus.IDLE ||
      activeSubmission?.status === IELTSWritingSubmissionStatus.ANALYZED) &&
    // Show results as soon as we have scores (even if feedback/improved versions are still loading)
    (activeSubmission?.score || 
     activeSubmission?.status === IELTSWritingSubmissionStatus.ANALYZED);



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
              Our AI is analyzing your essay in three progressive steps for faster results.
            </p>
            <p className="mb-2 text-sm">
              You'll see results as each step completes, so you don't have to wait for everything to finish.
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


  if (shouldShowResults && activeSubmission) {
    
    // Determine loading states for different sections
    const hasFeedback = !!(activeSubmission?.aiFeedback?.suggestions || activeSubmission?.aiFeedback?.mistakes);
    const hasImprovedVersions = bandVersions.length > 0;
    
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
        // Loading states for progressive display - show loading when we have score but not the data yet
        isFeedbackLoading={!hasFeedback && (analyzeFeedbackMutation.isPending || (activeSubmission?.score && !activeSubmission?.aiFeedback?.suggestions))}
        isImprovedVersionsLoading={isImprovedVersionsLoading || (activeSubmission?.score && !activeSubmission?.improvedVersion && !activeSubmission?.aiFeedback?.improvedVersions)}
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
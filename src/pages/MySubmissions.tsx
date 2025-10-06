import { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Eye, Clock, CheckCircle, XCircle, AlertCircle, Filter, Star, TrendingUp, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EssayAnalyzer } from '@/components/EssayAnalyzer';

interface Submission {
  _id: string;
  user: string;
  writing?: string;
  body: string;
  status: 'ANALYZED' | 'FAILED_TO_CHECK' | 'IN_PROGRESS' | 'IDLE';
  topic: 'GENERATED' | 'CUSTOM';
  targetScore: 'BAND_SEVEN' | 'BAND_EIGHT' | 'BAND_NINE';
  createdAt: string;
  updatedAt: string;
  score?: number;
  aiFeedback?: any;
  improvedVersion?: any;
}

const MySubmissions = () => {
  const { authenticated } = useAuthContext();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewingAnalysis, setViewingAnalysis] = useState<string | null>(null);
  const [displayedScore, setDisplayedScore] = useState<number>(0.0);
  const [currentBand, setCurrentBand] = useState<number | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      navigate('/auth/login');
      return;
    }

    fetchSubmissions();
  }, [authenticated, navigate]);

  useEffect(() => {
    if (currentBand !== null && hasAnalyzed) {
      let startTime: number;
      const duration = 1500;

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = easeOut * currentBand;

        setDisplayedScore(Number(currentScore.toFixed(1)));

        if (progress < 1) {
          requestAnimationFrame(animateScore);
        }
      };

      requestAnimationFrame(animateScore);
    }
  }, [currentBand, hasAnalyzed]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_BASE_URL || 'https://dead.uz/api2';
      const response = await fetch(`${baseURL}/ielts-writing-submission/my-submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      const submissions = data.data || [];
      
      // For now, just use the basic submissions data to speed up loading
      // Detailed data will be fetched when user clicks "View Detailed Analysis"
      const detailedSubmissions = submissions;
      
      setSubmissions(detailedSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ANALYZED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED_TO_CHECK':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANALYZED':
        return <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">✓ Checked</Badge>;
      case 'FAILED_TO_CHECK':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
    }
  };

  const getScoreBadge = (submission: Submission) => {
    if (submission.status === 'ANALYZED' && submission.score) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {submission.score.toFixed(1)} Band
        </Badge>
      );
    }
    return null;
  };

  const handleViewSubmission = (submission: Submission) => {
    if (submission.status === 'ANALYZED') {
      setViewingAnalysis(submission._id);
      setDisplayedScore(0.0);
      setCurrentBand(null);
      setHasAnalyzed(false);
    }
  };

  const handleBackToSubmissions = () => {
    setViewingAnalysis(null);
    setDisplayedScore(0.0);
    setCurrentBand(null);
    setHasAnalyzed(false);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get the current submission being viewed
  const currentSubmission = viewingAnalysis 
    ? submissions.find(s => s._id === viewingAnalysis) 
    : null;

  const filteredAndSortedSubmissions = submissions
    .filter(submission => {
      // Only show ANALYZED (checked) essays in My Submissions
      if (submission.status !== 'ANALYZED') return false;
      
      if (filterStatus === 'all') return true;
      if (filterStatus === 'checked') return submission.status === 'ANALYZED';
      if (filterStatus === 'pending') return false; // No pending essays should show in My Submissions
      if (filterStatus === 'failed') return false; // No failed essays should show in My Submissions
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'score-high') {
        if (a.status === 'ANALYZED' && b.status === 'ANALYZED') {
          return (b.score || 0) - (a.score || 0);
        }
        if (a.status === 'ANALYZED') return -1;
        if (b.status === 'ANALYZED') return 1;
        return 0;
      }
      if (sortBy === 'score-low') {
        if (a.status === 'ANALYZED' && b.status === 'ANALYZED') {
          return (a.score || 0) - (b.score || 0);
        }
        if (a.status === 'ANALYZED') return -1;
        if (b.status === 'ANALYZED') return 1;
        return 0;
      }
      return 0;
    });

  const checkedCount = submissions.filter(s => s.status === 'ANALYZED').length;
  const totalCount = submissions.length;

  if (loading) {
    return (
      <div className="bg-background">
        <Navigation />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your submissions...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <Navigation />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error Loading Submissions</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchSubmissions}>Try Again</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <Navigation />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              My Submissions
            </h1>
            <p className="text-xl text-muted-foreground">
              View and manage your IELTS essay submissions
            </p>
            
            {/* Stats */}
            {totalCount > 0 && (
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-green-600">{checkedCount}</span> checked essays
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-blue-600">{totalCount}</span> total submissions
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filters and Sorting */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Essays</SelectItem>
                    <SelectItem value="checked">Checked Essays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sort by:</span>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="score-high">Highest Score</SelectItem>
                    <SelectItem value="score-low">Lowest Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Show Analysis View or Submissions List */}
          {viewingAnalysis && currentSubmission ? (
            <div className="space-y-6">
              {/* Analysis Header with Back Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleBackToSubmissions}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Submissions
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">Essay Analysis</h2>
                    <p className="text-muted-foreground">
                      Submitted on {format(new Date(currentSubmission.createdAt), 'MMM dd, yyyy - HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreBadge(currentSubmission)}
                  {getStatusBadge(currentSubmission.status)}
                </div>
              </div>

              {/* Analysis Content */}
              <Card className="border-2 border-green-200 bg-green-50/20">
                <CardContent className="p-6">
                  <EssayAnalyzer
                    submissionId={currentSubmission._id}
                    onScoreUpdate={(band, analyzed) => {
                      setCurrentBand(band);
                      setHasAnalyzed(analyzed);
                      if (!analyzed) setDisplayedScore(0.0);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Submissions List */
            filteredAndSortedSubmissions.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    {submissions.length === 0 ? 'No Submissions Yet' : 'No Essays Match Your Filter'}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {submissions.length === 0 
                      ? 'You haven\'t submitted any essays for analysis yet.'
                      : 'Try adjusting your filter or sorting options to see more essays.'
                    }
                  </p>
                  <Button onClick={() => navigate('/ielts-writing')}>
                    Start Writing
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredAndSortedSubmissions.map((submission) => (
                  <Card key={submission._id} className={`shadow-medium ${submission.status === 'ANALYZED' ? 'ring-2 ring-green-200 bg-green-50/20' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {submission.status === 'ANALYZED' ? 'Checked Essay' : 'Essay Submission'}
                            {submission.status === 'ANALYZED' && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(submission.createdAt), 'MMM dd, yyyy - HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getScoreBadge(submission)}
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Essay Preview */}
                        <div>
                          <h4 className="font-medium mb-2">Essay Preview:</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {truncateText(submission.body)}
                          </p>
                          
                          {submission.status === 'ANALYZED' && submission.aiFeedback && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {submission.aiFeedback.suggestions && submission.aiFeedback.suggestions.length > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                  <h5 className="text-sm font-medium text-blue-800 mb-1">Key Suggestions</h5>
                                  <p className="text-xs text-blue-700">
                                    {submission.aiFeedback.suggestions.slice(0, 2).join(', ')}
                                    {submission.aiFeedback.suggestions.length > 2 && '...'}
                                  </p>
                                </div>
                              )}
                              {submission.aiFeedback.mistakes && submission.aiFeedback.mistakes.length > 0 && (
                                <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                                  <h5 className="text-sm font-medium text-orange-800 mb-1">Areas to Improve</h5>
                                  <p className="text-xs text-orange-700">
                                    {submission.aiFeedback.mistakes.slice(0, 2).join(', ')}
                                    {submission.aiFeedback.mistakes.length > 2 && '...'}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Submission Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Topic Type:</span>
                            <p className="text-muted-foreground">
                              {submission.topic === 'GENERATED' ? 'Generated' : 'Custom'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Target Score:</span>
                            <p className="text-muted-foreground">
                              {submission.targetScore.replace('BAND_', 'Band ')}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Word Count:</span>
                            <p className="text-muted-foreground">
                              {submission.body.split(/\s+/).filter(word => word.length > 0).length} words
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>
                            <p className="text-muted-foreground">
                              {format(new Date(submission.updatedAt), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>

                        {submission.status === 'ANALYZED' && (
                          <div className="pt-4 border-t">
                            <Button 
                              onClick={() => handleViewSubmission(submission)}
                              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              <Eye className="h-4 w-4" />
                              View Detailed Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default MySubmissions;

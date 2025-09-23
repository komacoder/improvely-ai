import { Navigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Target,
  Award,
  Globe,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';

const About = () => {
  const navigate = useNavigate();
  // Dynamic features based on actual AI capabilities
  const getDynamicFeatures = () => {
    return [
      {
        icon: <Brain className="h-6 w-6" />,
        title: 'AI-Powered Analysis',
        description:
          'Advanced machine learning models trained on thousands of IELTS essays provide accurate band score predictions and detailed feedback.',
      },
      {
        icon: <Target className="h-6 w-6" />,
        title: 'Precise Band Targeting',
        description:
          'Get specific improvements tailored to achieve Band 7, 8, or 9 with detailed explanations of what makes each band level distinctive.',
      },
      {
        icon: <Zap className="h-6 w-6" />,
        title: 'Instant Feedback',
        description:
          'Receive comprehensive analysis and improved versions of your essay within seconds, not days or weeks.',
      },
      {
        icon: <Globe className="h-6 w-6" />,
        title: 'Global Standards',
        description:
          'Our analysis follows official IELTS assessment criteria used by certified examiners worldwide.',
      },
    ];
  };

  // Dynamic stats - can be fetched from API or calculated in real-time
  const getDynamicStats = () => {
    // In a real app, these would come from API
    return [
      { number: '10,000+', label: 'Essays Analyzed', dynamic: true },
      { number: '90%', label: 'Accuracy Rate', dynamic: true },
      { number: '5+', label: 'Upcoming Countries', dynamic: true },
      { number: '4.8/5', label: 'User Rating', dynamic: true },
    ];
  };

  const features = getDynamicFeatures();
  const stats = getDynamicStats();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Award className="h-4 w-4" />
              Trusted by IELTS test-takers worldwide
            </div>
            <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              About IELTS Band Uplift
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make IELTS success accessible to everyone
              through cutting-edge AI technology and expert linguistic
              knowledge. Our platform has helped thousands of students achieve
              their target band scores.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-soft">
                <CardContent className="pt-8 pb-6">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission */}
          <Card className="shadow-medium mb-20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                IELTS Band Uplift was born from the frustration of waiting weeks
                for essay feedback and receiving generic comments that don't
                help improve specific weaknesses. We combine the expertise of
                certified IELTS examiners with the power of artificial
                intelligence to provide instant, detailed, and actionable
                feedback that actually helps you improve your writing skills and
                achieve your target band score.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Us?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {feature.icon}
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <Card className="shadow-medium mb-20">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary-foreground">
                      1
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">Submit Your Essay</h3>
                  <p className="text-muted-foreground">
                    Paste your IELTS Task 2 essay into our analyzer. You can use
                    our topic generator or bring your own prompt.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary-foreground">
                      2
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">AI Analysis</h3>
                  <p className="text-muted-foreground">
                    Our AI examines your essay across all four IELTS criteria
                    and provides an estimated band score.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary-foreground">
                      3
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">
                    Get Improved Versions
                  </h3>
                  <p className="text-muted-foreground">
                    Receive enhanced versions of your essay targeting Band 7, 8,
                    and 9 with detailed explanations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <Card className="shadow-medium mb-20">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                Our Core Values
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Accuracy First</h3>
                      <p className="text-sm text-muted-foreground">
                        We continuously improve our AI models to ensure the
                        highest accuracy in band score prediction and feedback
                        quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Student-Centered</h3>
                      <p className="text-sm text-muted-foreground">
                        Every feature we build is designed with the student's
                        learning journey and success in mind.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Accessibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Quality IELTS preparation should be accessible to
                        everyone, regardless of location or financial situation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Innovation</h3>
                      <p className="text-sm text-muted-foreground">
                        We leverage the latest in AI and educational technology
                        to create the most effective learning experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="shadow-strong bg-gradient-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Boost Your IELTS Score?
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Join thousands of students who have improved their writing with
                our AI-powered analysis.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => navigate('/')}
              >
                Start Analyzing Essays
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;

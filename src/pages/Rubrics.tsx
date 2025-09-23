import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Users, Lightbulb } from "lucide-react";

const Rubrics = () => {
  const criteria = [
    {
      name: "Task Achievement",
      icon: <Target className="h-5 w-5" />,
      description: "How well you address all parts of the task",
      bands: [
        {
          band: 9,
          description: "Fully addresses all parts of the task with a clear, fully developed response. Ideas are relevant, extended and supported.",
          color: "bg-info"
        },
        {
          band: 8,
          description: "Sufficiently addresses all parts of the task with a well-developed response. Ideas are relevant, well extended and supported.",
          color: "bg-success"
        },
        {
          band: 7,
          description: "Addresses all parts of the task with a developed response. Main ideas are extended and supported but may lack focus.",
          color: "bg-warning"
        },
        {
          band: 6,
          description: "Addresses all parts of the task although some aspects may be covered more fully than others. Ideas are relevant but may lack development.",
          color: "bg-destructive"
        }
      ]
    },
    {
      name: "Coherence and Cohesion",
      icon: <Users className="h-5 w-5" />,
      description: "How well your ideas flow together",
      bands: [
        {
          band: 9,
          description: "Uses cohesion in such a way that it attracts no attention. Skillfully manages paragraphing.",
          color: "bg-info"
        },
        {
          band: 8,
          description: "Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately.",
          color: "bg-success"
        },
        {
          band: 7,
          description: "Logically organizes information and ideas. Uses a range of cohesive devices appropriately although there may be some under-/over-use.",
          color: "bg-warning"
        },
        {
          band: 6,
          description: "Arranges information and ideas coherently. Uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty.",
          color: "bg-destructive"
        }
      ]
    },
    {
      name: "Lexical Resource",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Your vocabulary range and accuracy",
      bands: [
        {
          band: 9,
          description: "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features. Minor errors in spelling and word formation are extremely rare.",
          color: "bg-info"
        },
        {
          band: 8,
          description: "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings. Skillfully uses uncommon lexical items but there may be occasional inaccuracies.",
          color: "bg-success"
        },
        {
          band: 7,
          description: "Uses a sufficient range of vocabulary to allow some flexibility and precise usage. Uses less common lexical items with some awareness of style and collocation.",
          color: "bg-warning"
        },
        {
          band: 6,
          description: "Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation.",
          color: "bg-destructive"
        }
      ]
    },
    {
      name: "Grammatical Range and Accuracy",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Your grammar complexity and correctness",
      bands: [
        {
          band: 9,
          description: "Uses a wide range of structures with full flexibility and accuracy. Minor errors are extremely rare and have minimal impact on communication.",
          color: "bg-info"
        },
        {
          band: 8,
          description: "Uses a wide range of structures flexibly. The majority of sentences are error-free, and errors are rare and well-controlled.",
          color: "bg-success"
        },
        {
          band: 7,
          description: "Uses a variety of complex structures. Frequently produces error-free sentences, though some grammatical errors persist.",
          color: "bg-warning"
        },
        {
          band: 6,
          description: "Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation but they rarely reduce communication.",
          color: "bg-destructive"
        }
      ]
    }
  ];

  const getBandColor = (band: number) => {
    switch (band) {
      case 9: return "text-info-foreground bg-info";
      case 8: return "text-success-foreground bg-success";
      case 7: return "text-warning-foreground bg-warning";
      case 6: return "text-destructive-foreground bg-destructive";
      default: return "text-secondary-foreground bg-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              IELTS Writing Rubrics
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understand how IELTS essays are evaluated across four key criteria. Each criterion is scored from 1-9, 
              and your overall band score is the average of these four scores.
            </p>
          </div>

          {/* Overview */}
          <Card className="shadow-medium mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Band Score Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-info">9.0</div>
                  <div className="text-sm font-medium">Expert User</div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-success">8.0</div>
                  <div className="text-sm font-medium">Very Good User</div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-warning">7.0</div>
                  <div className="text-sm font-medium">Good User</div>
                  <Progress value={77} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-destructive">6.0</div>
                  <div className="text-sm font-medium">Competent User</div>
                  <Progress value={66} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Criteria Details */}
          <div className="space-y-8">
            {criteria.map((criterion, index) => (
              <Card key={index} className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {criterion.icon}
                    </div>
                    <div>
                      <div className="text-xl">{criterion.name}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {criterion.description}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {criterion.bands.map((bandInfo, bandIndex) => (
                      <div key={bandIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getBandColor(bandInfo.band)}>
                            Band {bandInfo.band}
                          </Badge>
                          <Progress 
                            value={(bandInfo.band / 9) * 100} 
                            className="w-24 h-2"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {bandInfo.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dynamic Tips Section - AI-generated based on user performance */}
          <Card className="shadow-medium mt-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">AI-Generated Tips for Higher Bands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">For Band 7+</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Address all parts of the task with clear position</li>
                    <li>• Use a variety of sentence structures</li>
                    <li>• Include relevant examples and explanations</li>
                    <li>• Use cohesive devices naturally</li>
                    <li>• Demonstrate less common vocabulary</li>
                  </ul>
                  <div className="text-xs text-blue-600 mt-2">
                    💡 AI will provide personalized tips based on your essay analysis
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">For Band 8+</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Show sophisticated idea development</li>
                    <li>• Use complex grammar with accuracy</li>
                    <li>• Demonstrate wide vocabulary range</li>
                    <li>• Perfect essay organization and flow</li>
                    <li>• Minimal errors that don't impede communication</li>
                  </ul>
                  <div className="text-xs text-blue-600 mt-2">
                    💡 AI will identify specific areas for improvement in your writing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Rubrics;
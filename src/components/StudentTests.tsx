import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Trophy, Target, BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Test {
  id: string;
  title: string;
  subject: string;
  test_date: string;
  max_marks: number;
  created_by: string;
}

interface TestResult {
  test_id: string;
  student_id: string;
  marks_obtained: number;
}

export const StudentTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const currentStudentId = "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67"; // This would come from auth context

  useEffect(() => {
    fetchTestsData();
  }, []);

  const fetchTestsData = async () => {
    try {
      // Fetch all tests
      const { data: testsData } = await supabase
        .from('tests')
        .select('*');
      
      if (testsData) setTests(testsData);

      // Fetch results for current student
      const { data: resultsData } = await supabase
        .from('test_results')
        .select('*')
        .eq('student_id', currentStudentId);
      
      if (resultsData) setResults(resultsData);

    } catch (error) {
      console.error('Error fetching tests data:', error);
    }
  };

  const getUpcomingTests = () => {
    return tests.filter(test => new Date(test.test_date) > new Date());
  };

  const getCompletedTests = () => {
    const completedTestIds = results.map(result => result.test_id);
    return tests.filter(test => completedTestIds.includes(test.id));
  };

  const getAveragePerformance = () => {
    if (results.length === 0) return 0;
    const totalPercentage = results.reduce((sum, result) => {
      const test = tests.find(t => t.id === result.test_id);
      const percentage = test ? (result.marks_obtained / test.max_marks) * 100 : 0;
      return sum + percentage;
    }, 0);
    return Math.round(totalPercentage / results.length);
  };

  const getGradeDistribution = () => {
    const grades = results.reduce((acc, result) => {
      const test = tests.find(t => t.id === result.test_id);
      const percentage = test ? (result.marks_obtained / test.max_marks) * 100 : 0;
      const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'D';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return grades;
  };

  const upcomingTests = getUpcomingTests();
  const completedTests = getCompletedTests();
  const averagePerformance = getAveragePerformance();
  const gradeDistribution = getGradeDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">My Tests</h2>
        <p className="text-muted-foreground">Track your test schedule and performance</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePerformance}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTests.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.length > 0 ? 
                Math.max(...results.map(r => {
                  const test = tests.find(t => t.id === r.test_id);
                  return test ? Math.round((r.marks_obtained / test.max_marks) * 100) : 0;
                })) + '%' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Highest score</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {results.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Your performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={grade === 'A' ? 'default' : grade === 'B' ? 'secondary' : 'outline'}>
                      Grade {grade}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count} tests</span>
                  </div>
                  <Progress 
                    value={(count / results.length) * 100} 
                    className="w-24" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTests.length})</TabsTrigger>
          <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
          <TabsTrigger value="practice">Practice Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid gap-4">
            {upcomingTests.map((test) => {
              const daysLeft = Math.ceil((new Date(test.test_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={test.id} className="shadow-elegant hover:shadow-glow transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription>{test.subject}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={daysLeft <= 3 ? 'destructive' : 'outline'}>
                          {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                        </Badge>
                        <Badge variant="secondary">{test.max_marks} marks</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {test.test_date}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Study Material
                        </Button>
                        <Button size="sm" className="bg-gradient-accent text-accent-foreground hover:opacity-90">
                          Take Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {upcomingTests.length === 0 && (
              <Card className="shadow-elegant">
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming tests</h3>
                  <p className="text-muted-foreground">You're all caught up! Check back later for new tests.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid gap-4">
            {results.map((result) => {
              const test = tests.find(t => t.id === result.test_id);
              const percentage = test ? Math.round((result.marks_obtained / test.max_marks) * 100) : 0;
              const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'D';
              
              return (
                <Card key={result.test_id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{test?.title}</CardTitle>
                        <CardDescription>
                          {test?.subject} • Test Result
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{percentage}%</div>
                        <Badge variant={grade === 'A' ? 'default' : grade === 'B' ? 'secondary' : 'destructive'}>
                          Grade {grade}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Score: {result.marks_obtained}/{test?.max_marks} marks
                      </div>
                      <Progress value={percentage} className="w-32" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {results.length === 0 && (
              <Card className="shadow-elegant">
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No test results yet</h3>
                  <p className="text-muted-foreground">Take some tests to see your performance here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="practice">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Practice Tests</CardTitle>
              <CardDescription>Sharpen your skills with practice tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'].map((subject) => (
                  <Card key={subject} className="cursor-pointer hover:shadow-glow transition-all">
                    <CardHeader className="text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <CardTitle className="text-lg">{subject}</CardTitle>
                      <CardDescription>Practice tests available</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button variant="outline" className="w-full">
                        Start Practice
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
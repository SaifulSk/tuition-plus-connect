import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, Trophy, BookOpen, Clock, CheckCircle, AlertCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  class: string;
  subjects: string[];
  parent_id: string;
}

export const ParentReports = () => {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [children, setChildren] = useState<Student[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const currentParentId = "fcbd7062-310f-43d2-8ba8-8fcea34edec6"; // This would come from auth context

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch children for current parent
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', currentParentId);
      
      if (studentsData) {
        setChildren(studentsData);
        if (studentsData.length > 0) {
          setSelectedChild(studentsData[0].id);
        }
      }

      // Fetch homework
      const { data: homeworkData } = await supabase
        .from('homework')
        .select('*');
      
      if (homeworkData) setHomework(homeworkData);

      // Fetch homework submissions
      const { data: submissionsData } = await supabase
        .from('homework_submissions')
        .select('*');
      
      if (submissionsData) setHomeworkSubmissions(submissionsData);

      // Fetch tests
      const { data: testsData } = await supabase
        .from('tests')
        .select('*');
      
      if (testsData) setTests(testsData);

      // Fetch test results
      const { data: resultsData } = await supabase
        .from('test_results')
        .select('*');
      
      if (resultsData) setTestResults(resultsData);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getChildHomeworkStats = (childId: string) => {
    // Get submissions for this child
    const childSubmissions = homeworkSubmissions.filter(s => s.student_id === childId);
    
    const submittedCount = childSubmissions.filter(s => s.status === 'completed').length;
    const acknowledgedCount = childSubmissions.filter(s => s.parent_acknowledged).length;

    return {
      total: childSubmissions.length,
      submitted: submittedCount,
      acknowledged: acknowledgedCount,
      pending: childSubmissions.length - submittedCount
    };
  };

  const getChildTestResults = (childId: string) => {
    return testResults.filter(result => result.student_id === childId);
  };

  const getAttendanceData = () => {
    // Mock attendance data - in real app, this would come from backend
    return {
      present: 22,
      absent: 2,
      total: 24,
      percentage: 92
    };
  };

  const selectedChildData = children.find(child => child.id === selectedChild);
  const homeworkStats = selectedChild ? getChildHomeworkStats(selectedChild) : null;
  const childTestResults = selectedChild ? getChildTestResults(selectedChild) : [];
  const attendanceData = getAttendanceData();

  const getAveragePerformance = () => {
    if (childTestResults.length === 0) return 0;
    return Math.round(childTestResults.reduce((sum, result) => sum + (result.marks_obtained / 100 * 100), 0) / childTestResults.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Progress Reports</h2>
          <p className="text-muted-foreground">Monitor your child's academic performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} - {child.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {selectedChildData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.percentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {attendanceData.present}/{attendanceData.total} classes
                </p>
                <Progress value={attendanceData.percentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Homework</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {homeworkStats ? `${homeworkStats.submitted}/${homeworkStats.total}` : '0/0'}
                </div>
                <p className="text-xs text-muted-foreground">Submitted assignments</p>
                <Progress 
                  value={homeworkStats ? (homeworkStats.submitted / homeworkStats.total) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Average</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAveragePerformance()}%</div>
                <p className="text-xs text-muted-foreground">{childTestResults.length} tests taken</p>
                <Progress value={getAveragePerformance()} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getAveragePerformance() >= 90 ? 'A+' : 
                   getAveragePerformance() >= 80 ? 'A' :
                   getAveragePerformance() >= 70 ? 'B+' :
                   getAveragePerformance() >= 60 ? 'B' : 'C'}
                </div>
                <p className="text-xs text-muted-foreground">Current standing</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="homework">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="homework">Homework Progress</TabsTrigger>
              <TabsTrigger value="tests">Test Results</TabsTrigger>
              <TabsTrigger value="attendance">Attendance Details</TabsTrigger>
            </TabsList>

            <TabsContent value="homework">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Homework Tracking</CardTitle>
                  <CardDescription>Monitor homework completion and acknowledgment</CardDescription>
                </CardHeader>
                <CardContent>
                  {homeworkStats && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Assigned</p>
                            <p className="text-2xl font-bold">{homeworkStats.total}</p>
                          </div>
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="text-2xl font-bold text-green-600">{homeworkStats.submitted}</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">{homeworkStats.pending}</p>
                          </div>
                          <AlertCircle className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {homeworkSubmissions
                          .filter(submission => submission.student_id === selectedChild)
                          .map((submission) => {
                            const hw = homework.find(h => h.id === submission.homework_id);
                            const isSubmitted = submission.status === 'completed';
                            const isAcknowledged = submission.parent_acknowledged || false;

                            if (!hw) return null;

                            return (
                              <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                  <h3 className="font-medium">{hw.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {hw.subject} • Due: {hw.due_date}
                                  </p>
                                   {submission.submitted_date && (
                                     <p className="text-xs text-muted-foreground mt-1">
                                       Submitted: {new Date(submission.submitted_date).toLocaleDateString()}
                                     </p>
                                   )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={isSubmitted ? 'default' : 'destructive'}>
                                    {isSubmitted ? 'Submitted' : 'Pending'}
                                  </Badge>
                                  {isSubmitted && (
                                    <Button
                                      variant={isAcknowledged ? 'secondary' : 'outline'}
                                      size="sm"
                                      disabled={isAcknowledged}
                                    >
                                      {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Test Performance</CardTitle>
                  <CardDescription>Detailed test results and analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {childTestResults.map((result) => {
                      const test = tests.find(t => t.id === result.test_id);
                      const percentage = Math.round((result.marks_obtained / 100) * 100);
                      const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'D';
                      
                      return (
                        <div key={result.test_id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{test?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {test?.subject} • {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">{percentage}%</p>
                              <p className="text-sm text-muted-foreground">
                                {result.marks_obtained}/{test?.max_marks || 100}
                              </p>
                            </div>
                            <Badge variant={
                              grade === 'A' ? 'default' : 
                              grade === 'B' ? 'secondary' : 'destructive'
                            }>
                              Grade {grade}
                            </Badge>
                            <Progress value={percentage} className="w-20" />
                          </div>
                        </div>
                      );
                    })}
                    {childTestResults.length === 0 && (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No test results available</h3>
                        <p className="text-muted-foreground">Test results will appear here once your child takes tests.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Attendance Report</CardTitle>
                  <CardDescription>Detailed attendance tracking and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Monthly Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Total Classes</span>
                            <span className="font-medium">{attendanceData.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Present</span>
                            <span className="font-medium text-green-600">{attendanceData.present}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Absent</span>
                            <span className="font-medium text-red-600">{attendanceData.absent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attendance Rate</span>
                            <span className="font-medium">{attendanceData.percentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Subject-wise Attendance</h3>
                        <div className="space-y-3">
                          {selectedChildData.subjects.map((subject) => (
                            <div key={subject} className="flex items-center justify-between">
                              <span>{subject}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={Math.floor(Math.random() * 20) + 80} className="w-20" />
                                <span className="text-sm font-medium">
                                  {Math.floor(Math.random() * 20) + 80}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
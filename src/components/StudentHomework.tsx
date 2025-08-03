import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Upload } from "lucide-react";
import homeworkData from "@/data/homework.json";

interface Homework {
  id: string;
  title: string;
  subject: string;
  class: string;
  description: string;
  assigned_date: string;
  due_date: string;
  assigned_to: string[];
  status: string;
  submissions?: Submission[];
}

interface Submission {
  student_id: string;
  student_name: string;
  status: "Pending" | "Completed" | "Late";
  submitted_date?: string;
  parent_acknowledgment: boolean;
}

export const StudentHomework = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const currentStudentId = "S001"; // This would come from auth context

  useEffect(() => {
    // Filter homework assigned to current student
    const studentHomework = homeworkData.homework.filter(hw => 
      hw.assigned_to.includes(currentStudentId)
    );
    setHomework(studentHomework as Homework[]);
  }, []);

  const handleSubmitHomework = () => {
    if (selectedHomework && submissionText.trim()) {
      const newSubmission: Submission = {
        student_id: currentStudentId,
        student_name: "Priya Sharma", // This would come from user data
        submitted_date: new Date().toISOString().split('T')[0],
        status: "Completed",
        parent_acknowledgment: false
      };

      const updatedHomework = homework.map(hw => {
        if (hw.id === selectedHomework.id) {
          return {
            ...hw,
            submissions: hw.submissions ? [...hw.submissions, newSubmission] : [newSubmission]
          };
        }
        return hw;
      });

      setHomework(updatedHomework);
      setSubmissionText("");
      setIsSubmitDialogOpen(false);
      setSelectedHomework(null);
    }
  };

  const getHomeworkStatus = (hw: Homework) => {
    const submission = hw.submissions?.find(s => s.student_id === currentStudentId);
    if (submission) {
      return submission.status;
    }
    const dueDate = new Date(hw.due_date);
    const today = new Date();
    return dueDate < today ? "overdue" : "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  const pendingHomework = homework.filter(hw => {
    const status = getHomeworkStatus(hw);
    return status === "pending" || status === "overdue";
  });

  const completedHomework = homework.filter(hw => {
    const status = getHomeworkStatus(hw);
    return status === "Completed";
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">My Homework</h2>
        <p className="text-muted-foreground">Track and submit your assignments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homework.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHomework.length}</div>
            <p className="text-xs text-muted-foreground">Need to submit</p>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedHomework.length}</div>
            <p className="text-xs text-muted-foreground">Submitted on time</p>
          </CardContent>
        </Card>
      </div>

      {/* Homework Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingHomework.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedHomework.length})</TabsTrigger>
          <TabsTrigger value="all">All Homework</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingHomework.map((hw) => {
              const status = getHomeworkStatus(hw);
              const daysLeft = Math.ceil((new Date(hw.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={hw.id} className="shadow-elegant hover:shadow-glow transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{hw.title}</CardTitle>
                        <CardDescription>{hw.subject} • {hw.class}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(status)}>
                          {status === "overdue" ? "Overdue" : `${daysLeft} days left`}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{hw.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {hw.due_date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Assigned: {hw.assigned_date}
                        </div>
                      </div>
                      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => setSelectedHomework(hw)}
                            className="bg-gradient-accent text-accent-foreground hover:opacity-90"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Submit Homework</DialogTitle>
                            <DialogDescription>
                              {selectedHomework?.title} - {selectedHomework?.subject}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="submission">Your Answer/Solution</Label>
                              <Textarea
                                id="submission"
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Write your homework solution here..."
                                rows={6}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {
                              setIsSubmitDialogOpen(false);
                              setSubmissionText("");
                              setSelectedHomework(null);
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmitHomework} className="bg-gradient-accent text-accent-foreground">
                              Submit Homework
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {completedHomework.map((hw) => {
              const submission = hw.submissions?.find(s => s.student_id === currentStudentId);
              
              return (
                <Card key={hw.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{hw.title}</CardTitle>
                        <CardDescription>{hw.subject} • {hw.class}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted
                        </Badge>
                        {submission?.parent_acknowledgment && (
                          <Badge variant="secondary">Parent Reviewed</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{hw.description}</p>
                    {submission && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Submission Status:</p>
                        <p className="text-sm text-muted-foreground">{submission.status}</p>
                        {submission.submitted_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted on: {submission.submitted_date}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {homework.map((hw) => {
              const status = getHomeworkStatus(hw);
              
              return (
                <Card key={hw.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{hw.title}</CardTitle>
                        <CardDescription>{hw.subject} • {hw.class}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{hw.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {hw.due_date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Assigned: {hw.assigned_date}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
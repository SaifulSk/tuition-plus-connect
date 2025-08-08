import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardList, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  assigned_date: string;
  due_date: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  status: "pending" | "completed" | "late";
  submitted_date?: string;
  parent_acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export const HomeworkManagement = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newHomework, setNewHomework] = useState({
    title: "",
    subject: "",
    description: "",
    due_date: "",
    assigned_to: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchHomework();
    fetchStudents();
    fetchSubmissions();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch homework",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*');

      if (error) throw error;
      setSubmissions((data || []).map(sub => ({
        ...sub,
        status: sub.status as "pending" | "completed" | "late"
      })));
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleAddHomework = async () => {
    if (!newHomework.title || !newHomework.subject || !newHomework.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('homework')
        .insert([{
          title: newHomework.title,
          subject: newHomework.subject,
          description: newHomework.description,
          due_date: newHomework.due_date,
          assigned_by: crypto.randomUUID() // In real app, this would be from auth
        }])
        .select()
        .single();

      if (error) throw error;

      // Create submissions for selected students
      if (newHomework.assigned_to.length > 0) {
        const submissionPromises = newHomework.assigned_to.map(studentId => 
          supabase
            .from('homework_submissions')
            .insert([{
              homework_id: data.id,
              student_id: studentId,
              status: 'pending'
            }])
        );

        await Promise.all(submissionPromises);
      }

      setHomework([data, ...homework]);
      setNewHomework({ title: "", subject: "", description: "", due_date: "", assigned_to: [] });
      setIsAddDialogOpen(false);
      fetchSubmissions(); // Refresh submissions
      
      toast({
        title: "Success",
        description: "Homework assigned successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign homework",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    try {
      // First delete associated submissions
      const { error: submissionsError } = await supabase
        .from('homework_submissions')
        .delete()
        .eq('homework_id', homeworkId);

      if (submissionsError) throw submissionsError;

      // Then delete the homework
      const { error: homeworkError } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);

      if (homeworkError) throw homeworkError;

      setHomework(homework.filter(h => h.id !== homeworkId));
      setSubmissions(submissions.filter(s => s.homework_id !== homeworkId));
      
      toast({
        title: "Success",
        description: "Homework deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete homework",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "late":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "late":
        return "destructive";
      default:
        return "outline";
    }
  };

  const totalHomework = homework.length;
  const pendingSubmissions = submissions.filter(s => s.status === "pending").length;
  const completedSubmissions = submissions.filter(s => s.status === "completed").length;
  const lateSubmissions = submissions.filter(s => s.status === "late").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homework Management</h2>
          <p className="text-muted-foreground">Assign and track homework submissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Assign Homework
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign New Homework</DialogTitle>
              <DialogDescription>Create and assign homework to students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                  placeholder="Homework title"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select onValueChange={(value) => setNewHomework({...newHomework, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newHomework.description}
                  onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                  placeholder="Homework details and instructions"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newHomework.due_date}
                  onChange={(e) => setNewHomework({...newHomework, due_date: e.target.value})}
                />
              </div>
              <div>
                <Label>Assign to Students</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {students.map((student) => (
                    <label key={student.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newHomework.assigned_to.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewHomework({
                              ...newHomework,
                              assigned_to: [...newHomework.assigned_to, student.id]
                            });
                          } else {
                            setNewHomework({
                              ...newHomework,
                              assigned_to: newHomework.assigned_to.filter(id => id !== student.id)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{student.name} ({student.class})</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddHomework} className="w-full bg-gradient-primary">
                Assign Homework
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Homework
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHomework}</div>
            <p className="text-xs text-muted-foreground">Assigned this month</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Submissions due</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSubmissions}</div>
            <p className="text-xs text-muted-foreground">Submissions done</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Late
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lateSubmissions}</div>
            <p className="text-xs text-muted-foreground">Overdue submissions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Homework ({totalHomework})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingSubmissions})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSubmissions})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading homework...</div>
          ) : (
            homework.map((hw) => {
              const hwSubmissions = submissions.filter(s => s.homework_id === hw.id);
              
              return (
                <Card key={hw.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{hw.title}</CardTitle>
                        <CardDescription>{hw.subject} • Due: {hw.due_date}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {new Date(hw.assigned_date).toLocaleDateString()}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Homework</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{hw.title}"? This will also delete all related submissions and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteHomework(hw.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{hw.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Submissions ({hwSubmissions.length})</h4>
                      <div className="space-y-2">
                        {hwSubmissions.map((submission) => {
                          const student = students.find(s => s.id === submission.student_id);
                          
                          return (
                            <div key={submission.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{student?.name || 'Unknown Student'}</span>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(submission.status)}
                                  <Badge variant={getStatusVariant(submission.status)} className="text-xs">
                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {submission.parent_acknowledged && (
                                  <Badge variant="outline" className="text-xs">
                                    Parent Ack ✓
                                  </Badge>
                                )}
                                {submission.submitted_date && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(submission.submitted_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="space-y-4">
            {homework.filter(hw => submissions.some(s => s.homework_id === hw.id && s.status === "pending")).map((hw) => (
              <Card key={hw.id} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{hw.title}</CardTitle>
                  <CardDescription>{hw.subject} • Due: {hw.due_date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submissions.filter(s => s.homework_id === hw.id && s.status === "pending").map((submission) => {
                      const student = students.find(s => s.id === submission.student_id);
                      return (
                        <div key={submission.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                          <span className="font-medium">{student?.name || 'Unknown Student'}</span>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="space-y-4">
            {homework.filter(hw => submissions.some(s => s.homework_id === hw.id && s.status === "completed")).map((hw) => (
              <Card key={hw.id} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{hw.title}</CardTitle>
                  <CardDescription>{hw.subject} • Due: {hw.due_date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submissions.filter(s => s.homework_id === hw.id && s.status === "completed").map((submission) => {
                      const student = students.find(s => s.id === submission.student_id);
                      return (
                        <div key={submission.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <span className="font-medium">{student?.name || 'Unknown Student'}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">Completed</Badge>
                            {submission.submitted_date && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(submission.submitted_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
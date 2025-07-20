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
  User
} from "lucide-react";
import homeworkData from "@/data/homework.json";
import studentsData from "@/data/students.json";

interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  assigned_date: string;
  due_date: string;
  assigned_to: string[];
  submissions: {
    student_id: string;
    student_name: string;
    status: "Completed" | "Pending" | "Late";
    submitted_date?: string;
    parent_acknowledgment: boolean;
  }[];
}

export const HomeworkManagement = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: "",
    subject: "",
    description: "",
    due_date: "",
    assigned_to: [] as string[]
  });

  useEffect(() => {
    setHomework(homeworkData.homework as Homework[]);
    setStudents(studentsData.students);
  }, []);

  const handleAddHomework = () => {
    const hw: Homework = {
      id: `HW${String(homework.length + 1).padStart(3, '0')}`,
      title: newHomework.title,
      subject: newHomework.subject,
      description: newHomework.description,
      assigned_date: new Date().toISOString().split('T')[0],
      due_date: newHomework.due_date,
      assigned_to: newHomework.assigned_to,
      submissions: newHomework.assigned_to.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          student_id: studentId,
          student_name: student?.name || "",
          status: "Pending" as const,
          parent_acknowledgment: false
        };
      })
    };
    
    setHomework([...homework, hw]);
    setNewHomework({ title: "", subject: "", description: "", due_date: "", assigned_to: [] });
    setIsAddDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Late":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Pending":
        return "secondary";
      case "Late":
        return "destructive";
      default:
        return "outline";
    }
  };

  const totalHomework = homework.length;
  const pendingSubmissions = homework.reduce((sum, hw) => 
    sum + hw.submissions.filter(s => s.status === "Pending").length, 0
  );
  const completedSubmissions = homework.reduce((sum, hw) => 
    sum + hw.submissions.filter(s => s.status === "Completed").length, 0
  );
  const lateSubmissions = homework.reduce((sum, hw) => 
    sum + hw.submissions.filter(s => s.status === "Late").length, 0
  );

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
          {homework.map((hw) => (
            <Card key={hw.id} className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{hw.title}</CardTitle>
                    <CardDescription>{hw.subject} • Due: {hw.due_date}</CardDescription>
                  </div>
                  <Badge variant="outline">{hw.id}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{hw.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Submissions ({hw.submissions.length})</h4>
                  <div className="space-y-2">
                    {hw.submissions.map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{submission.student_name}</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(submission.status)}
                            <Badge variant={getStatusVariant(submission.status)} className="text-xs">
                              {submission.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.parent_acknowledgment && (
                            <Badge variant="outline" className="text-xs">
                              Parent Ack ✓
                            </Badge>
                          )}
                          {submission.submitted_date && (
                            <span className="text-xs text-muted-foreground">
                              {submission.submitted_date}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="space-y-4">
            {homework.filter(hw => hw.submissions.some(s => s.status === "Pending")).map((hw) => (
              <Card key={hw.id} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{hw.title}</CardTitle>
                  <CardDescription>{hw.subject} • Due: {hw.due_date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hw.submissions.filter(s => s.status === "Pending").map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                        <span className="font-medium">{submission.student_name}</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="space-y-4">
            {homework.filter(hw => hw.submissions.some(s => s.status === "Completed")).map((hw) => (
              <Card key={hw.id} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{hw.title}</CardTitle>
                  <CardDescription>{hw.subject} • Due: {hw.due_date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hw.submissions.filter(s => s.status === "Completed").map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <span className="font-medium">{submission.student_name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">Completed</Badge>
                          {submission.submitted_date && (
                            <span className="text-xs text-muted-foreground">
                              {submission.submitted_date}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
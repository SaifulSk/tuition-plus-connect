import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Users, Plus, Edit, Calendar, DollarSign } from "lucide-react";
import studentsData from "@/data/students.json";

interface Student {
  id: string;
  name: string;
  class: string;
  subjects: string[];
  fee_structure: {
    monthly_fee: number;
    subjects: Record<string, number>;
  };
  schedule: Record<string, string[]>;
}

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    subjects: "",
    monthly_fee: ""
  });

  useEffect(() => {
    setStudents(studentsData.students);
  }, []);

  const handleAddStudent = () => {
    const student: Student = {
      id: `S${String(students.length + 1).padStart(3, '0')}`,
      name: newStudent.name,
      class: newStudent.class,
      subjects: newStudent.subjects.split(',').map(s => s.trim()),
      fee_structure: {
        monthly_fee: parseInt(newStudent.monthly_fee),
        subjects: {}
      },
      schedule: {}
    };
    
    setStudents([...students, student]);
    setNewStudent({ name: "", class: "", subjects: "", monthly_fee: "" });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-muted-foreground">Manage your students and their details</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Enter student details to add them to your coaching</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={newStudent.class}
                  onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                  placeholder="e.g., 10th, 12th"
                />
              </div>
              <div>
                <Label htmlFor="subjects">Subjects (comma separated)</Label>
                <Input
                  id="subjects"
                  value={newStudent.subjects}
                  onChange={(e) => setNewStudent({...newStudent, subjects: e.target.value})}
                  placeholder="Mathematics, Physics, Chemistry"
                />
              </div>
              <div>
                <Label htmlFor="fee">Monthly Fee (₹)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={newStudent.monthly_fee}
                  onChange={(e) => setNewStudent({...newStudent, monthly_fee: e.target.value})}
                  placeholder="3000"
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full bg-gradient-primary">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Students ({students.length})</TabsTrigger>
          <TabsTrigger value="10th">Class 10th</TabsTrigger>
          <TabsTrigger value="12th">Class 12th</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card key={student.id} className="shadow-elegant hover:shadow-glow transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <Badge variant="secondary">{student.class}</Badge>
                  </div>
                  <CardDescription>Student ID: {student.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>₹{student.fee_structure.monthly_fee}/month</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{Object.keys(student.schedule).length} days/week</span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="10th">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.filter(s => s.class === "10th").map((student) => (
              <Card key={student.id} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{student.name}</CardTitle>
                  <CardDescription>{student.subjects.join(", ")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Monthly Fee: ₹{student.fee_structure.monthly_fee}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="12th">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.filter(s => s.class === "12th").map((student) => (
              <Card key={student.id} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{student.name}</CardTitle>
                  <CardDescription>{student.subjects.join(", ")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Monthly Fee: ₹{student.fee_structure.monthly_fee}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
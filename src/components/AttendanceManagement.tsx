import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, UserCheck, UserX, Clock, Plus, Filter } from "lucide-react";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  class: string;
  email: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  students: Student;
}

export const AttendanceManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const classes = ['all', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [selectedDate, selectedClass]);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from('students')
        .select('id, name, class, email')
        .order('name');

      if (selectedClass !== 'all') {
        query = query.eq('class', selectedClass);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchAttendance = async () => {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          id,
          student_id,
          class_date,
          status,
          notes,
          students (id, name, class, email)
        `)
        .eq('class_date', selectedDate)
        .order('students(name)');

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredData = data || [];
      if (selectedClass !== 'all') {
        filteredData = filteredData.filter((record: any) => 
          record.students?.class === selectedClass
        );
      }

      setAttendance(filteredData as AttendanceRecord[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late', notes?: string) => {
    try {
      setIsLoading(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          class_date: selectedDate,
          status,
          notes: notes || null,
          marked_by: profile.id
        }, {
          onConflict: 'student_id,class_date'
        });

      if (error) throw error;

      await fetchAttendance();
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markBulkAttendance = async (status: 'present' | 'absent') => {
    try {
      setIsLoading(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        class_date: selectedDate,
        status,
        marked_by: profile.id
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,class_date'
        });

      if (error) throw error;

      await fetchAttendance();
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: `Marked all students as ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark bulk attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = attendance.find(a => a.student_id === studentId);
    return record?.status || 'unmarked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="h-4 w-4" />;
      case 'absent':
        return <UserX className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Management
          </CardTitle>
          <CardDescription>
            Mark and track student attendance for each class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls === 'all' ? 'All Classes' : cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Bulk Mark
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Mark Attendance</DialogTitle>
                    <DialogDescription>
                      Mark attendance for all students in the selected class and date
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Date: {format(new Date(selectedDate), 'PPP')}
                      <br />
                      Class: {selectedClass === 'all' ? 'All Classes' : selectedClass}
                      <br />
                      Students: {students.length}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => markBulkAttendance('present')}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Mark All Present
                      </Button>
                      <Button 
                        onClick={() => markBulkAttendance('absent')}
                        disabled={isLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Mark All Absent
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Attendance for {format(new Date(selectedDate), 'PPP')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Students Found</h3>
                  <p className="text-muted-foreground">
                    No students found for the selected class.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const status = getAttendanceStatus(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>
                            <Badge 
                              className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}
                            >
                              {getStatusIcon(status)}
                              {status === 'unmarked' ? 'Not Marked' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={status === 'present' ? 'default' : 'outline'}
                                onClick={() => markAttendance(student.id, 'present')}
                                disabled={isLoading}
                              >
                                <UserCheck className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={status === 'late' ? 'default' : 'outline'}
                                onClick={() => markAttendance(student.id, 'late')}
                                disabled={isLoading}
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={status === 'absent' ? 'destructive' : 'outline'}
                                onClick={() => markAttendance(student.id, 'absent')}
                                disabled={isLoading}
                              >
                                <UserX className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
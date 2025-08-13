import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Plus, Trash2, Edit } from "lucide-react";

interface ClassSchedule {
  id: string;
  subject: string;
  class: string;
  day: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const classes = ["Class 10th", "Class 12th"];
const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi"];

export const ClassSchedule = () => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    day: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // Using mock data for now
      setSchedules([
        {
          id: "1",
          subject: "Mathematics",
          class: "Class 10th",
          day: "Monday",
          start_time: "09:00",
          end_time: "10:30",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          subject: "Physics",
          class: "Class 12th",
          day: "Tuesday",
          start_time: "11:00",
          end_time: "12:30",
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          subject: "Chemistry",
          class: "Class 12th",
          day: "Wednesday",
          start_time: "14:00",
          end_time: "15:30",
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch class schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.class || !formData.day || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSchedule) {
        // Update existing schedule
        const updatedSchedule = {
          ...editingSchedule,
          ...formData
        };
        setSchedules(schedules.map(s => s.id === editingSchedule.id ? updatedSchedule : s));
        
        toast({
          title: "Success",
          description: "Class schedule updated successfully",
        });
      } else {
        // Add new schedule
        const newSchedule: ClassSchedule = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString()
        };
        setSchedules([...schedules, newSchedule]);
        
        toast({
          title: "Success",
          description: "Class schedule added successfully",
        });
      }
      
      setFormData({ subject: "", class: "", day: "", start_time: "", end_time: "" });
      setIsDialogOpen(false);
      setEditingSchedule(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save class schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      setSchedules(schedules.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Class schedule deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class schedule",
        variant: "destructive",
      });
    } finally {
      setDeleteScheduleId(null);
    }
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      subject: schedule.subject,
      class: schedule.class,
      day: schedule.day,
      start_time: schedule.start_time,
      end_time: schedule.end_time
    });
    setIsDialogOpen(true);
  };

  // Get unique time slots and sort them
  const timeSlots = Array.from(new Set(schedules.map(s => `${s.start_time} - ${s.end_time}`)))
    .sort((a, b) => {
      const timeA = a.split(' - ')[0];
      const timeB = b.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });

  // Create a matrix of schedules by day and time
  const scheduleMatrix = daysOfWeek.reduce((acc, day) => {
    acc[day] = {};
    timeSlots.forEach(timeSlot => {
      acc[day][timeSlot] = schedules.find(s => 
        s.day === day && `${s.start_time} - ${s.end_time}` === timeSlot
      ) || null;
    });
    return acc;
  }, {} as Record<string, Record<string, ClassSchedule | null>>);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Class Schedule</h2>
          <p className="text-muted-foreground">Manage your weekly class schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSchedule(null);
              setFormData({ subject: "", class: "", day: "", start_time: "", end_time: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSchedule ? "Edit Class" : "Add New Class"}</DialogTitle>
              <DialogDescription>
                {editingSchedule ? "Update the class details below." : "Fill in the details to add a new class to the schedule."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="day">Day</Label>
                <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSchedule ? "Update Class" : "Add Class"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {schedules.length > 0 ? (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              View and manage your class timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-3 bg-muted/50 text-left font-medium">Day</th>
                    {timeSlots.map((timeSlot) => (
                      <th key={timeSlot} className="border border-border p-3 bg-muted/50 text-center font-medium min-w-[200px]">
                        {timeSlot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => (
                    <tr key={day}>
                      <td className="border border-border p-3 bg-muted/20 font-medium">
                        {day}
                      </td>
                      {timeSlots.map((timeSlot) => {
                        const schedule = scheduleMatrix[day][timeSlot];
                        return (
                          <td key={timeSlot} className="border border-border p-2 h-24 align-top">
                            {schedule ? (
                              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 h-full flex flex-col justify-between">
                                <div>
                                  <div className="font-medium text-sm">{schedule.subject}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {schedule.class}
                                  </div>
                                </div>
                                <div className="flex items-center justify-end space-x-1 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleEdit(schedule)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setDeleteScheduleId(schedule.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center opacity-50">
                                <span className="text-xs text-muted-foreground">No class</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-elegant">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Classes Scheduled</h3>
              <p className="text-muted-foreground">Add your first class to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteScheduleId !== null} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class from the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteScheduleId && handleDeleteSchedule(deleteScheduleId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
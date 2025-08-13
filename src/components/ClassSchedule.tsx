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

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const timeSlot = `${schedule.start_time} - ${schedule.end_time}`;
    if (!acc[timeSlot]) {
      acc[timeSlot] = [];
    }
    acc[timeSlot].push(schedule);
    return acc;
  }, {} as Record<string, ClassSchedule[]>);

  const timeSlots = Object.keys(groupedSchedules).sort((a, b) => {
    const timeA = a.split(' - ')[0];
    const timeB = b.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

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

      <div className="grid gap-6">
        {timeSlots.length > 0 ? (
          timeSlots.map((timeSlot) => (
            <Card key={timeSlot} className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {timeSlot}
                </CardTitle>
                <CardDescription>
                  {groupedSchedules[timeSlot]?.length || 0} classes in this time slot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {groupedSchedules[timeSlot].map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{schedule.subject}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {schedule.class}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {schedule.day}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteScheduleId(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-elegant">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Classes Scheduled</h3>
                <p className="text-muted-foreground">Add your first class to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
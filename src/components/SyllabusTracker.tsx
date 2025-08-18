import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, Trash2, Edit, CheckCircle, Clock, Target } from "lucide-react";

interface SyllabusItem {
  id: string;
  subject: string;
  class: string;
  topic: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  completion_date?: string;
  created_at: string;
}

const classes = ["Class 10th", "Class 12th"];
const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi"];
const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "in-progress", label: "In Progress", icon: Target },
  { value: "completed", label: "Completed", icon: CheckCircle }
];

export const SyllabusTracker = () => {
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteSyllabusId, setDeleteSyllabusId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    subject: string;
    class: string;
    topic: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
  }>({
    subject: "",
    class: "",
    topic: "",
    description: "",
    status: "pending"
  });

  useEffect(() => {
    fetchSyllabusItems();
  }, []);

  const fetchSyllabusItems = async () => {
    try {
      const { data, error } = await supabase
        .from('syllabus_topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast status to proper type
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as "pending" | "in-progress" | "completed"
      }));

      setSyllabusItems(typedData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch syllabus items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.class || !formData.topic) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const updateData = {
          ...formData,
          completion_date: formData.status === "completed" ? new Date().toISOString().split('T')[0] : null
        };
        
        const { error } = await supabase
          .from('syllabus_topics')
          .update(updateData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Syllabus item updated successfully",
        });
      } else {
        // Add new item
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to add topics",
            variant: "destructive",
          });
          return;
        }

        const newItem = {
          ...formData,
          completion_date: formData.status === "completed" ? new Date().toISOString().split('T')[0] : null,
          created_by: user.id
        };
        
        const { error } = await supabase
          .from('syllabus_topics')
          .insert([newItem]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Syllabus item added successfully",
        });
      }
      
      setFormData({ subject: "", class: "", topic: "", description: "", status: "pending" as const });
      setIsDialogOpen(false);
      setEditingItem(null);
      fetchSyllabusItems(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save syllabus item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('syllabus_topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Syllabus item deleted successfully",
      });
      
      fetchSyllabusItems(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete syllabus item",
        variant: "destructive",
      });
    } finally {
      setDeleteSyllabusId(null);
    }
  };

  const handleEdit = (item: SyllabusItem) => {
    setEditingItem(item);
    setFormData({
      subject: item.subject,
      class: item.class,
      topic: item.topic,
      description: item.description,
      status: item.status
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getProgress = (classType: string, subject: string) => {
    const classItems = syllabusItems.filter(item => item.class === classType && item.subject === subject);
    const completedItems = classItems.filter(item => item.status === "completed");
    return classItems.length > 0 ? (completedItems.length / classItems.length) * 100 : 0;
  };

  const filterItemsByStatus = (status: string) => {
    return syllabusItems.filter(item => item.status === status);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Syllabus Tracker</h2>
          <p className="text-muted-foreground">Track completion of syllabus topics across all classes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setFormData({ subject: "", class: "", topic: "", description: "", status: "pending" as const });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Topic" : "Add New Topic"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the topic details below." : "Fill in the details to add a new topic to track."}
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
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Enter topic name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the topic"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: "pending" | "in-progress" | "completed") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update Topic" : "Add Topic"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((classType) => (
          <Card key={classType} className="shadow-elegant">
            <CardHeader>
              <CardTitle>{classType} Progress</CardTitle>
              <CardDescription>Subject-wise completion status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((subject) => {
                const progress = getProgress(classType, subject);
                return (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{subject}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topics List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {syllabusItems.map((item) => (
            <Card key={item.id} className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{item.topic}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{item.subject}</Badge>
                        <Badge variant="outline">{item.class}</Badge>
                        <Badge className={`text-white ${getStatusColor(item.status)}`}>
                          {statusOptions.find(s => s.value === item.status)?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteSyllabusId(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {statusOptions.map((status) => (
          <TabsContent key={status.value} value={status.value} className="space-y-4">
            {filterItemsByStatus(status.value).map((item) => (
              <Card key={item.id} className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <status.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{item.topic}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{item.subject}</Badge>
                          <Badge variant="outline">{item.class}</Badge>
                          {item.completion_date && (
                            <Badge variant="outline">Completed: {item.completion_date}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteSyllabusId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={deleteSyllabusId !== null} onOpenChange={() => setDeleteSyllabusId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the syllabus topic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSyllabusId && handleDeleteItem(deleteSyllabusId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
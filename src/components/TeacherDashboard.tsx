import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StudentManagement } from "@/components/StudentManagement";
import { FeeManagement } from "@/components/FeeManagement";
import { HomeworkManagement } from "@/components/HomeworkManagement";
import { TestManagement } from "@/components/TestManagement";
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  ClipboardList, 
  Calendar,
  TrendingUp,
  Bell,
  LogOut
} from "lucide-react";

export const TeacherDashboard = () => {
  const [username, setUsername] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/teacher-login');
        return;
      }
      
      // Fetch user profile to get the actual name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', session.user.id)
        .single();
      
      setUsername(profile?.name || session.user.email || "Teacher");
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/teacher-login');
      } else if (session) {
        // Fetch user profile when session changes
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', session.user.id)
          .single();
        
        setUsername(profile?.name || session.user.email || "Teacher");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const dashboardCards = [
    {
      title: "Total Students",
      value: "24",
      description: "Active students",
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-primary"
    },
    {
      title: "Monthly Revenue",
      value: "₹45,000",
      description: "Current month",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-gradient-accent"
    },
    {
      title: "Pending Fees",
      value: "₹8,500",
      description: "Outstanding amount",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-gradient-primary"
    },
    {
      title: "Active Classes",
      value: "12",
      description: "This week",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-gradient-accent"
    }
  ];

  const quickActions = [
    { 
      title: "Manage Students", 
      description: "Add/Edit student information", 
      icon: <Users className="h-5 w-5" />, 
      action: () => setActiveSection("students") 
    },
    { 
      title: "Fee Management", 
      description: "Track payments and dues", 
      icon: <DollarSign className="h-5 w-5" />, 
      action: () => setActiveSection("fees") 
    },
    { 
      title: "Create Tests", 
      description: "Generate question papers", 
      icon: <BookOpen className="h-5 w-5" />, 
      action: () => setActiveSection("tests") 
    },
    { 
      title: "Assign Homework", 
      description: "Post new assignments", 
      icon: <ClipboardList className="h-5 w-5" />, 
      action: () => setActiveSection("homework") 
    },
    { 
      title: "Class Schedule", 
      description: "Manage timings", 
      icon: <Calendar className="h-5 w-5" />, 
      action: () => setActiveSection("schedule") 
    },
    { 
      title: "Syllabus Tracker", 
      description: "Track completion", 
      icon: <TrendingUp className="h-5 w-5" />, 
      action: () => setActiveSection("syllabus") 
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "students":
        return <StudentManagement />;
      case "fees":
        return <FeeManagement />;
      case "homework":
        return <HomeworkManagement />;
      case "tests":
        return <TestManagement />;
      case "schedule":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Class Schedule</h2>
            <p className="text-muted-foreground">Schedule management feature coming soon...</p>
          </div>
        );
      case "syllabus":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Syllabus Tracker</h2>
            <p className="text-muted-foreground">Syllabus tracking feature coming soon...</p>
          </div>
        );
      default:
        return (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardCards.map((card, index) => (
                <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.color} text-white`}>
                      {card.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Frequently used functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={action.action}
                      className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted hover:text-foreground transition-all group"
                    >
                      <div className="flex items-center space-x-2">
                        {action.icon}
                        <span className="font-medium group-hover:text-foreground">{action.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-muted-foreground text-left">
                        {action.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dashboard Header */}
      <section className="bg-gradient-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {username}!</h1>
              <p className="text-primary-foreground/80">Teacher Dashboard - Tuition Plus</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeSection !== "dashboard" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveSection("dashboard")}
                  className="text-primary bg-white hover:bg-white/90"
                >
                  ← Back to Dashboard
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-primary bg-white hover:bg-white/90">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-primary bg-white hover:bg-white/90">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {renderContent()}
        </div>
      </section>
    </div>
  );
};
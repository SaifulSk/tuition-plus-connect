import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ParentReports } from "@/components/ParentReports";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  ClipboardCheck, 
  TrendingUp,
  Calendar,
  DollarSign,
  MessageCircle,
  Bell,
  LogOut
} from "lucide-react";

export const ParentDashboard = () => {
  const [username, setUsername] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/parent-login');
        return;
      }
      
      // Fetch user profile to get the actual name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', session.user.id)
        .single();
      
      setUsername(profile?.name || session.user.email || "Parent");
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/parent-login');
      } else if (session) {
        // Fetch user profile when session changes
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', session.user.id)
          .single();
        
        setUsername(profile?.name || session.user.email || "Parent");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate('/');
    }
  };

  const dashboardCards = [
    {
      title: "Child's Attendance",
      value: "95%",
      description: "This month",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-gradient-primary"
    },
    {
      title: "Homework Completion",
      value: "8/10",
      description: "This week",
      icon: <ClipboardCheck className="h-6 w-6" />,
      color: "bg-gradient-accent"
    },
    {
      title: "Average Performance",
      value: "B+",
      description: "Current grade",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-gradient-primary"
    },
    {
      title: "Fee Status",
      value: "Paid",
      description: "Current month",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-gradient-accent"
    }
  ];

  const quickActions = [
    { title: "Child's Progress", description: "View detailed reports", icon: <TrendingUp className="h-5 w-5" />, action: () => setActiveSection("reports") },
    { title: "Acknowledge Homework", description: "Review and approve", icon: <ClipboardCheck className="h-5 w-5" />, action: () => setActiveSection("homework") },
    { title: "Fee Payments", description: "View payment history", icon: <DollarSign className="h-5 w-5" />, action: () => setActiveSection("fees") },
    { title: "Teacher Communication", description: "Send messages", icon: <MessageCircle className="h-5 w-5" />, action: () => setActiveSection("communication") },
    { title: "Attendance Report", description: "Track presence", icon: <Calendar className="h-5 w-5" />, action: () => setActiveSection("attendance") },
    { title: "Child Profile", description: "Update information", icon: <User className="h-5 w-5" />, action: () => setActiveSection("profile") }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "reports":
        return <ParentReports />;
      case "homework":
        return <div className="text-center py-8"><ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Homework Review</h3><p className="text-muted-foreground">Review and acknowledge your child's homework submissions.</p></div>;
      case "fees":
        return <div className="text-center py-8"><DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Fee Management</h3><p className="text-muted-foreground">View payment history and upcoming dues.</p></div>;
      case "communication":
        return <div className="text-center py-8"><MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Teacher Communication</h3><p className="text-muted-foreground">Send messages to teachers and view updates.</p></div>;
      case "attendance":
        return <div className="text-center py-8"><Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Attendance Tracking</h3><p className="text-muted-foreground">Monitor your child's class attendance.</p></div>;
      case "profile":
        return <div className="text-center py-8"><User className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Child Profile</h3><p className="text-muted-foreground">Update your child's information and preferences.</p></div>;
      default:
        return null;
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
              <h1 className="text-3xl font-bold">Welcome, {username}!</h1>
              <p className="text-primary-foreground/80">Parent Dashboard - Monitor your child's progress</p>
            </div>
            <div className="flex items-center space-x-4">
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
          {activeSection === "dashboard" ? (
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
                  <CardDescription>Monitor and support your child's education</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={action.action}
                        className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          {action.icon}
                          <span className="font-medium">{action.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-left">
                          {action.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setActiveSection("dashboard")}>
                  ← Back to Dashboard
                </Button>
              </div>
              {renderContent()}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
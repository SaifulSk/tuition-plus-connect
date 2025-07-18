import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { 
  BookOpen, 
  ClipboardList, 
  Trophy,
  MessageCircle,
  Calendar,
  TrendingUp,
  Bell,
  LogOut
} from "lucide-react";

export const StudentDashboard = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const userType = localStorage.getItem('userType');
    
    if (!storedUsername || userType !== 'student') {
      navigate('/');
      return;
    }
    
    setUsername(storedUsername);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    navigate('/');
  };

  const dashboardCards = [
    {
      title: "Pending Homework",
      value: "3",
      description: "Due this week",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "bg-gradient-accent"
    },
    {
      title: "Upcoming Tests",
      value: "2",
      description: "This month",
      icon: <Trophy className="h-6 w-6" />,
      color: "bg-gradient-primary"
    },
    {
      title: "Average Score",
      value: "87%",
      description: "Last 5 tests",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-gradient-accent"
    },
    {
      title: "Classes This Week",
      value: "5",
      description: "Scheduled sessions",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-gradient-primary"
    }
  ];

  const quickActions = [
    { title: "View Homework", description: "Check pending assignments", icon: <ClipboardList className="h-5 w-5" /> },
    { title: "Take Practice Test", description: "Attempt mock tests", icon: <Trophy className="h-5 w-5" /> },
    { title: "Post Doubt", description: "Ask your teacher", icon: <MessageCircle className="h-5 w-5" /> },
    { title: "View Schedule", description: "Check class timings", icon: <Calendar className="h-5 w-5" /> },
    { title: "Study Material", description: "Access syllabus", icon: <BookOpen className="h-5 w-5" /> },
    { title: "Progress Report", description: "View your performance", icon: <TrendingUp className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dashboard Header */}
      <section className="bg-gradient-accent text-accent-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hello, {username}!</h1>
              <p className="text-accent-foreground/80">Student Dashboard - Ready to learn?</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="text-accent bg-white hover:bg-white/90">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-accent bg-white hover:bg-white/90">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
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
              <CardDescription>Access your learning tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
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
        </div>
      </section>
    </div>
  );
};
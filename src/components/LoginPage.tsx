import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  userType: "teacher" | "student" | "parent";
}

export const LoginPage = ({ userType }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const navigate = useNavigate();

  const getUserTypeConfig = () => {
    switch (userType) {
      case "teacher":
        return {
          title: "Teacher Login",
          description: "Access your teaching dashboard and manage your students",
          placeholder: "Enter teacher ID or email",
          dashboardRoute: "/teacher-dashboard"
        };
      case "student":
        return {
          title: "Student Login", 
          description: "Access your homework, tests, and progress reports",
          placeholder: "Enter student ID or email",
          dashboardRoute: "/student-dashboard"
        };
      case "parent":
        return {
          title: "Parent Login",
          description: "Monitor your child's academic progress and activities",
          placeholder: "Enter parent ID or email", 
          dashboardRoute: "/parent-dashboard"
        };
    }
  };

  const config = getUserTypeConfig();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll simulate a successful login
    // Later we'll implement actual authentication with JSON files
    if (credentials.username && credentials.password) {
      // Store login info in localStorage for now
      localStorage.setItem('userType', userType);
      localStorage.setItem('username', credentials.username);
      navigate(config.dashboardRoute);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-muted/20 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-elegant">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary text-primary-foreground w-16 h-16 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={config.placeholder}
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" variant="gradient" className="w-full" size="lg">
                    Login
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/")}
                    className="text-muted-foreground"
                  >
                    ← Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};
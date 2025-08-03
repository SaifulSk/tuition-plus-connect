import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  userType: "teacher" | "student" | "parent";
}

export const LoginPage = ({ userType }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserTypeConfig = () => {
    switch (userType) {
      case "teacher":
        return {
          title: "Teacher Login",
          description: "Access your teaching dashboard and manage your students",
          placeholder: "Enter your email",
          dashboardRoute: "/teacher-dashboard"
        };
      case "student":
        return {
          title: "Student Login", 
          description: "Access your homework, tests, and progress reports",
          placeholder: "Enter your email",
          dashboardRoute: "/student-dashboard"
        };
      case "parent":
        return {
          title: "Parent Login",
          description: "Monitor your child's academic progress and activities",
          placeholder: "Enter your email", 
          dashboardRoute: "/parent-dashboard"
        };
    }
  };

  const config = getUserTypeConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        navigate(config.dashboardRoute);
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  <img 
                    src="/lovable-uploads/1.png" 
                    alt="Tuition Plus Logo" 
                    className="h-10 w-auto"
                  />
                </div>
                <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={config.placeholder}
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
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
                  
                  <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
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

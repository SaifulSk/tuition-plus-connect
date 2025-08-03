import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    phone: "",
    userType: "student" as "teacher" | "student" | "parent"
  });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redirect based on user type (default to teacher dashboard)
        navigate('/teacher-dashboard');
      }
    };
    
    checkAuth();
    
    // Get user type from URL params
    const type = searchParams.get('type') as "teacher" | "student" | "parent";
    if (type) {
      setCredentials(prev => ({ ...prev, userType: type }));
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login
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
            description: "Welcome back!",
          });
          
          // Redirect based on user type
          const dashboardRoute = getDashboardRoute();
          navigate(dashboardRoute);
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: credentials.username,
              name: credentials.name,
              user_type: credentials.userType,
              phone: credentials.phone
            }
          }
        });

        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Account Created",
            description: "Please check your email to confirm your account.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: isLogin ? "Login Failed" : "Signup Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardRoute = () => {
    switch (credentials.userType) {
      case "teacher":
        return "/teacher-dashboard";
      case "student":
        return "/student-dashboard";
      case "parent":
        return "/parent-dashboard";
      default:
        return "/teacher-dashboard";
    }
  };

  const getUserTypeConfig = () => {
    switch (credentials.userType) {
      case "teacher":
        return {
          title: isLogin ? "Teacher Login" : "Teacher Signup",
          description: isLogin 
            ? "Access your teaching dashboard and manage your students"
            : "Create your teacher account to start managing students"
        };
      case "student":
        return {
          title: isLogin ? "Student Login" : "Student Signup",
          description: isLogin 
            ? "Access your homework, tests, and progress reports"
            : "Create your student account to track your progress"
        };
      case "parent":
        return {
          title: isLogin ? "Parent Login" : "Parent Signup",
          description: isLogin 
            ? "Monitor your child's academic progress and activities"
            : "Create your parent account to monitor your child's progress"
        };
    }
  };

  const config = getUserTypeConfig();

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
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={credentials.name}
                          onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          value={credentials.username}
                          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={credentials.phone}
                          onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="userType">User Type</Label>
                        <Select value={credentials.userType} onValueChange={(value: "teacher" | "student" | "parent") => setCredentials(prev => ({ ...prev, userType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
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
                    {isLoading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Login" : "Create Account")}
                  </Button>
                </form>
                
                <div className="mt-6 text-center space-y-4">
                  <Button 
                    variant="link" 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-muted-foreground"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                  
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/")}
                    className="text-muted-foreground block"
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
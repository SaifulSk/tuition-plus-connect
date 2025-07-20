import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginCard } from "@/components/LoginCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, UserCheck, BookOpen, Calculator, Trophy, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = (userType: string) => {
    // Navigate to the appropriate login page
    navigate(`/${userType}-login`);
  };

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Student Management",
      description: "Manage student timings, schedules, and individual attention"
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Fee Management",
      description: "Track payments, fee structure, and due notifications"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Tests & Assessments",
      description: "Create random papers, chapter-wise tests, and track progress"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Homework Tracking",
      description: "Assign homework, track completion, and parent acknowledgment"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20">
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/1.png" 
                alt="Tuition Plus Logo" 
                className="h-40 w-auto drop-shadow-2xl animate-fade-in"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to <span className="text-accent-foreground">Tuition Plus</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 animate-fade-in">
              Empowering Young Minds Since 2018
            </p>
            <p className="text-lg mb-12 text-primary-foreground/80 animate-fade-in">
              Streamline your coaching center operations with our all-in-one platform designed for teachers, students, and parents.
            </p>
            <Button variant="hero" size="lg" className="animate-slide-in bg-white text-primary hover:bg-white/90">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Login Options */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Access Level</h2>
            <p className="text-lg text-muted-foreground">Select your role to access personalized features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <LoginCard
              title="Teacher"
              description="Manage students, create tests, track progress, and handle fee management"
              icon={<GraduationCap className="h-8 w-8" />}
              onClick={() => handleLogin("teacher")}
              variant="teacher"
            />
            <LoginCard
              title="Student"
              description="Access homework, take tests, view results, and post doubts"
              icon={<Users className="h-8 w-8" />}
              onClick={() => handleLogin("student")}
              variant="student"
            />
            <LoginCard
              title="Parent"
              description="Monitor child's progress, acknowledge homework, and track performance"
              icon={<UserCheck className="h-8 w-8" />}
              onClick={() => handleLogin("parent")}
              variant="parent"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need to run a successful coaching center</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-accent text-accent-foreground w-16 h-16 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, UserCheck } from "lucide-react";

interface LoginCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "teacher" | "student" | "parent";
}

export const LoginCard = ({ title, description, icon, onClick, variant = "student" }: LoginCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "teacher":
        return "hover:border-primary hover:shadow-elegant";
      case "student":
        return "hover:border-accent hover:shadow-elegant";
      case "parent":
        return "hover:border-primary hover:shadow-elegant";
      default:
        return "hover:border-primary hover:shadow-elegant";
    }
  };

  return (
    <Card className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${getVariantClasses()}`} onClick={onClick}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary text-primary-foreground w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          Login as {title}
        </Button>
      </CardContent>
    </Card>
  );
};
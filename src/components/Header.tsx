import { Phone, Mail } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-elegant">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/1.png" 
              alt="Tuition Plus Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">Tuition Plus</h1>
              <p className="text-sm text-primary-foreground/80">Empowering Young Minds</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">+91 9999999999</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">info@tuitionplus.com</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

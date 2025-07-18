import { GraduationCap, MapPin, Phone, Mail, Clock } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Tuition Plus</h3>
            </div>
            <p className="text-primary-foreground/80 mb-4">
              Empowering students with quality education and personalized learning experiences. 
              Building futures, one student at a time.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-sm">123 Education Street, Learning City, LC 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-sm">+91 9999999999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-sm">info@tuitionplus.com</span>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">Monday - Saturday</p>
                  <p className="text-xs text-primary-foreground/80">9:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">Sunday</p>
                  <p className="text-xs text-primary-foreground/80">10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Tuition Plus. All rights reserved. Built with ❤️ for education.
          </p>
        </div>
      </div>
    </footer>
  );
};
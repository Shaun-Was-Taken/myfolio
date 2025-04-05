import { Mail, MapPin, Phone, Linkedin } from "lucide-react";

interface ContactSectionProps {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

const ContactSection = ({ email, phone, location, linkedin }: ContactSectionProps) => {
  return (
    <section id="contact" className="py-16">
      <div className="container">
        <h2 className="section-title">Get in Touch</h2>
        <p className="mb-8">
          Interested in connecting? Feel free to reach out via LinkedIn or email
          with a brief message. I'm open to professional discussions and
          opportunities!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {email && (
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </div>
            )}
            
            {phone && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            )}
            
            {location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3" />
                <span>{location}</span>
              </div>
            )}
            
            {linkedin && (
              <div className="flex items-center">
                <Linkedin className="w-5 h-5 mr-3" />
                <a 
                  href={linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
          
          <div>
            {email && (
              <a 
                href={`mailto:${email}`} 
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                Send Message
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
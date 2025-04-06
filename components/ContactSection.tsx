import { Mail, MapPin, Phone, Linkedin } from "lucide-react";

interface ContactSectionProps {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

const ContactSection = ({
  email,
  phone,
  location,
  linkedin,
}: ContactSectionProps) => {
  return (
    <section id="contact" className="py-16">
      <div className="container">
        <h2 className="section-title border-b">Get in Touch</h2>
        <div className="flex">
          <p className="mb-8">
            Interested in connecting? Feel free to reach out via LinkedIn or
            email with a brief message. I'm open to professional discussions and
            opportunities!
          </p>

          <div className="flex-1">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

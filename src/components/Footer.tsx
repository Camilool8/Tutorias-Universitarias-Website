// Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  HomeIcon,
  Users,
  GraduationCap,
  HelpCircle,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

const Footer: React.FC = () => {
  const navigation = [
    { path: "/", icon: <HomeIcon size={18} />, label: "Inicio" },
    { path: "/about", icon: <Users size={18} />, label: "Sobre Nosotros" },
    {
      path: "/services",
      icon: <GraduationCap size={18} />,
      label: "Servicios",
    },
    { path: "/turnitin", icon: <ShieldCheck size={18} />, label: "Turnitin" },
    { path: "/contact", icon: <HelpCircle size={18} />, label: "FAQ" },
    { path: "/blog", icon: <BookOpen size={18} />, label: "Blog" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src="/images/logo.svg"
                alt="Logo"
                className="w-12 h-12 transition-transform group-hover:scale-110"
              />
              <span className="text-xl font-bold text-white">
                Tutorías Universitarias
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Haciendo la vida estudiantil más fácil y divertida desde 2019.
              Comprometidos con tu éxito académico.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Enlaces Rápidos
            </h3>
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navigation.map((item) => (
                <FooterLink
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </nav>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <div className="space-y-3">
              <a
                href={`mailto:${atob(
                  "c29wb3J0ZS50dXRvcmlhc3VuaXZlcnNpdGFyaWFzQGdtYWlsLmNvbQ=="
                )}`}
                className="flex items-center space-x-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Mail size={18} />
                <span>soporte.tutoriasuniversitarias@gmail.com</span>
              </a>
              <a
                href="tel:+18492705605"
                className="flex items-center space-x-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Phone size={18} />
                <span>+1 849 270 5605</span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Síguenos</h3>
            <div className="flex space-x-4">
              <SocialLink
                href="https://www.facebook.com/profile.php?id=100088640089400"
                icon={<Facebook size={24} />}
                label="Facebook"
              />
              <SocialLink
                href="https://www.instagram.com/tutorias_universitarias/"
                icon={<Instagram size={24} />}
                label="Instagram"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Tutorías Universitarias. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
}> = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 text-sm hover:text-blue-400 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const SocialLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
}> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors group"
    aria-label={label}
  >
    <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
      {icon}
    </span>
  </a>
);

export default Footer;

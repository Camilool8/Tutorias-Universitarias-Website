import React from 'react';
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Home,
  Info,
  Briefcase,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <img
                className="mr-2"
                src="/images/logo.svg"
                alt="Logo"
                width={40}
                height={40}
              />
              Tutorias Universitarias
            </h3>
            <p className="text-gray-400">
              Haciendo la vida estudiantil más fácil y divertida desde 2019.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <FooterLink href="/" icon={<Home size={18} />} text="Inicio" />
              <FooterLink
                href="/cotizar"
                icon={<BookOpen size={18} />}
                text="Cotizar"
              />
              <FooterLink
                href="/about"
                icon={<Info size={18} />}
                text="Sobre Nosotros"
              />
              <FooterLink
                href="/services"
                icon={<Briefcase size={18} />}
                text="Servicios"
              />
              <FooterLink
                href="/contact"
                icon={<HelpCircle size={18} />}
                text="FAQ"
              />
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <FooterLink
                href="mailto:info@tutoriasuniversitariasrd.com"
                icon={<Mail size={18} />}
                text="info@tutoriasuniversitarias.com"
              />
              <FooterLink
                href="tel:+34608837272"
                icon={<Phone size={18} />}
                text="+34 608 83 72 72"
              />
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=100088640089400&mibextid=LQQJ4d"
                className="hover:text-blue-400 transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/tutorias_universitarias/"
                className="hover:text-blue-400 transition-colors"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>
            &copy; 2024 Tutorias Universitarias. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  text: string;
}> = ({ href, icon, text }) => (
  <li>
    <a
      href={href}
      className="flex items-center hover:text-blue-400 transition-colors"
    >
      {icon}
      <span className="ml-2">{text}</span>
    </a>
  </li>
);

export default Footer;

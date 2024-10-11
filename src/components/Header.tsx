import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Menu,
  X,
  Home,
  Info,
  Briefcase,
  HelpCircle,
} from "lucide-react";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold"
          >
            <img src="/images/logo.svg" alt="Logo" width={45} height={45} />
            <span className="hidden sm:inline">Tutorias Universitarias</span>
          </Link>
          <nav className="hidden lg:flex space-x-4">
            <NavLink to="/" icon={<Home size={18} />} text="Inicio" />
            <NavLink
              to="/about"
              icon={<Info size={18} />}
              text="Sobre Nosotros"
            />
            <NavLink
              to="/services"
              icon={<Briefcase size={18} />}
              text="Servicios"
            />
            <NavLink to="/faq" icon={<HelpCircle size={18} />} text="FAQ" />
          </nav>
          <div className="hidden lg:block">
            <Link
              to="/cotizar"
              className="flex items-center space-x-1 bg-yellow-400 text-blue-800 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors"
            >
              <Calculator size={18} />
              <span>Cotiza Con Nosotros</span>
            </Link>
          </div>
          <button
            className="lg:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center space-y-4 py-4">
          <NavLink
            to="/"
            icon={<Home size={18} />}
            text="Inicio"
            onClick={toggleMenu}
          />
          <NavLink
            to="/about"
            icon={<Info size={18} />}
            text="Sobre Nosotros"
            onClick={toggleMenu}
          />
          <NavLink
            to="/services"
            icon={<Briefcase size={18} />}
            text="Servicios"
            onClick={toggleMenu}
          />
          <NavLink
            to="/faq"
            icon={<HelpCircle size={18} />}
            text="FAQ"
            onClick={toggleMenu}
          />
          <Link
            to="/cotizar"
            className="flex items-center space-x-1 bg-yellow-400 text-blue-800 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors"
            onClick={toggleMenu}
          >
            <Calculator size={18} />
            <span>Cotiza Con Nosotros</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

const NavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}> = ({ to, icon, text, onClick }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 hover:text-yellow-300 transition-colors px-2 py-1"
    onClick={onClick}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Header;

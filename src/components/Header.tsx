import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calculator,
  Menu,
  X,
  HomeIcon,
  Users,
  GraduationCap,
  HelpCircle,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (isMenuOpen && event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    // Agregar event listeners
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    window.addEventListener("scroll", handleScroll);

    // Limpieza de event listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]); // Solo se re-ejecuta cuando cambia isMenuOpen

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-300 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold transition-transform hover:scale-105"
          >
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <span className="hidden sm:inline text-lg sm:text-xl">
              Tutorías Universitarias
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                text={item.label}
                isActive={location.pathname === item.path}
              />
            ))}
            <Link
              to="/cotizar"
              className="ml-4 flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105 bg-yellow-400 text-blue-800 hover:bg-yellow-300"
            >
              <Calculator size={18} />
              <span>Cotizar</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={buttonRef}
            className="lg:hidden p-2 rounded-lg hover:bg-opacity-10 hover:bg-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        ref={menuRef}
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container mx-auto px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <MobileNavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              text={item.label}
              isActive={location.pathname === item.path}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
          <Link
            to="/cotizar"
            className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-yellow-400 text-blue-800 font-medium hover:bg-yellow-300 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <Calculator size={18} />
            <span>Cotizar</span>
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
  isActive: boolean;
}> = ({ to, icon, text, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
      isActive
        ? "bg-white bg-opacity-10 text-white"
        : "text-white hover:bg-white hover:bg-opacity-10"
    }`}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </Link>
);

const MobileNavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ to, icon, text, isActive, onClick }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? "bg-white bg-opacity-10 text-white"
        : "text-white hover:bg-white hover:bg-opacity-5"
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </Link>
);

export default Header;

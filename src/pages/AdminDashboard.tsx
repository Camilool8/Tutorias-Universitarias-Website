// AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ClipboardList, // For Solicitudes (better represents a list of tasks/submissions)
  LineChart, // For Analytics (better represents data trends)
  Users, // For Leads (represents people/contacts)
  PieChart, // For Leads Analytics (better for demographic analysis)
  Layout, // For Blog (represents content management)
  Menu,
  AlertCircle,
} from "lucide-react";
import SubmissionsList from "../components/SubmissionsList";
import Analytics from "../components/Analytics";
import LeadsList from "../components/LeadsList";
import LeadsAnalytics from "../components/LeadsAnalytics";
import BlogAdmin from "../components/BlogAdmin";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    {
      id: "solicitudes",
      label: "Solicitudes",
      icon: <ClipboardList size={18} />,
      description: "Gestionar solicitudes de tutoría", // Optional tooltip
    },
    {
      id: "analiticas",
      label: "Analíticas",
      icon: <LineChart size={18} />,
      description: "Estadísticas y métricas generales",
    },
    {
      id: "leads",
      label: "Leads",
      icon: <Users size={18} />,
      description: "Gestión de contactos y prospectos",
    },
    {
      id: "leads-analytics",
      label: "Análisis de Leads",
      icon: <PieChart size={18} />,
      description: "Análisis demográfico y conversión",
    },
    {
      id: "blog",
      label: "Blog",
      icon: <Layout size={18} />,
      description: "Gestión de contenidos del blog",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-indigo-700"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold ml-2">
                Panel de Administración
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded transition duration-300 ease-in-out text-sm"
            >
              <LogOut size={16} className="mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`bg-white w-64 min-h-screen transition-transform duration-300 transform pt-16 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition duration-300 ease-in-out ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <span className="ml-3">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Desktop Tabs */}
        <div className="hidden md:flex mb-6 space-x-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              text={tab.label}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {activeTab === "solicitudes" && (
            <SubmissionsList setError={setError} />
          )}
          {activeTab === "analiticas" && <Analytics setError={setError} />}
          {activeTab === "leads" && <LeadsList setError={setError} />}
          {activeTab === "leads-analytics" && <LeadsAnalytics />}
          {activeTab === "blog" && <BlogAdmin />}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
}> = ({ active, onClick, icon, text }) => (
  <button
    className={`flex items-center px-4 py-2.5 rounded-lg transition duration-300 ease-in-out whitespace-nowrap ${
      active
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-2 font-medium">{text}</span>
  </button>
);

export default AdminDashboard;

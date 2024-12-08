// AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  FileText,
  BarChart2,
  Mail,
  AlertCircle,
  PieChartIcon as ChartPieIcon,
} from "lucide-react";
import SubmissionsList from "../components/SubmissionsList";
import Analytics from "../components/Analytics";
import LeadsList from "../components/LeadsList";
import LeadsAnalytics from "../components/LeadsAnalytics"; // Importamos el nuevo componente

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <div className="relative min-h-screen bg-gray-100 mt-3 sm:mt-3 md:mt-3 lg:mt-8 xl:mt-3">
      <nav className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded transition duration-300 ease-in-out"
          >
            <LogOut size={18} className="mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </nav>
      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        )}
        <div className="flex flex-wrap mb-6 space-x-4 justify-start">
          <TabButton
            active={activeTab === "solicitudes"}
            onClick={() => setActiveTab("solicitudes")}
            icon={<FileText size={18} />}
            text="Solicitudes"
          />
          <TabButton
            active={activeTab === "analiticas"}
            onClick={() => setActiveTab("analiticas")}
            icon={<BarChart2 size={18} />}
            text="Analíticas"
          />
          <TabButton
            active={activeTab === "leads"}
            onClick={() => setActiveTab("leads")}
            icon={<Mail size={18} />}
            text="Leads"
          />
          <TabButton
            active={activeTab === "leads-analytics"}
            onClick={() => setActiveTab("leads-analytics")}
            icon={<ChartPieIcon size={18} />}
            text="Análisis de Leads"
          />
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === "solicitudes" && <SubmissionsList setError={setError} />}
        {activeTab === "analiticas" && <Analytics setError={setError} />}
        {activeTab === "leads" && <LeadsList setError={setError} />}
        {activeTab === "leads-analytics" && <LeadsAnalytics />}
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
    className={`flex items-center px-4 py-2 mb-4 rounded-lg transition duration-300 ease-in-out ${
      active
        ? "bg-indigo-600 text-white"
        : "bg-white text-indigo-600 hover:bg-indigo-100"
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </button>
);

export default AdminDashboard;

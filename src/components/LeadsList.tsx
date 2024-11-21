import React, { useState, useEffect } from "react";
import {
  Search,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader,
  CheckCircle,
  AlertTriangle,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BulkEmailSender from "./BulkEmailSender";

interface Lead {
  id: string;
  email: string;
  status: string;
  created_at: string;
  notes: string;
  last_contacted: string | null;
}

interface LeadsListProps {
  setError: (error: string) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ setError }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkEmailSender, setShowBulkEmailSender] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const statusStyles = {
    pending: { bg: "bg-yellow-100 text-yellow-800", icon: "🕒" },
    contacted: { bg: "bg-blue-100 text-blue-800", icon: "📞" },
    converted: { bg: "bg-green-100 text-green-800", icon: "✨" },
    not_interested: { bg: "bg-gray-100 text-gray-800", icon: "❌" },
  };

  const showFeedback = (type: string, message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al obtener los leads");

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar los leads. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Error al actualizar el estado");

      setLeads(
        leads.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
      showFeedback("success", "Estado actualizado correctamente");
    } catch (error) {
      showFeedback("error", "Error al actualizar el estado");
    }
  };

  const handleNotesChange = async (id: string, notes: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error("Error al actualizar las notas");

      setLeads(
        leads.map((lead) => (lead.id === id ? { ...lead, notes } : lead))
      );
      showFeedback("success", "Notas actualizadas correctamente");
    } catch (error) {
      showFeedback("error", "Error al actualizar las notas");
    }
  };

  const filteredLeads = leads
    .filter(
      (lead) =>
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((lead) => filter === "all" || lead.status === filter);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  // Filtrar leads pendientes para el envío masivo
  const pendingLeads = leads.filter((lead) => lead.status === "pending");

  // Render del botón y modal de envío masivo
  const renderBulkEmailButton = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ml-2"
    >
      {pendingLeads.length > 0 && (
        <button
          onClick={() => setShowBulkEmailSender(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                   hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Send size={18} />
          <span className="hidden sm:inline">Envío Masivo</span>
          <span className="inline sm:hidden">Enviar</span>
          <span
            className="inline-flex items-center justify-center w-6 h-6 ml-2 text-xs 
                         bg-white text-indigo-600 rounded-full"
          >
            {pendingLeads.length}
          </span>
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Feedback Message */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
              feedback.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de envío masivo */}
      {showBulkEmailSender && (
        <BulkEmailSender
          onClose={() => setShowBulkEmailSender(false)}
          pendingLeads={pendingLeads}
          onLeadsUpdated={fetchLeads}
          setError={setError}
        />
      )}

      {/* Barra de controles superior */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Buscador */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          {/* Filtro de estado */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                     focus:ring-indigo-500 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">🕒 Pendiente</option>
            <option value="contacted">📞 Contactado</option>
            <option value="converted">✨ Convertido</option>
            <option value="not_interested">❌ No interesado</option>
          </select>

          {/* Botón de envío masivo */}
          {renderBulkEmailButton()}
        </div>

        {/* Mostrar total de leads filtrados */}
        <div className="text-sm text-gray-600">
          {filteredLeads.length} leads encontrados
        </div>
      </div>

      {/* Vista móvil */}
      <div className="sm:hidden space-y-4">
        {currentItems.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow-md rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">{lead.email}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => window.open(`mailto:${lead.email}`)}
                className="text-indigo-600 hover:text-indigo-900 p-2 transition-colors duration-200"
              >
                <Mail size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  statusStyles[lead.status]?.bg
                }`}
              >
                <option value="pending">🕒 Pendiente</option>
                <option value="contacted">📞 Contactado</option>
                <option value="converted">✨ Convertido</option>
                <option value="not_interested">❌ No interesado</option>
              </select>

              <textarea
                value={lead.notes || ""}
                onChange={(e) => handleNotesChange(lead.id, e.target.value)}
                placeholder="Agregar notas..."
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                          bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vista desktop */}
      <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Notas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((lead) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      handleStatusChange(lead.id, e.target.value)
                    }
                    className={`text-sm border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                              transition-colors duration-200 ${
                                statusStyles[lead.status]?.bg
                              }`}
                  >
                    <option value="pending">🕒 Pendiente</option>
                    <option value="contacted">📞 Contactado</option>
                    <option value="converted">✨ Convertido</option>
                    <option value="not_interested">❌ No interesado</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <textarea
                    value={lead.notes || ""}
                    onChange={(e) => handleNotesChange(lead.id, e.target.value)}
                    placeholder="Agregar notas..."
                    rows={1}
                    className="text-sm border rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500
                              bg-gray-50 hover:bg-white transition-colors duration-200"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => window.open(`mailto:${lead.email}`)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                  >
                    <Mail size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <p className="text-sm text-gray-700">
          Mostrando {indexOfFirstItem + 1} a{" "}
          {Math.min(indexOfLastItem, filteredLeads.length)} de{" "}
          {filteredLeads.length} resultados
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={indexOfLastItem >= filteredLeads.length}
            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  AlertCircle,
  UserCheck,
  UserMinus,
  Search,
  Mail,
  X,
  EyeIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Mapeo de razones de deserción consistente con UnsubscribePage
const unsubscribeReasons = {
  frequency: "Recibo demasiados correos",
  relevance: "El contenido no es relevante para mí",
  noLongerNeed: "Ya no necesito el servicio",
  other: "Otro motivo",
};

const LeadAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");

      // Obtener datos de leads
      const leadsResponse = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Obtener datos de submisiones
      const submissionsResponse = await fetch("/api/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!leadsResponse.ok || !submissionsResponse.ok) {
        throw new Error("Error fetching data");
      }

      const leadsData = await leadsResponse.json();
      const submissionsData = await submissionsResponse.json();

      // Procesar y combinar datos
      const processedData = processAnalytics(leadsData, submissionsData);
      setAnalyticsData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalytics = (leads, submissions) => {
    const statusCount = {
      pending: 0,
      contacted: 0,
      converted: 0,
      not_interested: 0,
    };

    const leadsWithDetails = leads.map((lead) => {
      statusCount[lead.status]++;

      const leadSubmissions = submissions.filter(
        (sub) => sub.email === lead.email
      );

      return {
        ...lead,
        submissions: leadSubmissions.length,
        totalValue: leadSubmissions.reduce(
          (sum, sub) => sum + (sub.profit || 0),
          0
        ),
        lastContact: lead.last_contacted_at || lead.created_at,
        daysSinceContact: Math.floor(
          (new Date() - new Date(lead.last_contacted_at || lead.created_at)) /
            (1000 * 60 * 60 * 24)
        ),
      };
    });

    return {
      statusCount,
      leadsWithDetails,
      totalLeads: leads.length,
      activeLeads: leads.filter((l) => l.status !== "not_interested").length,
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700 flex items-center">
        <AlertCircle className="mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={analyticsData.totalLeads}
          icon={<Users />}
          color="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Leads Activos"
          value={analyticsData.activeLeads}
          icon={<UserCheck />}
          color="bg-green-100 text-green-800"
        />
        <StatCard
          title="Tasa de Conversión"
          value={`${(
            (analyticsData.statusCount.converted / analyticsData.totalLeads) *
            100
          ).toFixed(1)}%`}
          icon={<UserCheck />}
          color="bg-indigo-100 text-indigo-800"
        />
        <StatCard
          title="Tasa de Deserción"
          value={`${(
            (analyticsData.statusCount.not_interested /
              analyticsData.totalLeads) *
            100
          ).toFixed(1)}%`}
          icon={<UserMinus />}
          color="bg-red-100 text-red-800"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución de Estados">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analyticsData.statusCount).map(
                  ([key, value]) => ({
                    name: key,
                    value,
                  })
                )}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {Object.entries(analyticsData.statusCount).map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getStatusColor(entry[0])}
                    />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Actividad Reciente">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={getActivityData(analyticsData.leadsWithDetails)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detailed Leads List */}
      <LeadsList
        leads={analyticsData.leadsWithDetails}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
      />
    </div>
  );
};

// Componente de tarjeta estadística
const StatCard = ({ title, value, icon, color }) => (
  <div
    className={`${color} p-4 rounded-lg shadow flex items-center justify-between`}
  >
    <div>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="w-12 h-12 flex items-center justify-center">{icon}</div>
  </div>
);

// Componente de tarjeta para gráficos
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

// Modal de detalles
const DetailsModal = ({ lead, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 flex items-center justify-center overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl mx-auto my-8">
        <div className="max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Detalles del Lead
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="space-y-6">
              {/* Información básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 break-all">
                      {lead.email}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <StatusBadge status={lead.status} />
                    <span className="text-sm text-gray-500">
                      Último contacto: {formatDate(lead.lastContact)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas en grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-indigo-700 font-medium">Submissions</h4>
                    <span className="text-2xl font-bold text-indigo-800">
                      {lead.submissions}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-green-700 font-medium">Valor Total</h4>
                    <span className="text-2xl font-bold text-green-800">
                      ${lead.totalValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de deserción si aplica */}
              {lead.status === "not_interested" && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-red-700 font-medium mb-3">
                    Información de Deserción
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-red-600">
                      <span className="font-medium mr-2">Fecha:</span>
                      {formatDate(lead.unsubscribed_at)}
                    </div>
                    {lead.unsubscribe_reason && (
                      <div className="text-sm text-red-600">
                        <span className="font-medium">Razón:</span>
                        <p className="mt-1 bg-white p-3 rounded-md border border-red-100">
                          {unsubscribeReasons[lead.unsubscribe_reason] ||
                            lead.unsubscribe_reason}
                        </p>
                      </div>
                    )}
                    {lead.unsubscribe_feedback && (
                      <div className="text-sm text-red-600">
                        <span className="font-medium">Feedback:</span>
                        <p className="mt-1 bg-white p-3 rounded-md border border-red-100">
                          {lead.unsubscribe_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas */}
              {lead.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-gray-700 font-medium mb-3">Notas</h4>
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                      {lead.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadsList = ({
  leads,
  searchTerm,
  setSearchTerm,
  selectedLead,
  setSelectedLead,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Función unificada de filtrado
  const getFilteredLeads = () => {
    return leads.filter((lead) => {
      const searchString = `${lead.email} ${lead.unsubscribe_reason || ""} ${
        lead.notes || ""
      }`.toLowerCase();
      const isDeserted =
        lead.status === "not_interested" || lead.unsubscribe_reason;
      return (
        searchString.includes(searchTerm.toLowerCase()) &&
        (isDeserted ? true : lead.status !== "not_interested")
      );
    });
  };

  const filteredLeads = getFilteredLeads();
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const element = document.getElementById(`lead-${currentPage}`);
    element?.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div id={`lead-${currentPage}`} className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold">Lista Detallada de Leads</h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar leads..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>

        {/* Lista para móviles */}
        <div className="block sm:hidden">
          {currentItems.map((lead) => (
            <div key={lead.id} className="p-4 border-b last:border-b-0">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-medium text-sm break-all">
                    {lead.email}
                  </span>
                  <StatusBadge status={lead.status} />
                </div>
                <div className="text-sm text-gray-600">
                  <p>Última interacción: {formatDate(lead.lastContact)}</p>
                  <p>Submissions: {lead.submissions}</p>
                  <p>Valor total: ${lead.totalValue.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg 
                         text-sm flex items-center justify-center transition-colors duration-200"
                >
                  <EyeIcon className="mr-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla para desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Interacción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Mail className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 break-all">
                        {lead.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <StatusBadge status={lead.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {formatDate(lead.lastContact)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {lead.submissions}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    ${lead.totalValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-900 rounded-lg transition-colors duration-200"
                      >
                        <EyeIcon className="mr-1" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DetailsModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Mostrando{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredLeads.length)}
              </span>{" "}
              de <span className="font-medium">{filteredLeads.length}</span>{" "}
              resultados
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-900"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="hidden md:flex space-x-2">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNumber
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                if (
                  Math.abs(pageNumber - currentPage) === 2 &&
                  (pageNumber === 2 || pageNumber === totalPages - 1)
                ) {
                  return <span key={pageNumber}>...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-900"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Componente de badge para estados
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pendiente",
      },
      contacted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Contactado",
      },
      converted: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Convertido",
      },
      not_interested: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "No Interesado",
      },
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Funciones de utilidad
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  const colors = {
    pending: "#ffd700",
    contacted: "#4169e1",
    converted: "#32cd32",
    not_interested: "#dc143c",
  };
  return colors[status] || "#808080";
};

const getActivityData = (leads) => {
  const now = new Date();
  const ranges = [
    { days: 7, label: "7 días" },
    { days: 30, label: "30 días" },
    { days: 90, label: "90 días" },
    { days: 180, label: "180 días" },
  ];

  return ranges.map((range) => {
    const count = leads.filter((lead) => {
      const lastContact = new Date(lead.lastContact);
      const diffTime = Math.abs(now - lastContact);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= range.days;
    }).length;

    return {
      range: range.label,
      count,
    };
  });
};

export default LeadAnalytics;

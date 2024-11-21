import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Loader,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Mail,
  AlertCircle,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  successRate: number;
  hourlyData: {
    hour: string;
    sent: number;
    failed: number;
  }[];
}

const EmailStatus: React.FC = () => {
  const [status, setStatus] = useState<
    "loading" | "operational" | "degraded" | "error"
  >("loading");
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkEmailService();
    fetchEmailStats();
  }, []);

  const checkEmailService = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/email-service/status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setLastUpdate(new Date());
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
      setError("Error al verificar el servicio");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/email-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error("Error al obtener estadísticas");
      }
    } catch (err) {
      setError("Error al cargar estadísticas");
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "operational":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-50",
          border: "border-green-200",
          text: "Servicio Operativo",
        };
      case "degraded":
        return {
          icon: AlertCircle,
          color: "text-yellow-500",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "Servicio Degradado",
        };
      case "error":
        return {
          icon: AlertTriangle,
          color: "text-red-500",
          bg: "bg-red-50",
          border: "border-red-200",
          text: "Servicio No Disponible",
        };
      default:
        return {
          icon: Loader,
          color: "text-gray-500",
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "Verificando Estado",
        };
    }
  };

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <Loader className="animate-spin text-indigo-600" size={24} />
      </div>
    );
  }

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-4xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Mail className="text-indigo-600" size={20} />
              Monitor del Servicio de Correos
            </h2>
            <button
              onClick={checkEmailService}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                       transition-all duration-200 ${
                         isUpdating
                           ? "bg-gray-100 text-gray-400"
                           : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                       }`}
            >
              <RefreshCw
                className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div
            className={`rounded-xl ${statusConfig.bg} border ${statusConfig.border} p-6`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 ${statusConfig.bg}`}>
                  <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {statusConfig.text}
                  </h3>
                  {lastUpdate && (
                    <p className="text-sm text-gray-500">
                      Última actualización: {lastUpdate.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showDetails ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat
                title="Correos Enviados"
                value={stats.total}
                icon={Mail}
                color="blue"
              />
              <Stat
                title="Exitosos"
                value={stats.sent}
                icon={CheckCircle}
                color="green"
              />
              <Stat
                title="Fallidos"
                value={stats.failed}
                icon={AlertTriangle}
                color="red"
              />
              <Stat
                title="Tasa de Éxito"
                value={`${stats.successRate}%`}
                icon={Activity}
                color="indigo"
              />
            </div>
          )}

          {/* Performance Charts */}
          {stats && stats.hourlyData && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Rendimiento (Últimas 24 horas)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.hourlyData}>
                      <defs>
                        <linearGradient
                          id="sentGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4F46E5"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4F46E5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="hour"
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "0.5rem",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sent"
                        stroke="#4F46E5"
                        fill="url(#sentGradient)"
                        strokeWidth={2}
                        name="Enviados"
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stroke="#EF4444"
                        fill="#FEE2E2"
                        strokeWidth={2}
                        name="Fallidos"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Success Rate Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Tasa de Éxito por Hora
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="hour"
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "0.5rem",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="successRate"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981" }}
                        name="Tasa de Éxito"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Stat: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "blue" | "green" | "red" | "indigo";
}> = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className={`${colors[color]} rounded-lg p-4`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailStatus;

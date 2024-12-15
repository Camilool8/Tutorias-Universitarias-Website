import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import SEO from "./shared/SEO";
import { Loader } from "lucide-react";

interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
  totalProfit: number;
  lostProfit: number;
  dailyOrderCounts: { date: string; count: number; profit: number }[];
  profitTrend: { month: string; profit: number }[];
  orderStatusDistribution: { status: string; count: number }[];
  conversionRate: { month: string; rate: number }[];
}

const Analytics: React.FC<AnalyticsProps> = ({ setError }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        throw new Error("Error al obtener los datos analíticos");
      }
    } catch (error) {
      console.error("Error al obtener los datos analíticos:", error);
      setError(
        "Error al obtener los datos analíticos. Por favor, intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-red-600">
        Error al cargar los datos analíticos.
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const STATUS_NAMES = ["Completada", "En progreso", "Cancelada"];

  return (
    <>
      <SEO
        title="Analytics"
        description="Análisis y métricas del sistema"
        canonicalUrl="https://www.tutoriasuniversitarias.com/admin/analytics"
      >
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
        <meta name="robots" content="none" />
      </SEO>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Solicitudes Totales"
            value={analyticsData.totalOrders}
            color="bg-blue-100 text-blue-800"
          />
          <StatCard
            title="Solicitudes Completadas"
            value={analyticsData.completedOrders}
            color="bg-green-100 text-green-800"
          />
          <StatCard
            title="Solicitudes en Progreso"
            value={analyticsData.inProgressOrders}
            color="bg-yellow-100 text-yellow-800"
          />
          <StatCard
            title="Solicitudes Canceladas"
            value={analyticsData.cancelledOrders}
            color="bg-red-100 text-red-800"
          />
          <StatCard
            title="Ganancias Totales"
            value={`$${analyticsData.totalProfit.toFixed(2)}`}
            color="bg-indigo-100 text-indigo-800"
          />
          <StatCard
            title="Ganancias Perdidas"
            value={`$${analyticsData.lostProfit.toFixed(2)}`}
            color="bg-pink-100 text-pink-800"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Solicitudes y Ganancias Diarias (Últimos 7 Días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.dailyOrderCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill="#8884d8"
                name="Solicitudes"
              />
              <Bar
                yAxisId="right"
                dataKey="profit"
                fill="#82ca9d"
                name="Ganancias ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Tasa de Conversión Mensual
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.conversionRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8884d8"
                  name="Tasa de Conversión (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Tendencia de Ganancias Mensuales
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.profitTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#82ca9d"
                  name="Ganancias ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Distribución de Estados de Solicitudes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.orderStatusDistribution.map(
                  (item, index) => ({
                    ...item,
                    name: STATUS_NAMES[index],
                  })
                )}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {analyticsData.orderStatusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number | string;
  color: string;
}> = ({ title, value, color }) => (
  <div className={`p-4 rounded-lg shadow ${color}`}>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default Analytics;

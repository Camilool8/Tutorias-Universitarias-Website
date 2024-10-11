import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Invoice from "./Invoice";
import { supabase } from "../supabaseClient";

interface Submission {
  id: string;
  subject: string;
  email: string;
  status: string;
  submittedAt: string;
  price: number;
  profit: number;
}

interface SubmissionsListProps {
  setError: (error: string) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({ setError }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showInvoice, setShowInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("submittedAt", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error("Error al obtener las solicitudes:", error);
      setError(
        "Error al obtener las solicitudes. Por favor, intente de nuevo."
      );
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("id", id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSubmissions(
          submissions.map((sub) =>
            sub.id === id ? { ...sub, status: newStatus } : sub
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la solicitud:", error);
      setError(
        "Error al actualizar el estado de la solicitud. Por favor, intente de nuevo."
      );
    }
  };

  const handlePriceChange = async (id: string, newPrice: number) => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .update({ price: newPrice })
        .eq("id", id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSubmissions(
          submissions.map((sub) =>
            sub.id === id ? { ...sub, price: newPrice } : sub
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
      setError("Error al actualizar el precio. Por favor, intente de nuevo.");
    }
  };

  const handleProfitChange = async (id: string, newProfit: number) => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .update({ profit: newProfit })
        .eq("id", id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSubmissions(
          submissions.map((sub) =>
            sub.id === id ? { ...sub, profit: newProfit } : sub
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar la ganancia:", error);
      setError("Error al actualizar la ganancia. Por favor, intente de nuevo.");
    }
  };

  const filteredSubmissions = submissions
    .filter(
      (submission) =>
        submission.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((submission) => filter === "all" || submission.status === filter);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todas</option>
          <option value="En progreso">En progreso</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden space-y-4">
        {currentItems.map((submission) => (
          <div
            key={submission.id}
            className="bg-white shadow-md rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{submission.subject}</span>
              <button
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => setShowInvoice(submission.id)}
              >
                <FileText size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600">{submission.email}</p>
            <div className="flex justify-between items-center">
              <select
                value={submission.status}
                onChange={(e) =>
                  handleStatusChange(submission.id, e.target.value)
                }
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <input
                type="number"
                value={submission.price}
                onChange={(e) =>
                  handlePriceChange(submission.id, parseFloat(e.target.value))
                }
                className="border rounded px-2 py-1 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={submission.profit}
                onChange={(e) =>
                  handleProfitChange(submission.id, parseFloat(e.target.value))
                }
                className="border rounded px-2 py-1 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-gray-500">
              {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asunto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Envío
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ganancia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((submission) => (
              <tr key={submission.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {submission.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {submission.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={submission.status}
                    onChange={(e) =>
                      handleStatusChange(submission.id, e.target.value)
                    }
                    className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="En progreso">En progreso</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(submission.submittedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={submission.price}
                    onChange={(e) =>
                      handlePriceChange(
                        submission.id,
                        parseFloat(e.target.value)
                      )
                    }
                    className="border rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={submission.profit}
                    onChange={(e) =>
                      handleProfitChange(
                        submission.id,
                        parseFloat(e.target.value)
                      )
                    }
                    className="border rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => setShowInvoice(submission.id)}
                  >
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <p className="text-sm text-gray-700">
          Mostrando {indexOfFirstItem + 1} a{" "}
          {Math.min(indexOfLastItem, filteredSubmissions.length)} de{" "}
          {filteredSubmissions.length} resultados
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= filteredSubmissions.length}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {showInvoice && (
        <Invoice
          submission={submissions.find((sub) => sub.id === showInvoice)!}
          onClose={() => setShowInvoice(null)}
        />
      )}
    </div>
  );
};

export default SubmissionsList;

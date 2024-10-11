import React, { useState } from "react";
import {
  X,
  FileText,
  DollarSign,
  Calendar,
  Book,
  Globe,
  School,
  Bookmark,
} from "lucide-react";
import Invoice from "./Invoice";
import { supabase } from "../supabaseClient";

interface SubmissionDetailsProps {
  submission: Submission;
  onClose: () => void;
  setError: (error: string) => void;
  onUpdate: (updatedSubmission: Submission) => void;
}

interface Submission {
  id: string;
  subject: string;
  email: string;
  status: string;
  submittedAt: string;
  price: number;
  description: string;
  dueDate: string;
  dueTime: string;
  country: string;
  educationLevel: string;
  career: string;
  format: string;
  pageCount: string;
  language: string;
  hasRubric: boolean;
  citationStyle: string;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({
  submission,
  onClose,
  setError,
  onUpdate,
}) => {
  const [price, setPrice] = useState(submission.price.toString());
  const [showInvoice, setShowInvoice] = useState(false);

  const handlePriceChange = async () => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      setError("Por favor, ingrese un precio válido.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("submissions")
        .update({ price: numericPrice })
        .eq("id", submission.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedSubmission = { ...submission, price: numericPrice };
        onUpdate(updatedSubmission);
        onClose();
      } else {
        throw new Error("No data returned from update operation");
      }
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
      setError("Error al actualizar el precio. Por favor, intente de nuevo.");
      setPrice(submission.price.toString());
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("id", submission.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedSubmission = { ...submission, status: newStatus };
        onUpdate(updatedSubmission);
      } else {
        throw new Error("No data returned from update operation");
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar el estado. Por favor, intente de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Detalles de la Solicitud
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <DetailItem
              icon={<Book size={18} />}
              label="Asunto"
              value={submission.subject}
            />
            <DetailItem
              icon={<Globe size={18} />}
              label="País"
              value={submission.country}
            />
            <DetailItem
              icon={<School size={18} />}
              label="Nivel Educativo"
              value={submission.educationLevel}
            />
            <DetailItem
              icon={<Bookmark size={18} />}
              label="Carrera"
              value={submission.career}
            />
          </div>
          <div className="space-y-4">
            <DetailItem
              icon={<Calendar size={18} />}
              label="Fecha de Envío"
              value={new Date(submission.submittedAt).toLocaleString()}
            />
            <DetailItem
              icon={<Calendar size={18} />}
              label="Fecha de Entrega"
              value={`${submission.dueDate} ${submission.dueTime}`}
            />
            <DetailItem
              icon={<FileText size={18} />}
              label="Formato"
              value={submission.format}
            />
            <DetailItem
              icon={<FileText size={18} />}
              label="Número de Páginas"
              value={submission.pageCount}
            />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <DetailItem
            icon={<Globe size={18} />}
            label="Idioma"
            value={submission.language}
          />
          <DetailItem
            icon={<FileText size={18} />}
            label="Tiene Rúbrica"
            value={submission.hasRubric ? "Sí" : "No"}
          />
          <DetailItem
            icon={<Bookmark size={18} />}
            label="Estilo de Citación"
            value={submission.citationStyle}
          />
          <div className="bg-gray-100 p-4 rounded-md">
            <h4 className="font-semibold mb-2 flex items-center">
              <FileText size={18} className="mr-2" />
              Descripción
            </h4>
            <p className="text-gray-700">{submission.description}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 bg-blue-50 p-4 rounded-md">
            <label
              htmlFor="status"
              className="font-semibold mb-2 sm:mb-0 flex items-center"
            >
              <FileText size={18} className="mr-2" />
              Estado:
            </label>
            <select
              id="status"
              value={submission.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 bg-green-50 p-4 rounded-md">
            <label
              htmlFor="price"
              className="font-semibold mb-2 sm:mb-0 flex items-center"
            >
              <DollarSign size={18} className="mr-2" />
              Precio:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setPrice(value);
                  }
                }}
                className="border rounded px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handlePriceChange}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowInvoice(true)}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors duration-200 flex items-center"
          >
            <FileText size={18} className="mr-2" />
            Generar Factura
          </button>
        </div>
        {showInvoice && (
          <Invoice
            submission={submission}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-8 mt-1">{icon}</div>
    <div className="flex-grow">
      <span className="font-semibold text-gray-700">{label}:</span>
      <span className="ml-2 text-gray-600">{value}</span>
    </div>
  </div>
);

export default SubmissionDetails;

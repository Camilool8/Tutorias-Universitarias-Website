import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Book,
  Globe,
  Calendar,
  Clock,
  Mail,
  Send,
  AlertCircle,
} from "lucide-react";
import PageTransition from "../components/PageTransition";

const UploadForm: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    subject: "",
    country: "España",
    dueDate: "",
    dueTime: "",
    email: "",
  });
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const state = location.state as { selectedService?: string };
    if (state?.selectedService) {
      setFormData((prev) => ({
        ...prev,
        subject: state.selectedService ?? prev.subject,
      }));
    }

    fetchCountries();
  }, [location]);

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();

      const sortedCountries = data
        .map((country: { name: { common: string } }) => country.name.common)
        .sort((a: string, b: string) => a.localeCompare(b));
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newWindow = window.open();

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "En progreso",
          price: 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();

      const phoneNumber = "34608837272";
      const message = encodeURIComponent(`
*Cotización ${data.id} 👛*

*📚 Servicio:* ${formData.subject}
*🌎 País:* ${formData.country}
*📆 Fecha Entrega:* ${formData.dueDate} ${formData.dueTime}
*📧 Correo Electrónico:* ${formData.email}

Los documentos necesarios para la tarea serán enviados durante la conversación.
      `);

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

      if (newWindow) {
        newWindow.location.href = whatsappUrl;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (newWindow) {
        newWindow.close();
      }
    }
  };

  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold mb-8 text-center text-indigo-800">
            Cotiza Con Nosotros
          </h1>
          <p className="text-xl sm:text-2xl text-center mb-12 text-gray-600">
            Completa el formulario a continuación con los detalles de tu tarea.
            Te contactaremos por WhatsApp con una cotización personalizada.
          </p>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl"
          >
            <div className="space-y-6">
              <FormField
                icon={<Book size={18} />}
                label="Tipo de Servicio"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Ej: Ensayo, Presentación, Proyecto"
              />
              <FormField
                icon={<Globe size={18} />}
                label="País"
                name="country"
                type="select"
                value={formData.country}
                onChange={handleChange}
                options={countries.map((country) => ({
                  value: country,
                  label: country,
                }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  icon={<Calendar size={18} />}
                  label="Fecha de Entrega"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
                <FormField
                  icon={<Clock size={18} />}
                  label="Hora de Entrega"
                  name="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={handleChange}
                />
              </div>
              <FormField
                icon={<Mail size={18} />}
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </div>
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center text-lg w-full sm:w-auto"
              >
                <Send className="mr-2" size={18} />
                Enviar y Recibir Cotización por WhatsApp
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600 flex items-center justify-center">
              <AlertCircle size={16} className="mr-1" />
              Si el enlace de WhatsApp no funciona, por favor escribe
              directamente al número: ‪<strong>+34 608 83 72 72‬.</strong>
            </p>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

interface FormFieldProps {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const FormField: React.FC<FormFieldProps> = ({
  icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  options,
}) => {
  return (
    <div>
      <label
        className="text-gray-700 text-sm font-bold mb-2 flex items-center"
        htmlFor={name}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={placeholder}
          required
        />
      )}
    </div>
  );
};

export default UploadForm;

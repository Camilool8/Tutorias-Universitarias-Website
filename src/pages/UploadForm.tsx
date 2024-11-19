import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Book,
  Globe,
  Calendar,
  Clock,
  Mail,
  Send,
  FileText,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";

const UploadForm = () => {
  const location = useLocation();
  const { location: geoLocation } = useGeolocation();
  const [activeTab, setActiveTab] = useState("general");
  const [countries, setCountries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [documentCount, setDocumentCount] = useState(1);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    country: "España",
    dueDate: "",
    dueTime: "",
    email: "",
    phoneNumber: "",
  });

  const fetchCountries = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      const sortedCountries = data
        .map((country) => country.name.common)
        .sort((a, b) => a.localeCompare(b));
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Error al cargar la lista de países. Por favor, recarga la página.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const state = location.state as { selectedService?: string };
    if (state?.selectedService) {
      setFormData((prev) => ({
        ...prev,
        subject: state.selectedService,
      }));
    }
    fetchCountries();
  }, [location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "turnitin") {
      setFormData((prev) => ({
        ...prev,
        subject: "Verificación Turnitin (1 documento)",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subject: location.state?.selectedService || "",
      }));
    }
  };

  const handleDocumentCountChange = (count) => {
    const validCount = Math.max(1, Math.floor(Number(count)));
    setDocumentCount(validCount);
    setFormData((prev) => ({
      ...prev,
      subject: `Verificación Turnitin (${validCount} documento${
        validCount > 1 ? "s" : ""
      })`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

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
          profit: 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      const phoneNumber = getWhatsAppNumber(geoLocation?.continent_code);

      let message = "";
      if (activeTab === "turnitin") {
        // Extraer el número de documentos del subject
        const docCount = formData.subject.match(/\d+/)?.[0] || "1";
        message = encodeURIComponent(`
*Cotización ${data.id} 👛*

*📚 Servicio:* ${formData.subject}
*🌎 País:* ${formData.country}
*📆 Fecha Entrega:* ${formData.dueDate} ${formData.dueTime}
*📧 Correo:* ${formData.email}
*📞 Teléfono:* ${formData.phoneNumber}
*💰 Costo:* USD$${parseInt(docCount) * 20} (USD$20 por documento)
        `);
      } else {
        message = encodeURIComponent(`
*Cotización ${data.id} 👛*

*📚 Servicio:* ${formData.subject}
*🌎 País:* ${formData.country}
*📆 Fecha Entrega:* ${formData.dueDate} ${formData.dueTime}
*📧 Correo:* ${formData.email}
*📞 Teléfono:* ${formData.phoneNumber}
        `);
      }

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

      if (newWindow) {
        newWindow.location.href = whatsappUrl;
      }

      setSubmitStatus({
        type: "success",
        message: "¡Formulario enviado con éxito! Redirigiendo a WhatsApp...",
      });
    } catch (error) {
      console.error("Error al subir el formulario:", error);
      setSubmitStatus({
        type: "error",
        message: "Error al enviar el formulario. Por favor, intenta de nuevo.",
      });
      if (newWindow) {
        newWindow.close();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-indigo-800">
              Cotiza Ahora
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {activeTab === "turnitin"
                ? "Verifica la originalidad de tus documentos con la herramienta líder mundial"
                : "Obtén ayuda profesional para tus tareas académicas"}
            </p>
          </motion.div>

          {/* Pestañas */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white p-2 rounded-xl shadow-xl grid grid-cols-2 gap-2">
              <TabButton
                isActive={activeTab === "general"}
                onClick={() => handleTabChange("general")}
                icon={<FileText />}
                text="Servicios Generales"
              />
              <TabButton
                isActive={activeTab === "turnitin"}
                onClick={() => handleTabChange("turnitin")}
                icon={<Shield />}
                text="Verificación Turnitin"
              />
            </div>
          </motion.div>

          {/* Formulario */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.form
                  key={activeTab}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Selector de documentos para Turnitin */}
                  {activeTab === "turnitin" && (
                    <div className="mb-6">
                      {!showCustomInput ? (
                        <>
                          <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Selecciona la cantidad de documentos a verificar:
                          </h3>
                          <div className="grid grid-cols-6 gap-3">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleDocumentCountChange(num)}
                                className={`p-4 rounded-lg font-medium transition-all duration-300
                      ${
                        documentCount === num
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setShowCustomInput(true)}
                              className="p-4 rounded-lg font-medium bg-indigo-50 text-indigo-600 
                           hover:bg-indigo-100 transition-all duration-300"
                            >
                              +
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">
                            Introduce la cantidad de documentos:
                          </h3>
                          <div className="flex space-x-4">
                            <input
                              type="number"
                              min="1"
                              value={documentCount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d+$/.test(value)) {
                                  handleDocumentCountChange(value);
                                }
                              }}
                              className="w-24 px-4 py-3 rounded-lg border border-gray-200 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCustomInput(false)}
                              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg
                           hover:bg-gray-200 transition-colors duration-200"
                            >
                              Volver
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campo de servicio general */}
                  {activeTab === "general" && (
                    <FormField
                      label="Tipo de Servicio"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      icon={<Book />}
                      placeholder="Ej: Ensayo, Presentación, Proyecto"
                    />
                  )}

                  {/* Campos comunes */}
                  <FormField
                    label="País"
                    name="country"
                    type="select"
                    value={formData.country}
                    onChange={handleChange}
                    icon={<Globe />}
                    options={countries.map((country) => ({
                      value: country,
                      label: country,
                    }))}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Fecha de Entrega"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleChange}
                      icon={<Calendar />}
                    />
                    <FormField
                      label="Hora de Entrega"
                      name="dueTime"
                      type="time"
                      value={formData.dueTime}
                      onChange={handleChange}
                      icon={<Clock />}
                    />
                  </div>

                  <FormField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail />}
                    placeholder="tu@email.com"
                  />

                  <FormField
                    label="Teléfono"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    icon={<Phone />}
                    placeholder="+34 608 83 72 72"
                  />

                  {/* Mensajes de estado */}
                  <AnimatePresence>
                    {submitStatus.message && (
                      <StatusMessage status={submitStatus} />
                    )}
                  </AnimatePresence>

                  {/* Botón de envío */}
                  <SubmitButton isSubmitting={isSubmitting} />

                  {/* Información adicional */}
                  <div className="space-y-3">
                    <InfoBox
                      icon={<FaWhatsapp />}
                      text="Te contactaremos por WhatsApp con tu cotización personalizada"
                      variant="success"
                    />
                    <InfoBox
                      icon={
                        activeTab === "turnitin" ? <Shield /> : <FileText />
                      }
                      text={
                        activeTab === "turnitin"
                          ? "Recibirás el informe de Turnitin en un plazo de 24 horas"
                          : "Podrás enviar documentos adicionales por WhatsApp"
                      }
                      variant="info"
                    />
                  </div>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

// Componentes auxiliares
const TabButton = ({ isActive, onClick, icon, text }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`
      flex items-center justify-center space-x-2 py-3 px-4 rounded-lg 
      transition-all duration-300 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }
    `}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="font-medium">{text}</span>
  </motion.button>
);

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
  placeholder,
  options,
  touched = false,
}) => {
  const [isTouched, setIsTouched] = useState(touched);
  const isValid = value && value.trim() !== "";

  const getInputStyles = () => {
    if (!isTouched) return "border-gray-200";
    return isValid
      ? "border-green-200 bg-green-50/30 focus:border-green-300"
      : "border-red-200 bg-red-50/30 focus:border-red-300";
  };

  const getLabelStyles = () => {
    if (!isTouched) return "text-gray-700";
    return isValid ? "text-green-700" : "text-red-700";
  };

  const getIconStyles = () => {
    if (!isTouched) return "text-indigo-600 bg-indigo-50";
    return isValid ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-lg border 
    transition-all duration-300
    focus:ring-2 focus:ring-opacity-50
    ${getInputStyles()}
    ${type === "date" || type === "time" ? "cursor-pointer" : ""}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <label className="block mb-2">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <div
            className={`p-2 rounded-lg transition-colors duration-300 ${getIconStyles()}`}
          >
            {React.cloneElement(icon, { size: 18 })}
          </div>
          <span
            className={`transition-colors duration-300 ${getLabelStyles()}`}
          >
            {label}
          </span>
        </div>
      </label>

      <div className="relative">
        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            className={inputClasses}
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
            onBlur={handleBlur}
            placeholder={placeholder}
            className={inputClasses}
            required
            min={
              type === "date"
                ? new Date().toISOString().split("T")[0]
                : undefined
            }
          />
        )}
      </div>

      {/* Mensajes de ayuda específicos */}
      {type === "date" && (
        <p className={`mt-1 text-xs ${getLabelStyles()}`}>
          Seleccione una fecha posterior a hoy
        </p>
      )}

      {name === "phoneNumber" && (
        <p className={`mt-1 text-xs ${getLabelStyles()}`}>
          Incluya el código de país (ej: +34, +1)
        </p>
      )}
    </motion.div>
  );
};

const InfoBox = ({ icon, text, variant = "info" }) => (
  <motion.div
    className={`
      p-4 rounded-lg flex items-start space-x-3
      ${
        variant === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
      }
    `}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex-shrink-0 mt-1">
      {React.cloneElement(icon, {
        size: 18,
        className: variant === "success" ? "text-green-500" : "text-indigo-500",
      })}
    </div>
    <p className="text-sm">{text}</p>
  </motion.div>
);

const DocumentCountButton = ({ count, isSelected, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`
      p-4 rounded-lg font-medium transition-all duration-300
      ${
        isSelected
          ? "bg-indigo-600 text-white shadow-lg"
          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
      }
    `}
  >
    {count}
  </motion.button>
);

const StatusMessage = ({ status }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={`p-4 rounded-lg flex items-start space-x-2 ${
      status.type === "error"
        ? "bg-red-50 text-red-700"
        : "bg-green-50 text-green-700"
    }`}
  >
    {status.type === "error" ? <AlertCircle /> : <CheckCircle />}
    <span>{status.message}</span>
  </motion.div>
);

const SubmitButton = ({ isSubmitting }) => (
  <motion.button
    type="submit"
    disabled={isSubmitting}
    className={`
      w-full flex items-center justify-center py-3 px-6 rounded-lg
      font-medium transition-all duration-300
      ${
        isSubmitting
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
      }
    `}
  >
    {isSubmitting ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </motion.div>
    ) : (
      <>
        <Send className="mr-2" />
        <span>Enviar y Recibir Cotización</span>
      </>
    )}
  </motion.button>
);

export default UploadForm;

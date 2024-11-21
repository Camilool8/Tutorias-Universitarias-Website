import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Shield,
  Lock,
  HeartHandshake,
  FileCheck,
  Users,
} from "lucide-react";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";
import PageTransition from "../components/PageTransition";

const PromoBanner = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const { location: geoLocation } = useGeolocation();
  const whatsappNumber = getWhatsAppNumber(geoLocation?.continent_code);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Error al enviar el formulario");

      const message = encodeURIComponent(`
Saludos! Me interesa conocer más sobre sus servicios de apoyo académico.

Mi correo electrónico es: ${email}

Me gustaría recibir información sobre:
- Asesoría personalizada para tareas y exámenes
- Tutorías one-to-one con expertos
- Servicio de verificación de originalidad
- Precios y planes disponibles

Quedo atento a su respuesta. ¡Gracias!`);

      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
      setStatus({
        type: "success",
        message: "¡Genial! Redirigiendo a WhatsApp...",
      });
      setEmail("");
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error al enviar. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />

        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2">
          {/* Contenido */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-r from-white/95 to-white/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-lg space-y-8">
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl lg:text-5xl font-bold leading-tight"
                >
                  ¿Trabajas y no tienes tiempo para tus{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    tareas académicas
                  </span>
                  ?
                </motion.h1>
                <p className="text-xl text-gray-600">
                  Tutores expertos disponibles 24/7 para ayudarte con tus
                  trabajos
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5"
              >
                <Feature icon={<Clock size={18} />} text="Entrega en 24h" />
                <Feature icon={<Star size={18} />} text="Calidad Premium" />
                <Feature
                  icon={<CheckCircle size={18} />}
                  text="100% Original"
                />
                <Feature
                  icon={<HeartHandshake size={18} />}
                  text="Soporte 24/7"
                />
                <Feature
                  icon={<FileCheck size={18} />}
                  text="Verificación Turnitin"
                />
                <Feature icon={<Users size={18} />} text="+1000 Estudiantes" />
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="flex-1 px-6 py-4 rounded-full border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 text-lg"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-4 rounded-full font-semibold text-white transform transition-all duration-300 text-lg
                      ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-lg hover:translate-y-[-2px]"
                      }`}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send size={20} />
                        <span>¡Quiero Ayuda!</span>
                      </div>
                    )}
                  </button>
                </div>
                {status.message && <StatusMessage status={status} />}
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 text-center"
              >
                Más de 1,000 estudiantes confían en nosotros
              </motion.div>
            </div>
          </motion.div>

          {/* Imagen */}
          <div className="absolute lg:relative inset-0 lg:inset-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-900/60 to-purple-900/60 mix-blend-multiply" />
            <img
              src="/images/promo-banner.webp"
              alt="Estudiante exitoso"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const Feature = ({ icon, text }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="flex items-center space-x-2 px-4 py-3 
    bg-gradient-to-r from-white/90 to-white/80 
    backdrop-blur-md rounded-full text-base font-medium 
    border-2 border-white/50
    shadow-[0_2px_10px_-3px_rgba(6,182,212,0.3)]
    hover:shadow-[0_4px_20px_-6px_rgba(99,102,241,0.4)]
    transition-all duration-300 ease-out
    group"
  >
    <span className="text-indigo-600 group-hover:text-indigo-500 transform group-hover:scale-110 transition-transform duration-300">
      {icon}
    </span>
    <span className="text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
      {text}
    </span>
  </motion.div>
);

const StatusMessage = ({ status }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg flex items-center space-x-2 ${
      status.type === "error"
        ? "bg-red-50 text-red-700"
        : "bg-green-50 text-green-700"
    }`}
  >
    {status.type === "error" ? (
      <AlertCircle size={18} />
    ) : (
      <CheckCircle size={18} />
    )}
    <span>{status.message}</span>
  </motion.div>
);

export default PromoBanner;

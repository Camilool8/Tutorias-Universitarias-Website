import React, { useState, useEffect } from "react";
import SEO from "./shared/SEO";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

const PromotionalBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return; // Si fue descartado, no hacer nada

      if (!hasTriggered && window.scrollY > 300) {
        setIsVisible(true);
        setHasTriggered(true); // Marcamos que ya se activó
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed, hasTriggered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newWindow = window.open();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        const message = encodeURIComponent(`
Saludos! Me interesa conocer más sobre sus servicios de apoyo académico.

Mi correo electrónico es: ${email}

Me gustaría recibir información sobre:
- Asesoría personalizada para tareas y exámenes
- Tutorías one-to-one con expertos
- Servicio de verificación de originalidad
- Precios y planes disponibles

Quedo atento a su respuesta. ¡Gracias!`);

        if (newWindow) {
          newWindow.location.href = `https://wa.me/18492701295?text=${message}`;
        }

        setFeedback({
          type: "success",
          message: "¡Genial! Redirigiendo a WhatsApp...",
        });
        setTimeout(() => setIsDismissed(true), 3000);
      } else {
        throw new Error(data.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Error al procesar la solicitud",
      });
      if (newWindow) {
        newWindow.close();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <>
      <SEO
        title="Promociones Especiales"
        description="Aprovecha nuestras promociones especiales en servicios académicos. Descuentos en tutorías, trabajos y más servicios universitarios."
        canonicalUrl="https://www.tutoriasuniversitarias.com/promo"
        keywords="promociones académicas, descuentos tutorías, ofertas estudiantes, servicios académicos descuento"
        ogType="website"
      />
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl p-4 md:p-6">
              {/* Botón de cierre mejorado */}
              <button
                onClick={() => setIsDismissed(true)}
                className="absolute -top-3 -right-3 bg-indigo-600 text-white rounded-full p-1
                       hover:bg-indigo-700 transition-all duration-200 shadow-lg
                       border-2 border-white transform hover:scale-110 z-50"
                aria-label="Cerrar banner"
              >
                <X size={24} strokeWidth={2.5} />
              </button>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-white text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <GraduationCap className="w-6 h-6" />
                    <h3 className="text-xl md:text-2xl font-bold">
                      ¿Trabajas y estudias?
                    </h3>
                  </div>
                  <p className="text-white/90">
                    ¡Déjanos tu correo y te asignamos un tutor para tus tareas
                    académicas.{" "}
                    <span className=" text-yellow-300 font-bold shadow-xl">
                      ¡Totalmente Gratis!
                    </span>
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 w-full flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-white/20 
                           bg-white/10 text-white placeholder-white/60 focus:outline-none 
                           focus:border-white/40"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold
                           hover:bg-white/90 transition-colors flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        <span>¡Quiero ayuda!</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {feedback.message && (
                <div
                  className={`mt-4 p-3 rounded-lg flex items-center 
                             ${
                               feedback.type === "success"
                                 ? "bg-green-100 text-green-800"
                                 : "bg-red-100 text-red-800"
                             }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle size={20} className="mr-2" />
                  ) : (
                    <AlertCircle size={20} className="mr-2" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PromotionalBanner;

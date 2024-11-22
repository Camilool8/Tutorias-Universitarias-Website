import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  Heart,
  MessageCircle,
  Bell,
  CheckCircle,
  X,
  ArrowLeft,
  Loader,
} from "lucide-react";
import PageTransition from "../components/PageTransition";

const UnsubscribePage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<"unsubscribe" | "stay" | null>(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const reasons = [
    {
      id: "frequency",
      text: "Recibo demasiados correos",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "relevance",
      text: "El contenido no es relevante para mí",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      id: "noLongerNeed",
      text: "Ya no necesito el servicio",
      icon: <X className="w-5 h-5" />,
    },
    {
      id: "other",
      text: "Otro motivo",
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, introduce tu correo electrónico");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar el email");
      }

      if (!data.exists) {
        setError(
          data.message || "Este correo no está en nuestra base de datos"
        );
        return;
      }

      setShowConfirmation(true);
    } catch (err: unknown) {
      console.error("Error en la verificación:", err);
      setError(
        err instanceof Error ? err.message : "Error al verificar el email"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaySubscribed = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stay-subscribed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      setSuccess("stay");
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "Error al procesar la solicitud"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribe = async () => {
    // Validar que se haya seleccionado una razón
    if (!reason) {
      setError("Por favor, selecciona una razón para darte de baja");
      return;
    }

    // Si es "other" validar que haya feedback
    if (reason === "other" && !customReason.trim()) {
      setError("Por favor, cuéntanos por qué te vas");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reason,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la desuscripción");
      }

      setSuccess("unsubscribe");
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "Error al procesar la solicitud"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const SuccessUnsubscribe = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6"
    >
      <div className="relative w-16 h-16 mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <CheckCircle className="w-16 h-16 text-indigo-600" />
        </motion.div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        ¡Te has desuscrito exitosamente!
      </h2>

      <p className="text-gray-600 text-lg">
        Lamentamos verte partir. Esperamos volver a verte pronto.
      </p>

      <button
        onClick={() => (window.location.href = "/")}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl
                 bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                 hover:from-indigo-700 hover:to-purple-700 transform transition-all
                 duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver al inicio
      </button>
    </motion.div>
  );

  const SuccessStay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6"
    >
      <div className="relative w-16 h-16 mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <Heart className="w-16 h-16 text-indigo-600" />
        </motion.div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        ¡Gracias por quedarte!
      </h2>

      <p className="text-gray-600 text-lg">
        Nos alegra que hayas decidido continuar con nosotros. Seguiremos
        trabajando para ofrecerte el mejor contenido.
      </p>

      <button
        onClick={() => (window.location.href = "/")}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl
                 bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                 hover:from-indigo-700 hover:to-purple-700 transform transition-all
                 duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver al inicio
      </button>
    </motion.div>
  );

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                    flex items-center justify-center p-4"
      >
        {success === "unsubscribe" ? (
          <SuccessUnsubscribe />
        ) : success === "stay" ? (
          <SuccessStay />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
          >
            <AnimatePresence mode="wait">
              {!showConfirmation && !showFeedback ? (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto"
                    >
                      <Heart className="w-full h-full text-indigo-600" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ¿Seguro que quieres irte?
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Lamentamos que quieras dejarnos. Nos gustaría saber tu
                      opinión para mejorar nuestro servicio.
                    </p>
                  </div>

                  <form onSubmit={handleInitialSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 pl-10 border rounded-xl
                                 focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all
                                 bg-gray-50 focus:bg-white"
                          placeholder="tu@email.com"
                        />
                        <Mail
                          className="absolute left-3 top-1/2 transform 
                                   -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-600"
                        >
                          {error}
                        </motion.p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <motion.button
                        type="button"
                        onClick={handleStaySubscribed}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-3 rounded-xl text-white
                 bg-gradient-to-r from-indigo-600 to-purple-600
                 hover:from-indigo-700 hover:to-purple-700
                 transition-all duration-200 shadow-md
                 hover:shadow-lg disabled:opacity-50
                 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        Mantener suscripción
                      </motion.button>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-3 rounded-xl text-indigo-700
                 border-2 border-indigo-600 bg-transparent
                 hover:bg-indigo-50 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          "Darme de baja"
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              ) : showConfirmation && !showFeedback ? (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <MessageCircle className="w-16 h-16 text-indigo-600 mx-auto" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Ayúdanos a mejorar
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Tu opinión es valiosa. ¿Podrías decirnos por qué te vas?
                    </p>
                  </div>

                  <div className="space-y-3">
                    {reasons.map((r) => (
                      <motion.button
                        key={r.id}
                        onClick={() => setReason(r.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-all 
                                duration-200 flex items-center space-x-3
                                ${
                                  reason === r.id
                                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-500"
                                    : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                                }`}
                      >
                        <span
                          className={`${
                            reason === r.id
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {r.icon}
                        </span>
                        <span
                          className={`${
                            reason === r.id
                              ? "text-indigo-700"
                              : "text-gray-700"
                          } font-medium`}
                        >
                          {r.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {reason === "other" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Cuéntanos por qué te vas..."
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 
                               focus:ring-indigo-500 focus:border-indigo-500
                               bg-gray-50 focus:bg-white transition-all
                               min-h-[100px] resize-none"
                      />
                    </motion.div>
                  )}

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => {
                        setShowFeedback(false);
                        setShowConfirmation(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 rounded-xl text-indigo-700
           border-2 border-indigo-600 bg-transparent
           hover:bg-indigo-50 transition-all duration-200
           disabled:opacity-50 disabled:cursor-not-allowed
           flex items-center justify-center space-x-2"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft size={18} />
                      <span>Volver</span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setShowFeedback(true);
                        setShowConfirmation(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={
                        isSubmitting ||
                        (reason === "other" && !customReason.trim())
                      }
                      className="flex-1 px-4 py-3 rounded-xl text-white
                             bg-gradient-to-r from-indigo-600 to-purple-600
                             hover:from-indigo-700 hover:to-purple-700
                             transition-all duration-200 shadow-md
                             hover:shadow-lg disabled:opacity-50
                             disabled:cursor-not-allowed
                             flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Darme de baja</span>
                          <Send size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <MessageCircle className="w-16 h-16 text-indigo-600 mx-auto" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Ayúdanos a mejorar
                    </h2>
                    <p className="text-gray-600 text-lg">
                      ¿Qué podríamos haber hecho mejor? Tu opinión es muy
                      valiosa para nosotros.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Comparte tus sugerencias con nosotros..."
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 
                 focus:ring-indigo-500 focus:border-indigo-500
                 bg-gray-50 focus:bg-white transition-all
                 min-h-[150px] resize-none"
                    />

                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => {
                          setShowConfirmation(true);
                          setShowFeedback(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-3 rounded-xl text-indigo-700
                   border-2 border-indigo-600 bg-transparent
                   hover:bg-indigo-50 transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center space-x-2"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft size={18} />
                        <span>Volver</span>
                      </motion.button>

                      <motion.button
                        onClick={handleUnsubscribe}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 rounded-xl text-white
                   bg-gradient-to-r from-indigo-600 to-purple-600
                   hover:from-indigo-700 hover:to-purple-700
                   transition-all duration-200 shadow-md
                   hover:shadow-lg disabled:opacity-50
                   disabled:cursor-not-allowed
                   flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span>Confirmar baja</span>
                            <Send size={18} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default UnsubscribePage;

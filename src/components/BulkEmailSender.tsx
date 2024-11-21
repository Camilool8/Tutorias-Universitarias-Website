import React, { useState } from "react";
import {
  Send,
  X,
  Code,
  Eye,
  Mail,
  Loader,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkEmailSenderProps {
  onClose: () => void;
  pendingLeads: Array<{ id: string; email: string }>;
  onLeadsUpdated: () => void;
  setError: (error: string) => void;
}

const BulkEmailSender: React.FC<BulkEmailSenderProps> = ({
  onClose,
  pendingLeads,
  onLeadsUpdated,
  setError,
}) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const showFeedback = (type: string, message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSendEmails = async () => {
    if (!subject.trim() || !content.trim()) {
      showFeedback("error", "Por favor completa todos los campos");
      return;
    }

    setIsSending(true);
    let successCount = 0;

    try {
      const token = localStorage.getItem("adminToken");

      for (let i = 0; i < pendingLeads.length; i++) {
        const lead = pendingLeads[i];

        // Enviar el correo
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: lead.email,
            subject,
            content,
            isHtml: isHtmlMode,
          }),
        });

        if (emailResponse.ok) {
          // Actualizar el estado del lead a 'contacted'
          const updateResponse = await fetch(`/api/leads/${lead.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "contacted",
              last_contacted: new Date().toISOString(),
            }),
          });

          if (updateResponse.ok) {
            successCount++;
          }
        }

        // Actualizar el progreso
        setProgress(((i + 1) / pendingLeads.length) * 100);
      }

      showFeedback("success", `${successCount} correos enviados exitosamente`);
      onLeadsUpdated();
      setTimeout(onClose, 2000);
    } catch (error) {
      setError("Error al enviar los correos. Por favor, intente de nuevo.");
    } finally {
      setIsSending(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Enviar Correo Masivo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {/* Destinatarios */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <Mail size={18} />
              <span className="font-medium">Destinatarios:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingLeads.map((lead) => (
                <span
                  key={lead.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {lead.email}
                </span>
              ))}
            </div>
          </div>

          {/* Asunto */}
          <div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del correo"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botones de modo */}
          <div className="flex space-x-4">
            <button
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200
                ${
                  isHtmlMode
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              <Code size={18} />
              <span>Modo HTML</span>
            </button>
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200
                ${
                  isPreviewMode
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              <Eye size={18} />
              <span>Vista Previa</span>
            </button>
          </div>

          {/* Editor/Preview */}
          {isPreviewMode ? (
            <div
              className="border rounded-lg p-4 min-h-[200px] bg-white"
              dangerouslySetInnerHTML={{
                __html: isHtmlMode ? content : content.replace(/\n/g, "<br>"),
              }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isHtmlMode
                  ? "<p>Escribe tu contenido HTML aquí...</p>"
                  : "Escribe tu mensaje aquí..."
              }
              rows={8}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                         font-mono"
            />
          )}

          {/* Progreso */}
          {isSending && progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Botón de envío */}
          <div className="flex justify-end">
            <button
              onClick={handleSendEmails}
              disabled={isSending}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg text-white
                transition-all duration-200
                ${
                  isSending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }
              `}
            >
              {isSending ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar a {pendingLeads.length} destinatarios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmailSender;

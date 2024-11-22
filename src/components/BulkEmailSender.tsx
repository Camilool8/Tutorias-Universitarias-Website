import React, { useState, useMemo } from "react";
import {
  Send,
  Code,
  Eye,
  Mail,
  Loader,
  File,
  Save,
  Filter,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { EmailTemplate } from "../types/email";
import { Modal } from "./shared/Modal";
import EmailTemplateGallery from "./EmailTemplateGallery";
import EmailTemplateForm from "./EmailTemplateForm";

interface Lead {
  id: string;
  email: string;
  status: string;
}

interface BulkEmailSenderProps {
  onClose: () => void;
  pendingLeads: Lead[];
  onLeadsUpdated: () => void;
  setError: (error: string) => void;
}

const BulkEmailSender: React.FC<BulkEmailSenderProps> = ({
  onClose,
  pendingLeads,
  onLeadsUpdated,
  setError,
}) => {
  // Estados del formulario
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

  // Estados para el filtrado
  const [sendMode, setSendMode] = useState<
    "pending" | "contacted" | "converted" | "not_interested"
  >("pending");

  // Plantillas y modales
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSubject(template.subject.trim());
    setContent(template.html_content.trim());
    setIsHtmlMode(true);
    setShowTemplateGallery(false);
    setSelectedTemplate(template);
  };

  const handleSaveAsTemplate = async () => {
    if (!content.trim() || !subject.trim()) {
      setError("Debes tener un asunto y contenido para crear una plantilla");
      return;
    }

    setSelectedTemplate({
      name: "",
      description: "",
      subject,
      html_content: content,
    });
    setShowTemplateForm(true);
  };

  const handleTemplateFormSuccess = () => {
    setShowTemplateForm(false);
    setSelectedTemplate(null);
  };

  // Calcular leads filtrados usando useMemo para optimizar rendimiento
  const filteredLeads = useMemo(() => {
    if (sendMode === "pending") {
      return pendingLeads.filter((lead) => lead.status === "pending");
    }

    if (sendMode === "contacted") {
      return pendingLeads.filter((lead) => lead.status === "contacted");
    }

    if (sendMode === "converted") {
      return pendingLeads.filter((lead) => lead.status === "converted");
    }

    return [];
  }, [pendingLeads, sendMode]);

  const showFeedback = (type: string, message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const validateEmailForm = (): boolean => {
    const errors: string[] = [];

    if (!subject?.trim()) {
      errors.push("El asunto es requerido");
    }
    if (!content?.trim()) {
      errors.push("El contenido es requerido");
    }
    if (filteredLeads.length === 0) {
      errors.push("No hay destinatarios seleccionados");
    }

    if (errors.length > 0) {
      setError(errors.join(", "));
      return false;
    }

    return true;
  };

  const handleSendEmails = async () => {
    if (!validateEmailForm()) return;

    setIsSending(true);
    let successCount = 0;

    try {
      const token = localStorage.getItem("adminToken");

      for (let i = 0; i < filteredLeads.length; i++) {
        const lead = filteredLeads[i];

        try {
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
            successCount++;
            // Actualizar el estado del lead
            await fetch(`/api/leads/${lead.id}`, {
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
          }

          // Actualizar el progreso
          const newProgress = ((i + 1) / filteredLeads.length) * 100;
          setProgress(newProgress);
        } catch (error) {
          console.error(`Error sending email to ${lead.email}:`, error);
        }
      }

      // Mostrar feedback final
      if (successCount === filteredLeads.length) {
        showFeedback(
          "success",
          `Se enviaron ${successCount} correos exitosamente`
        );
      } else if (successCount > 0) {
        showFeedback(
          "warning",
          `Se enviaron ${successCount} de ${filteredLeads.length} correos`
        );
      } else {
        showFeedback("error", "No se pudo enviar ningún correo");
      }

      onLeadsUpdated();
      setTimeout(onClose, 2000);
    } catch (error: unknown) {
      showFeedback(
        "error",
        "Error al enviar los correos. Por favor, intente de nuevo. Detalles: " +
          (error as Error).message
      );
    } finally {
      setIsSending(false);
      setProgress(0);
    }
  };

  return (
    <Modal title="Enviar Correo Masivo" onClose={onClose}>
      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : feedback.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Selector de modo de envío */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Filter size={18} />
            <span className="font-medium">Modo de envío:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <button
              onClick={() => setSendMode("pending")}
              className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg 
          transition-all duration-200 text-sm sm:text-base
          ${
            sendMode === "pending"
              ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-500 shadow-sm"
              : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200"
          }`}
            >
              <span className="hidden sm:inline">🕒 </span>
              <span className="flex-shrink-0">Pendientes</span>
              <span className="ml-1.5 flex-shrink-0 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
                {pendingLeads.filter((l) => l.status === "pending").length}
              </span>
            </button>

            <button
              onClick={() => setSendMode("contacted")}
              className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg 
          transition-all duration-200 text-sm sm:text-base
          ${
            sendMode === "contacted"
              ? "bg-blue-100 text-blue-800 border-2 border-blue-500 shadow-sm"
              : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
          }`}
            >
              <span className="hidden sm:inline">📞 </span>
              <span className="flex-shrink-0">Contactados</span>
              <span className="ml-1.5 flex-shrink-0 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
                {pendingLeads.filter((l) => l.status === "contacted").length}
              </span>
            </button>

            <button
              onClick={() => setSendMode("converted")}
              className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg 
          transition-all duration-200 text-sm sm:text-base
          ${
            sendMode === "converted"
              ? "bg-green-100 text-green-800 border-2 border-green-500 shadow-sm"
              : "bg-green-50 text-green-800 hover:bg-green-100 border border-green-200"
          }`}
            >
              <span className="hidden sm:inline">✨ </span>
              <span className="flex-shrink-0">Convertidos</span>
              <span className="ml-1.5 flex-shrink-0 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
                {pendingLeads.filter((l) => l.status === "converted").length}
              </span>
            </button>
          </div>
        </div>

        {/* Destinatarios */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Mail size={18} />
            <span className="font-medium">Destinatarios:</span>
            <span className="text-sm text-gray-500">
              ({filteredLeads.length} seleccionados)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredLeads.map((lead) => (
              <span
                key={lead.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                         text-xs font-medium bg-blue-100 text-blue-800"
              >
                {lead.email}
              </span>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto del correo"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          />

          {/* Acciones de Plantilla */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 
                       text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <File size={18} />
              <span>Usar Plantilla</span>
            </button>
            <button
              onClick={handleSaveAsTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 
                       text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={18} />
              <span>Guardar como Plantilla</span>
            </button>
          </div>

          {/* Controles de Edición */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
                       transition-colors ${
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
                       transition-colors ${
                         isPreviewMode
                           ? "bg-indigo-100 text-indigo-800"
                           : "bg-gray-100 text-gray-600"
                       }`}
            >
              <Eye size={18} />
              <span>Vista Previa</span>
            </button>
          </div>

          {/* Editor/Vista Previa */}
          {isPreviewMode ? (
            <div
              className="border rounded-lg p-4 min-h-[200px] bg-white prose max-w-none"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          )}

          {/* Barra de Progreso */}
          {isSending && progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Botón de Envío */}
          <div className="flex justify-end">
            <button
              onClick={handleSendEmails}
              disabled={isSending}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-white
                       transition-all duration-200 ${
                         isSending
                           ? "bg-gray-400 cursor-not-allowed"
                           : "bg-indigo-600 hover:bg-indigo-700"
                       }`}
            >
              {isSending ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar a {filteredLeads.length} destinatarios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modales de Plantillas */}
        <AnimatePresence>
          {showTemplateGallery && (
            <EmailTemplateGallery
              onSelectTemplate={handleTemplateSelect}
              onClose={() => setShowTemplateGallery(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTemplateForm && (
            <EmailTemplateForm
              template={selectedTemplate || undefined}
              onClose={() => {
                setShowTemplateForm(false);
                setSelectedTemplate(null);
              }}
              onSuccess={handleTemplateFormSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default BulkEmailSender;

import React, { useState } from "react";
import { Code, Eye, Save, Loader } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { EmailTemplate } from "../types/email";
import { useEmailTemplates } from "../hooks/useEmailTemplates";
import { Modal } from "./shared/Modal";
import { FeedbackMessage } from "./shared/FeedbackMessage";

interface EmailTemplateFormProps {
  template?: EmailTemplate;
  onClose: () => void;
  onSuccess: () => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  template,
  onClose,
  onSuccess,
}) => {
  const { saveTemplate, feedback } = useEmailTemplates();
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<EmailTemplate>({
    name: template?.name || "",
    description: template?.description || "",
    subject: template?.subject || "",
    html_content: template?.html_content || "",
    id: template?.id,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "El nombre es obligatorio";
    if (!formData.subject.trim()) errors.subject = "El asunto es obligatorio";
    if (!formData.html_content.trim())
      errors.html_content = "El contenido HTML es obligatorio";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await saveTemplate(formData);
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={`${template?.id ? "Editar" : "Nueva"} Plantilla`}
      onClose={onClose}
    >
      <AnimatePresence>
        {feedback && <FeedbackMessage feedback={feedback} />}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              ${validationErrors.name ? "border-red-300 bg-red-50" : ""}`}
            placeholder="Nombre de la plantilla"
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Breve descripción de la plantilla"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asunto del Correo
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${validationErrors.subject ? "border-red-300 bg-red-50" : ""}`}
            placeholder="Asunto del correo"
          />
          {validationErrors.subject && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.subject}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Contenido HTML
            </label>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              {isPreview ? (
                <>
                  <Code className="w-4 h-4 mr-1" />
                  Ver código
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Vista previa
                </>
              )}
            </button>
          </div>

          {isPreview ? (
            <div
              className={`border rounded-lg p-4 min-h-[300px] prose max-w-none
                ${
                  validationErrors.html_content
                    ? "border-red-300 bg-red-50"
                    : ""
                }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: formData.html_content }}
              />
            </div>
          ) : (
            <textarea
              name="html_content"
              value={formData.html_content}
              onChange={handleInputChange}
              rows={12}
              className={`w-full px-4 py-2 border rounded-lg font-mono text-sm
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                ${
                  validationErrors.html_content
                    ? "border-red-300 bg-red-50"
                    : ""
                }`}
              placeholder="<p>Tu contenido HTML aquí...</p>"
            />
          )}
          {validationErrors.html_content && (
            <p className="text-sm text-red-600">
              {validationErrors.html_content}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-white flex items-center
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2" size={18} />
                Guardar
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailTemplateForm;

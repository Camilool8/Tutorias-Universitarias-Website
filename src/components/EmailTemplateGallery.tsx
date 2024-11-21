import React, { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmailTemplate } from "../types/email";
import { useEmailTemplates } from "../hooks/useEmailTemplates";
import { LoadingOverlay } from "./shared/LoadingOverlay";
import { FeedbackMessage } from "./shared/FeedbackMessage";
import { TemplatePreview } from "./shared/TemplatePreview";
import { Modal } from "./shared/Modal";
import EmailTemplateForm from "./EmailTemplateForm";

interface EmailTemplateGalleryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onClose: () => void;
}

const EmailTemplateGallery: React.FC<EmailTemplateGalleryProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const {
    templates,
    isLoading,
    error,
    feedback,
    deleteTemplate,
    fetchTemplates,
  } = useEmailTemplates();

  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtrar y paginar plantillas
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredTemplates.length / itemsPerPage);
  const currentTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta plantilla?")) return;
    const success = await deleteTemplate(id);
    if (success) {
      setCurrentPage(1);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditTemplate(template);
    setShowTemplateForm(true);
  };

  const handleTemplateFormSuccess = () => {
    setShowTemplateForm(false);
    setEditTemplate(null);
    fetchTemplates();
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <Modal title="Galería de Plantillas" onClose={onClose} maxWidth="max-w-6xl">
      <div className="space-y-6">
        {/* Feedback y Errores */}
        <AnimatePresence>
          {feedback && <FeedbackMessage feedback={feedback} />}
          {error && (
            <FeedbackMessage feedback={{ type: "error", message: error }} />
          )}
        </AnimatePresence>

        {/* Búsqueda y Botón Nuevo */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={() => setShowTemplateForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 
                     text-white rounded-lg hover:bg-indigo-700 transition-colors
                     whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" />
            Nueva Plantilla
          </button>
        </div>

        {/* Grid de Plantillas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg overflow-hidden hover:shadow-lg 
                       transition-shadow duration-300"
            >
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="p-4">
                <div className="text-sm text-gray-600 mb-4">
                  <p>
                    <strong>Asunto:</strong> {template.subject}
                  </p>
                  <p className="text-xs mt-1">
                    Última actualización:{" "}
                    {new Date(template.updated_at!).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg 
                             hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Seleccionar
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="p-1 text-gray-600 hover:text-indigo-600 
                               transition-colors"
                      title="Vista previa"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-gray-600 hover:text-indigo-600 
                               transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id!)}
                      className="p-1 text-gray-600 hover:text-red-600 
                               transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paginación */}
        {pageCount > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border hover:bg-gray-50 
                       disabled:opacity-50 disabled:hover:bg-white"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="p-2 rounded-lg border hover:bg-gray-50 
                       disabled:opacity-50 disabled:hover:bg-white"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Modal de Vista Previa */}
        <AnimatePresence>
          {previewTemplate && (
            <TemplatePreview
              template={previewTemplate}
              onClose={() => setPreviewTemplate(null)}
            />
          )}
        </AnimatePresence>

        {/* Modal de Formulario */}
        <AnimatePresence>
          {showTemplateForm && (
            <EmailTemplateForm
              template={editTemplate}
              onClose={() => {
                setShowTemplateForm(false);
                setEditTemplate(null);
              }}
              onSuccess={handleTemplateFormSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default EmailTemplateGallery;

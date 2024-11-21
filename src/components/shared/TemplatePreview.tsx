import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { EmailTemplate } from "../../types/email";

interface TemplatePreviewProps {
  template: EmailTemplate;
  onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">Vista previa: {template.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
        <div
          dangerouslySetInnerHTML={{ __html: template.html_content }}
          className="prose max-w-none"
        />
      </div>
    </motion.div>
  </motion.div>
);

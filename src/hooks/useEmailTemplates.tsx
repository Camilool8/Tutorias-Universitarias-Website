import { useState, useEffect, useCallback } from "react";
import type { EmailTemplate, FeedbackMessage } from "../types/email";

interface UseEmailTemplatesReturn {
  templates: EmailTemplate[];
  isLoading: boolean;
  error: string | null;
  feedback: FeedbackMessage | null;
  fetchTemplates: () => Promise<void>;
  deleteTemplate: (id: string) => Promise<boolean>;
  saveTemplate: (template: EmailTemplate) => Promise<boolean>;
}

export const useEmailTemplates = (): UseEmailTemplatesReturn => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const showFeedback = useCallback(
    (type: "success" | "error", message: string) => {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), 3000);
    },
    []
  );

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/email-templates", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al obtener las plantillas");

      const data = await response.json();
      setTemplates(data);
      setError(null);
    } catch (error) {
      setError("Error al cargar las plantillas. Por favor, intente de nuevo.");
      showFeedback("error", "Error al cargar las plantillas");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/email-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar la plantilla");

      await fetchTemplates();
      showFeedback("success", "Plantilla eliminada correctamente");
      return true;
    } catch (error) {
      showFeedback("error", "Error al eliminar la plantilla");
      return false;
    }
  };

  const saveTemplate = async (template: EmailTemplate): Promise<boolean> => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = template.id
        ? `/api/email-templates/${template.id}`
        : "/api/email-templates";

      const response = await fetch(url, {
        method: template.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) throw new Error("Error al guardar la plantilla");

      await fetchTemplates();
      showFeedback(
        "success",
        `Plantilla ${template.id ? "actualizada" : "creada"} correctamente`
      );
      return true;
    } catch (error) {
      showFeedback("error", "Error al guardar la plantilla");
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    feedback,
    fetchTemplates,
    deleteTemplate,
    saveTemplate,
  };
};

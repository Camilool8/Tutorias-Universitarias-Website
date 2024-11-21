import React from "react";
import { Loader } from "lucide-react";

export const LoadingOverlay: React.FC<{ message?: string }> = ({
  message = "Cargando...",
}) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <Loader className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

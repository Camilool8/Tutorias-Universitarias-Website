import React, { ReactNode, MouseEvent } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  maxWidth = "max-w-4xl",
}) => {
  const handleModalClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        className={`relative top-20 mx-auto p-5 border w-11/12 shadow-lg rounded-md bg-white ${maxWidth}`}
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

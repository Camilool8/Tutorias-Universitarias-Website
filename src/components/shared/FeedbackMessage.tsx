import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle } from "lucide-react";
import type { FeedbackMessage as FeedbackMessageType } from "../../types/email";

interface FeedbackMessageProps {
  feedback: FeedbackMessageType;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  feedback,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`mb-4 p-3 rounded flex items-center ${
      feedback.type === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {feedback.type === "success" ? (
      <CheckCircle className="mr-2" size={18} />
    ) : (
      <AlertTriangle className="mr-2" size={18} />
    )}
    <span>{feedback.message}</span>
  </motion.div>
);

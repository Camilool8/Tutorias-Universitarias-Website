import React, { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Mail,
  Phone,
  Calculator,
  ExternalLink,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SEO from "../components/shared/SEO";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";

const Contact: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const { location: geoLocation } = useGeolocation();
  const whatsappNumber = getWhatsAppNumber(geoLocation?.continent_code);
  const whatsappMessage = encodeURIComponent("¡Hola!");

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqData = [
    {
      question: "¿Cómo funciona el proceso de cotización?",
      answer:
        "Simplemente completa el formulario en la página 'Cotizar' con los detalles de tu tarea. Nuestro equipo revisará la información y te enviará una cotización personalizada a tu WhatsApp en poco tiempo.",
    },
    {
      question: "¿Cuánto tiempo toma recibir mi tarea completada?",
      answer:
        "El tiempo de entrega depende de la complejidad y extensión de la tarea. Siempre nos aseguramos de entregar antes de tu fecha límite. Los plazos específicos se discuten durante el proceso de cotización.",
    },
    {
      question: "¿Garantizan la originalidad del trabajo?",
      answer:
        "Absolutamente. Todo nuestro trabajo es original y pasa por verificaciones de plagio. Nos comprometemos a entregar contenido único y de alta calidad.",
    },
    {
      question: "¿Ofrecen revisiones o correcciones?",
      answer:
        "Sí, ofrecemos revisiones gratuitas si es necesario. Nuestro objetivo es tu completa satisfacción con el trabajo entregado.",
    },
    {
      question: "¿Cómo se realiza el pago?",
      answer:
        "Una vez que aceptes la cotización, te proporcionaremos instrucciones detalladas para realizar el pago. Ofrecemos múltiples métodos de pago seguros para tu comodidad.",
    },
    {
      question: "¿Qué pasa si no estoy satisfecho con el trabajo?",
      answer:
        "Tu satisfacción es nuestra prioridad. Si no estás completamente satisfecho, trabajaremos contigo para hacer las revisiones necesarias sin costo adicional.",
    },
    {
      question: "¿Pueden manejar tareas urgentes?",
      answer:
        "Sí, podemos manejar tareas con plazos ajustados. Sin embargo, te recomendamos que nos contactes lo antes posible para asegurar la disponibilidad y evitar cargos por urgencia.",
    },
    {
      question: "¿En qué materias o áreas ofrecen ayuda?",
      answer:
        "Ofrecemos asistencia en una amplia gama de materias y disciplinas académicas. Esto incluye, pero no se limita a, matemáticas, ciencias, humanidades, negocios, ingeniería y más. Si tienes dudas sobre una materia específica, no dudes en preguntarnos.",
    },
  ];

  return (
    <>
      <SEO
        title="Contacto"
        description="¿Necesitas ayuda con tus estudios? Contáctanos para recibir asistencia personalizada. Respuesta rápida y atención 24/7."
        canonicalUrl="https://www.tutoriasuniversitarias.com/contact"
        keywords="contacto tutorias, asistencia académica, ayuda universitaria, consultas académicas"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contacto - Tutorías Universitarias",
          mainEntity: {
            "@type": "Organization",
            name: "Tutorías Universitarias",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+1-849-270-5605",
              contactType: "customer service",
              availableLanguage: ["Spanish", "English"],
            },
          },
        }}
      />
      <PageTransition>
        <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen py-8 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 md:mb-12 text-indigo-800">
              Contacto y Preguntas Frecuentes
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-105">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-indigo-700">
                  Información de Contacto
                </h2>
                <ul className="space-y-4 md:space-y-6">
                  <ContactItem
                    icon={<Phone size={20} />}
                    text="+1 849 270 5605"
                    href="tel:+18492705605"
                  />
                  <ContactItem
                    icon={<Mail size={20} />}
                    text={`soporte.tutoriasuniversitarias@gmail.com`}
                    href={`mailto:${atob(
                      "c29wb3J0ZS50dXRvcmlhc3VuaXZlcnNpdGFyaWFzQGdtYWlsLmNvbQ=="
                    )}`}
                  />
                </ul>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-105">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-indigo-700">
                  Horario de Atención
                </h2>
                <p className="mb-2 md:mb-4 text-base md:text-lg">
                  Lunes a Domingo: 12:00 AM - 11:59 PM
                </p>
                <p className="text-indigo-600 font-semibold text-base md:text-lg">
                  Servicio las 24 horas del día.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8 text-indigo-800">
                Preguntas Frecuentes
              </h2>
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openQuestion === index}
                    onClick={() => toggleQuestion(index)}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-indigo-800">
                ¿Listo para empezar?
              </h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-700 max-w-2xl mx-auto">
                Si tienes más preguntas o estás listo para solicitar ayuda, no
                dudes en contactarnos.
              </p>
              <div className="flex flex-row justify-center items-center space-x-4">
                <Link
                  to="/cotizar"
                  className="inline-flex items-center px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base md:text-lg font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-colors duration-300"
                >
                  <Calculator className="mr-2" size={20} />
                  <span className="whitespace-nowrap">
                    Solicitar Cotización
                  </span>
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300 flex-shrink-0"
                  aria-label="Contactar por WhatsApp"
                >
                  <FaWhatsapp size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

const ContactItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  href?: string;
}> = ({ icon, text, href }) => (
  <li className="flex items-center space-x-3 md:space-x-4">
    <span className="text-indigo-500 bg-indigo-100 p-2 md:p-3 rounded-full flex-shrink-0">
      {icon}
    </span>
    {href ? (
      <a
        href={href}
        className="text-base md:text-lg text-gray-700 hover:text-indigo-600 transition-colors duration-300 flex items-center break-words"
      >
        {text}
        <ExternalLink size={14} className="ml-1 flex-shrink-0" />
      </a>
    ) : (
      <span className="text-base md:text-lg text-gray-700 break-words">
        {text}
      </span>
    )}
  </li>
);

const FAQItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-200 pb-4">
    <button
      className="flex justify-between items-center w-full text-left"
      onClick={onClick}
    >
      <span className="text-base md:text-lg font-semibold text-gray-800 pr-4">
        {question}
      </span>
      {isOpen ? (
        <MinusCircle className="text-indigo-500 flex-shrink-0" size={20} />
      ) : (
        <PlusCircle className="text-indigo-500 flex-shrink-0" size={20} />
      )}
    </button>
    {isOpen && (
      <p className="mt-4 text-sm md:text-base text-gray-600 animate-fadeIn">
        {answer}
      </p>
    )}
  </div>
);

export default Contact;

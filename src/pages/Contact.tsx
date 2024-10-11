import React, { useState } from 'react';
import {
  PlusCircle,
  MinusCircle,
  Mail,
  Phone,
  MapPin,
  Calculator,
  ExternalLink,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Contact: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqData = [
    {
      question: '¿Cómo funciona el proceso de cotización?',
      answer:
        "Simplemente completa el formulario en la página 'Cotizar' con los detalles de tu tarea. Nuestro equipo revisará la información y te enviará una cotización personalizada a tu WhatsApp en poco tiempo.",
    },
    {
      question: '¿Cuánto tiempo toma recibir mi tarea completada?',
      answer:
        'El tiempo de entrega depende de la complejidad y extensión de la tarea. Siempre nos aseguramos de entregar antes de tu fecha límite. Los plazos específicos se discuten durante el proceso de cotización.',
    },
    {
      question: '¿Garantizan la originalidad del trabajo?',
      answer:
        'Absolutamente. Todo nuestro trabajo es original y pasa por verificaciones de plagio. Nos comprometemos a entregar contenido único y de alta calidad.',
    },
    {
      question: '¿Ofrecen revisiones o correcciones?',
      answer:
        'Sí, ofrecemos revisiones gratuitas si es necesario. Nuestro objetivo es tu completa satisfacción con el trabajo entregado.',
    },
    {
      question: '¿Cómo se realiza el pago?',
      answer:
        'Una vez que aceptes la cotización, te proporcionaremos instrucciones detalladas para realizar el pago. Ofrecemos múltiples métodos de pago seguros para tu comodidad.',
    },
    {
      question: '¿Qué pasa si no estoy satisfecho con el trabajo?',
      answer:
        'Tu satisfacción es nuestra prioridad. Si no estás completamente satisfecho, trabajaremos contigo para hacer las revisiones necesarias sin costo adicional.',
    },
    {
      question: '¿Pueden manejar tareas urgentes?',
      answer:
        'Sí, podemos manejar tareas con plazos ajustados. Sin embargo, te recomendamos que nos contactes lo antes posible para asegurar la disponibilidad y evitar cargos por urgencia.',
    },
    {
      question: '¿En qué materias o áreas ofrecen ayuda?',
      answer:
        'Ofrecemos asistencia en una amplia gama de materias y disciplinas académicas. Esto incluye, pero no se limita a, matemáticas, ciencias, humanidades, negocios, ingeniería y más. Si tienes dudas sobre una materia específica, no dudes en preguntarnos.',
    },
  ];

  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-indigo-800">
            Contacto y Preguntas Frecuentes
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-700">
                Información de Contacto
              </h2>
              <ul className="space-y-6">
                <ContactItem
                  icon={<Phone />}
                  text="+34 608 83 72 72"
                  href="tel:+34608837272"
                />
                <ContactItem
                  icon={<Mail />}
                  text="info@tutoriasuniversitarias.com"
                  href="mailto:info@tutoriasuniversitarias.com"
                />
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-2xl font-semibold mb-6 text-indigo-700">
                Horario de Atención
              </h2>
              <p className="mb-4 text-lg">
                Lunes a Domingo: 12:00 AM - 11:59 PM
              </p>
              <p className="text-indigo-600 font-semibold text-lg">
                Respuesta garantizada en menos de 24 horas
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl mb-16">
            <h2 className="text-3xl font-semibold text-center mb-8 text-indigo-800">
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
            <h2 className="text-3xl font-semibold mb-6 text-indigo-800">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
              Si tienes más preguntas o estás listo para solicitar ayuda, no
              dudes en contactarnos.
            </p>
            <a
              href="/cotizar"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-colors duration-300"
            >
              <Calculator className="mr-2" size={24} />
              Solicitar Cotización
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const ContactItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  href?: string;
}> = ({ icon, text, href }) => (
  <li className="flex items-center space-x-4">
    <span className="text-indigo-500 bg-indigo-100 p-3 rounded-full">{icon}</span>
    {href ? (
      <a
        href={href}
        className="text-lg text-gray-700 hover:text-indigo-600 transition-colors duration-300 flex items-center"
      >
        {text}
        <ExternalLink size={16} className="ml-2" />
      </a>
    ) : (
      <span className="text-lg text-gray-700">{text}</span>
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
      <span className="text-lg font-semibold text-gray-800">{question}</span>
      {isOpen ? (
        <MinusCircle className="text-indigo-500 flex-shrink-0" />
      ) : (
        <PlusCircle className="text-indigo-500 flex-shrink-0" />
      )}
    </button>
    {isOpen && <p className="mt-4 text-gray-600 animate-fadeIn">{answer}</p>}
  </div>
);

export default Contact;
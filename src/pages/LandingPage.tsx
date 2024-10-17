import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Send,
  Award,
  Calculator,
  Zap,
  Users,
  Shield,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FlagIcon } from "react-flag-kit";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";

const LandingPage: React.FC = () => {
  const { location: geoLocation } = useGeolocation();
  const whatsappNumber = getWhatsAppNumber(geoLocation?.continent_code);
  const whatsappMessage = encodeURIComponent("¡Hola!");

  return (
    <div className="bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Students studying"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Bienvenido a Tutorías Universitarias
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in-up">
            Tu solución integral para el éxito académico. Transformamos tus
            desafíos en oportunidades de aprendizaje y crecimiento.
          </p>
          <div className="flex justify-center items-center space-x-4">
            <Link
              to="/cotizar"
              className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-yellow-300 transition-all duration-300 inline-flex items-center animate-fade-in-up"
            >
              <Calculator className="mr-2" size={20} />
              Cotiza Con Nosotros
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-all duration-300 animate-fade-in-up"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-900">
            ¿Por qué elegir Tutorias Universitarias?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CheckCircle className="text-green-500" size={48} />}
              title="Calidad Garantizada"
              description="Nuestro equipo de expertos asegura la excelencia académica en cada tarea."
            />
            <FeatureCard
              icon={<Clock className="text-blue-500" size={48} />}
              title="Entrega Puntual"
              description="Cumplimos rigurosamente con los plazos de entrega, respetando tus fechas límite."
            />
            <FeatureCard
              icon={<DollarSign className="text-yellow-500" size={48} />}
              title="Precios Competitivos"
              description="Ofrecemos las tarifas más accesibles del mercado, diseñadas para estudiantes."
            />
            <FeatureCard
              icon={<Send className="text-purple-500" size={48} />}
              title="Comunicación Eficaz"
              description="Cotización instantánea y comunicación directa por WhatsApp para una experiencia fluida."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-900">
            Cómo Funciona
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 md:space-x-8">
            <StepCard
              icon={<Calculator className="text-blue-500" size={48} />}
              title="1. Solicita una Cotización"
              description="Comparte los detalles de tu tarea a través de nuestro formulario en línea."
            />
            <div className="hidden md:block text-blue-500">
              <Zap size={48} />
            </div>
            <StepCard
              icon={<DollarSign className="text-green-500" size={48} />}
              title="2. Aprueba y Paga"
              description="Revisa la cotización, aprueba los términos y realiza el pago de forma segura."
            />
            <div className="hidden md:block text-blue-500">
              <Zap size={48} />
            </div>
            <StepCard
              icon={<Award className="text-yellow-500" size={48} />}
              title="3. Recibe tu Tarea"
              description="Nuestros expertos trabajarán en tu tarea y te la entregarán antes de la fecha límite."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Lo que Dicen Nuestros Estudiantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Tutorías Universitarias salvó mi semestre. Su trabajo es impecable y siempre a tiempo."
              author="María García, Estudiante de Ingeniería"
              countryCode="DO"
            />
            <TestimonialCard
              quote="La calidad de las tareas supera mis expectativas. Definitivamente los recomiendo."
              author="Carlos Oviedo, Estudiante de Economía"
              countryCode="ES"
            />
            <TestimonialCard
              quote="El proceso es tan fácil y la comunicación es excelente. ¡Son los mejores!"
              author="Ana Lucía, Estudiante de Psicología"
              countryCode="MX"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-blue-900">
            ¿Listo para Mejorar tus Calificaciones?
          </h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            No dejes que el estrés de las tareas te domine. Con Tutorías
            Universitarias, tienes un equipo de expertos listos para ayudarte a
            alcanzar el éxito académico que mereces.
          </p>
          <div className="flex justify-center items-center space-x-4">
            <Link
              to="/cotizar"
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Calculator className="mr-2" size={20} />
              Cotiza tu Tarea Ahora
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-all duration-300"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <TrustIndicator
              icon={<Shield size={24} />}
              text="100% Confidencial"
            />
            <TrustIndicator
              icon={<Users size={24} />}
              text="Más de 2,000 Estudiantes Satisfechos"
            />
            <TrustIndicator
              icon={<Award size={24} />}
              text="Expertos en Todas las Materias"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="feature-card bg-white p-6 rounded-lg shadow-lg text-center transition-transform hover:scale-105">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const StepCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="step-card bg-white p-6 rounded-lg shadow-lg text-center transition-transform hover:scale-105 w-full md:w-64">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  countryCode: string;
}> = ({ quote, author, countryCode }) => {
  return (
    <div className="testimonial-card bg-white bg-opacity-10 p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
      <p className="text-lg mb-4 italic">"{quote}"</p>
      <div className="flex items-center justify-between">
        <p className="font-semibold">- {author}</p>
        <FlagIcon code={countryCode} size={24} />
      </div>
    </div>
  );
};

const TrustIndicator: React.FC<{
  icon: React.ReactNode;
  text: string;
}> = ({ icon, text }) => {
  return (
    <div className="flex items-center space-x-2 text-gray-600">
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
};

export default LandingPage;

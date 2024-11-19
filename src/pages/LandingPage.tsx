import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Calculator,
  ArrowRight,
  Shield,
  Zap,
  Star,
  Clock,
  DollarSign,
  Send,
  Award,
  BookOpen,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";
const UniversitySlider = lazy(() => import("../components/UniversitySlider"));

// Datos para las features
const features = [
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: "Calidad Garantizada",
    description:
      "Nuestro equipo de expertos asegura la excelencia académica en cada tarea",
  },
  {
    icon: <Clock className="w-8 h-8 text-purple-600" />,
    title: "Entrega Puntual",
    description:
      "Cumplimos rigurosamente con los plazos, respetando tus fechas límite",
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
    title: "Verificación Turnitin",
    description:
      "Garantizamos la originalidad de tu trabajo con informes detallados",
  },
  {
    icon: <DollarSign className="w-8 h-8 text-yellow-600" />,
    title: "Precios Competitivos",
    description: "Tarifas accesibles diseñadas especialmente para estudiantes",
  },
  {
    icon: <Zap className="w-8 h-8 text-orange-600" />,
    title: "Respuesta Rápida",
    description:
      "Atención inmediata y seguimiento personalizado de tu proyecto",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
    title: "Todas las Materias",
    description: "Expertos en diversas disciplinas académicas a tu disposición",
  },
];

// Datos para los pasos
const steps = [
  {
    icon: <Calculator className="w-12 h-12 text-blue-600" />,
    title: "Solicita tu Cotización",
    description:
      "Comparte los detalles de tu proyecto académico a través de nuestro formulario",
  },
  {
    icon: <Send className="w-12 h-12 text-purple-600" />,
    title: "Aprueba y Paga",
    description:
      "Revisa la propuesta personalizada y realiza el pago de forma segura",
  },
  {
    icon: <Award className="w-12 h-12 text-green-600" />,
    title: "Recibe tu Trabajo",
    description:
      "Obtén tu trabajo completado antes de la fecha límite establecida",
  },
];

// Datos para los testimonios
const testimonials = [
  {
    quote:
      "El servicio superó todas mis expectativas. La calidad y puntualidad fueron excepcionales.",
    author: "María García",
    country: "España",
  },
  {
    quote:
      "Gracias a su ayuda, pude mejorar significativamente mi rendimiento académico.",
    author: "Carlos Rodríguez",
    country: "México",
  },
  {
    quote: "Excelente atención y profesionalismo. Los recomiendo totalmente.",
    author: "Ana Martínez",
    country: "República Dominicana",
  },
];

const LandingPage = () => {
  const { location: geoLocation } = useGeolocation();
  const whatsappNumber = getWhatsAppNumber(geoLocation?.continent_code);
  const whatsappMessage = encodeURIComponent("¡Hola!");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Precargar la imagen del hero
  useEffect(() => {
    const img = new Image();
    img.src = "/images/hero-image.webp";
    img.onload = () => setIsImageLoaded(true);
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Hero Section Mejorado */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Fondo de respaldo con gradiente mientras carga la imagen */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900" />

        {/* Contenedor de la imagen de fondo */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-out
          ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
        >
          {/* Overlay de gradiente sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-blue-900/85 to-purple-900/90" />

          {/* Imagen de fondo */}
          <img
            src="/images/hero-image.webp"
            alt="imagen de fondo"
            className="h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Patrón de puntos decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />

        {/* Contenido principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Título principal */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              <span className="block">Bienvenido a</span>
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-transparent bg-clip-text">
                Tutorías Universitarias
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-200 leading-relaxed">
              Tu aliado académico que convierte los retos en oportunidades de
              aprendizaje y crecimiento profesional
            </p>

            {/* Botones CTA */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8">
              <Link
                to="/cotizar"
                className="group relative inline-flex items-center justify-center
                       px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 
                       text-blue-900 font-semibold transform transition-all duration-300 
                       hover:scale-105 hover:shadow-xl"
              >
                <Calculator className="mr-2 h-5 w-5" />
                <span>Cotiza Con Nosotros</span>
                <ArrowRight
                  className="ml-2 h-5 w-5 transform transition-transform 
                                   group-hover:translate-x-1"
                />
              </Link>

              <a
                aria-label="Contactar por WhatsApp"
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-3
                       rounded-full bg-green-500 text-white 
                       transform transition-all duration-300 hover:scale-105
                       hover:shadow-xl hover:bg-green-600"
              >
                <FaWhatsapp className="h-6 w-6" />
              </a>
            </div>

            {/* Badges de confianza */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mt-12"
            >
              <TrustBadge
                icon={<Shield className="h-6 w-6" />}
                text="100% Confidencial"
              />
              <TrustBadge
                icon={<Star className="h-6 w-6" />}
                text="Calidad Garantizada"
              />
              <TrustBadge
                icon={<Zap className="h-6 w-6" />}
                text="Entrega Rápida"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Degradado inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-blue-50 to-transparent" />
      </section>

      {/* Features Section */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-indigo-800 font-medium">Cargando...</p>
            </div>
          </div>
        }
      >
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Tutorías Universitarias
                </span>
                ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transformamos tu experiencia académica con soluciones
                personalizadas y resultados excepcionales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Proceso Simple y Efectivo
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                En tres pasos sencillos, transformamos tus desafíos en éxitos
                académicos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Línea conectora para desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 transform -translate-y-1/2" />

              {steps.map((step, index) => (
                <StepCard
                  key={index}
                  {...step}
                  number={index + 1}
                  delay={index * 0.2}
                />
              ))}
            </div>
          </div>
        </section>

        {/* University Slider */}
        <UniversitySlider />

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-br from-blue-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Voces de Éxito
              </h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Descubre lo que nuestros estudiantes dicen sobre su experiencia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  {...testimonial}
                  delay={index * 0.2}
                />
              ))}
            </div>
          </div>
        </section>
      </Suspense>

      {/* Final CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              ¿Listo para Alcanzar la{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Excelencia Académica
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              No dejes que los desafíos académicos te detengan. Únete a miles de
              estudiantes que ya han transformado su experiencia educativa.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/cotizar"
                className="group flex items-center justify-center px-8 py-4 rounded-full
                         bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Comienza Tu Proyecto
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                aria-label="Contactar por WhatsApp"
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-8 py-4 rounded-full
                         bg-green-500 text-white font-semibold
                         transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <FaWhatsapp className="mr-2 h-5 w-5" />
                Contacta con Nosotros
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Componente para los badges de confianza
const TrustBadge = ({ icon, text }) => (
  <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
    <span className="text-yellow-400">{icon}</span>
    <span className="text-white font-medium">{text}</span>
  </div>
);

// Componentes Auxiliares
const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300
               border border-gray-100 hover:border-blue-100 group"
  >
    <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100
                    flex items-center justify-center"
      >
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const StepCard = ({ icon, title, description, number, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative bg-white rounded-2xl p-8 shadow-xl"
  >
    <div
      className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-r 
                    from-blue-600 to-purple-600 text-white flex items-center justify-center
                    font-bold text-lg"
    >
      {number}
    </div>
    <div className="mb-6">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, country, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 relative group
               hover:bg-white/20 transition-all duration-300"
  >
    <div className="mb-6 text-gray-200 italic relative">
      <span className="absolute -top-4 -left-2 text-4xl text-purple-400 opacity-50">
        "
      </span>
      {quote}
      <span className="absolute -bottom-4 -right-2 text-4xl text-purple-400 opacity-50">
        "
      </span>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-gray-300 text-sm">{country}</p>
      </div>
    </div>
  </motion.div>
);

export default LandingPage;

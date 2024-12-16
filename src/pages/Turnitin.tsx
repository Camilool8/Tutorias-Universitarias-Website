import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Check,
  AlertTriangle,
  FileText,
  Award,
  Star,
  Zap,
  Lock,
  Calculator,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import SEO from "../components/shared/SEO";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";

const TurnitinSection = () => {
  const { location: geoLocation } = useGeolocation();
  const whatsappNumber = getWhatsAppNumber(geoLocation?.continent_code);
  const whatsappMessage = encodeURIComponent(
    "¡Hola! Me interesa el servicio de verificación con Turnitin"
  );

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Máxima Protección Académica",
      description:
        "Garantizamos la originalidad de tu trabajo con la herramienta más confiable del mundo académico.",
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Calidad Superior",
      description:
        "Recibe un informe detallado que certifica la originalidad de tu contenido.",
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Respuesta Rápida",
      description:
        "Resultados detallados en menos de 24 horas para tu tranquilidad.",
    },
  ];

  const comparisonPoints = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Seguridad Académica",
      withTurnitin:
        "Al usarlo obtienes garantía total de originalidad certificada",
      withoutTurnitin:
        "Al no usarlo existe riesgo de contenido duplicado no detectado",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Calificaciones",
      withTurnitin:
        "Al usarlo ofrecemos máxima probabilidad de excelentes notas",
      withoutTurnitin:
        "Al no usarlo existe riesgo de penalizaciones por similitud",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Documentación",
      withTurnitin: "Al usarlo obtendrás un informe profesional detallado",
      withoutTurnitin:
        "Al no usarlo no tendrás evidencia tan detallada de originalidad",
    },
  ];

  return (
    <>
      <SEO
        title="Verificación Turnitin"
        description="Garantiza la originalidad de tus trabajos académicos con nuestro servicio de verificación Turnitin. Informes detallados y resultados en 24 horas."
        canonicalUrl="https://www.tutoriasuniversitarias.com/turnitin"
        keywords="turnitin, verificación plagio, originalidad académica, informes turnitin, autenticidad trabajos"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Verificación Turnitin",
          description: "Servicio de verificación de originalidad académica",
          provider: {
            "@type": "EducationalOrganization",
            name: "Tutorías Universitarias",
          },
          offers: {
            "@type": "Offer",
            price: "20.00",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-indigo-800 mb-6 leading-tight">
                Garantía de Originalidad
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  con Turnitin
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Asegura la excelencia académica con el servicio de verificación
                más confiable del mercado al mejor precio.
              </p>
            </motion.div>

            {/* Beneficios Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 duration-300"
                >
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-800 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tabla de Comparación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-24 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full translate-x-32 -translate-y-32 opacity-50"></div>

              <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-12 text-center relative z-10">
                La Diferencia de Usar Turnitin
              </h2>

              <div className="space-y-8">
                {comparisonPoints.map((point, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative z-10"
                  >
                    <div className="flex items-center space-x-4 bg-indigo-50 p-4 rounded-xl">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        {point.icon}
                      </div>
                      <h3 className="font-semibold text-indigo-800">
                        {point.title}
                      </h3>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-green-700">
                      <Check className="inline-block mr-2" size={16} />
                      {point.withTurnitin}
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl text-red-700">
                      <AlertTriangle className="inline-block mr-2" size={16} />
                      {point.withoutTurnitin}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sección de Precios y CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-8 md:p-12 text-white overflow-hidden">
                <div className="absolute top-0 right-0 -mt-16 -mr-16">
                  <div className="w-64 h-64 bg-white opacity-10 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                      El Mejor Precio del Mercado
                    </h2>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <Check className="flex-shrink-0 text-green-400" />
                        <span className="text-lg">
                          Solo USD$20 por verificación de documento
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Check className="flex-shrink-0 text-green-400" />
                        <span className="text-lg">
                          Puedes verificar documentos ilimitados en tu pedido
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="flex-shrink-0 text-yellow-400" />
                        <span className="text-lg font-semibold">
                          ¡1 verificación de documento GRATIS con la compra de 5
                          trabajos!
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <Link
                        to="/cotizar"
                        className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 rounded-full font-semibold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                      >
                        <Calculator className="mr-2" size={20} />
                        Cotizar Ahora
                      </Link>
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                      >
                        <FaWhatsapp className="mr-2" size={20} />
                        Consultar por WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <img
                      src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Estudiantes exitosos"
                      className="rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TurnitinSection;

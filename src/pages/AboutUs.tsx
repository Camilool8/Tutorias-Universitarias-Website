import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Award,
  Target,
  Users,
  Briefcase,
  Shield,
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import PageTransition from "../components/PageTransition";
import SEO from "../components/shared/SEO";
import useGeolocation, { getWhatsAppNumber } from "../hooks/useGeolocation";

const AboutUs: React.FC = () => {
  const [expandedValue, setExpandedValue] = useState<string | null>(null);
  const { location: geoLocation } = useGeolocation();
  const whatsappNumber = getWhatsAppNumber(geoLocation?.continent_code);
  const whatsappMessage = encodeURIComponent("¡Hola!");

  const toggleExpand = (value: string) => {
    setExpandedValue(expandedValue === value ? null : value);
  };

  return (
    <>
      <SEO
        title="Sobre Nosotros"
        description="Conoce nuestro equipo de tutores expertos y nuestra misión de ayudar a estudiantes universitarios a alcanzar la excelencia académica."
        canonicalUrl="https://www.tutoriasuniversitarias.com/about"
        keywords="tutores universitarios, equipo académico, misión educativa, excelencia académica, ayuda universitaria"
      />
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4 py-16">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-center mb-16 text-indigo-800"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Sobre Nosotros
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Estudiantes colaborando"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold mb-4 text-indigo-700">
                  Nuestra Misión
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  En Tutorias Universitarias, nos dedicamos a proporcionar apoyo
                  académico de alta calidad a estudiantes universitarios.
                  Nuestro objetivo es facilitar el aprendizaje, fomentar el
                  crecimiento académico y ayudar a los estudiantes a alcanzar su
                  máximo potencial.
                </p>
                <div className="flex items-center space-x-4 text-indigo-600">
                  <Target size={32} />
                  <span className="text-2xl font-semibold">
                    Excelencia Académica
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <FeatureCard
                icon={<BookOpen className="text-indigo-500" size={48} />}
                title="Amplia Gama de Materias"
                description="Ofrecemos asistencia en una amplia variedad de disciplinas académicas, desde ciencias hasta humanidades."
              />
              <FeatureCard
                icon={<Briefcase className="text-indigo-500" size={48} />}
                title="Experiencia Comprobada"
                description="Años de experiencia ayudando a estudiantes a superar desafíos académicos y lograr sus metas educativas."
              />
              <FeatureCard
                icon={<Award className="text-indigo-500" size={48} />}
                title="Compromiso con la Calidad"
                description="Nos esforzamos por ofrecer un trabajo de la más alta calidad, garantizando la satisfacción de nuestros clientes."
              />
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-3xl shadow-xl mb-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-10 text-indigo-800 text-center">
                Nuestros Valores
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValueItem
                  icon={<Shield size={32} />}
                  title="Integridad"
                  description="Mantenemos los más altos estándares éticos en todas nuestras interacciones y servicios."
                  isExpanded={expandedValue === "integrity"}
                  onToggle={() => toggleExpand("integrity")}
                />
                <ValueItem
                  icon={<Users size={32} />}
                  title="Colaboración"
                  description="Trabajamos en estrecha colaboración con los estudiantes para entender y satisfacer sus necesidades académicas."
                  isExpanded={expandedValue === "collaboration"}
                  onToggle={() => toggleExpand("collaboration")}
                />
                <ValueItem
                  icon={<BookOpen size={32} />}
                  title="Aprendizaje Continuo"
                  description="Nos mantenemos actualizados con las últimas tendencias educativas y métodos de enseñanza."
                  isExpanded={expandedValue === "learning"}
                  onToggle={() => toggleExpand("learning")}
                />
                <ValueItem
                  icon={<Target size={32} />}
                  title="Orientación a Resultados"
                  description="Nos enfocamos en ayudar a los estudiantes a alcanzar sus objetivos académicos y personales."
                  isExpanded={expandedValue === "results"}
                  onToggle={() => toggleExpand("results")}
                />
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-indigo-700">
                Nuestro Compromiso
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Nos comprometemos a proporcionar un servicio ético, confidencial
                y personalizado que se adapte a las necesidades únicas de cada
                estudiante. Nuestro objetivo es no solo ayudar con tareas
                específicas, sino también fomentar el aprendizaje y el
                crecimiento académico a largo plazo.
              </p>
            </motion.div>
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-3xl font-bold mb-4 text-indigo-800">
                    ¿Tienes alguna pregunta?
                  </h2>
                  <p className="text-lg text-gray-700 mb-6 max-w-2xl">
                    Estamos aquí para ayudarte. Contáctanos directamente por
                    WhatsApp si necesitas más información o tienes alguna
                    consulta.
                  </p>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-full hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <FaWhatsapp size={24} className="mr-2" />
                    Contáctanos por WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      whileHover={{ scale: 1.05 }}
    >
      <div className="mb-6 flex justify-center">{icon}</div>
      <h3 className="text-2xl font-semibold mb-4 text-indigo-800">{title}</h3>
      <p className="text-gray-600 text-lg">{description}</p>
    </motion.div>
  );
};

const ValueItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ icon, title, description, isExpanded, onToggle }) => {
  return (
    <motion.div
      className="bg-indigo-50 p-6 rounded-xl cursor-pointer"
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="text-indigo-500">{icon}</div>
          <h3 className="text-xl font-semibold text-indigo-700">{title}</h3>
        </div>
        <ChevronDown
          className={`text-indigo-500 transition-transform duration-300 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
        />
      </div>
      <motion.p
        className="text-gray-600 text-lg mt-2"
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
};

export default AboutUs;

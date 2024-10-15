import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import PageTransition from "../components/PageTransition";
import {
  BookOpen,
  Search,
  Calculator,
  Microscope,
  Code,
  DollarSign,
  Globe,
  FileText,
  PenTool,
  Presentation,
  FileQuestion,
  Award,
  GraduationCap,
  X,
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

Modal.setAppElement("#root");

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const whatsappNumber = "34608837272";
  const whatsappMessage = encodeURIComponent("¡Hola!");

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "90%",
      width: "500px",
      padding: "2rem",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000,
    },
  };

  const services = [
    {
      category: "Actividades Académicas",
      icon: <BookOpen className="w-6 h-6" />,
      items: [
        "Tareas",
        "Prácticas",
        "Ensayos",
        "Exposiciones",
        "Resúmenes",
        "Artículos",
        "Exámenes",
        "Pruebas cortas",
        "Quizzes",
        "Proyectos finales",
        "Tesis",
        "Monográficos",
      ],
    },
    {
      category: "Matemáticas",
      icon: <Calculator className="w-6 h-6" />,
      items: [
        "Cálculo (todos los niveles)",
        "Matemática Financiera",
        "Estadística",
        "Método Matemático",
      ],
    },
    {
      category: "Ciencias",
      icon: <Microscope className="w-6 h-6" />,
      items: [
        "Física (todas las ramas)",
        "Química (todas las ramas)",
        "Mecánica de Fluidos",
      ],
    },
    {
      category: "Ingeniería",
      icon: <Code className="w-6 h-6" />,
      items: [
        "Hidráulica",
        "Circuitos",
        "Programación",
        "Dinámica",
        "Estática",
      ],
    },
    {
      category: "Negocios y Economía",
      icon: <DollarSign className="w-6 h-6" />,
      items: [
        "Contabilidad",
        "Economía",
        "Administración Financiera",
        "Publicidad",
        "Mercadeo",
      ],
    },
  ];

  const academicActivities = [
    "Tareas",
    "Prácticas",
    "Ensayos",
    "Exposiciones",
    "Resúmenes",
    "Artículos",
    "Exámenes",
    "Pruebas cortas",
    "Quizzes",
    "Proyectos finales",
    "Tesis",
    "Monográficos",
  ];

  const filteredServices = services
    .map((service) => ({
      ...service,
      items: service.items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((service) => service.items.length > 0);

  const handleServiceClick = (service: string, category: string) => {
    if (category === "Actividades Académicas") {
      navigate("/cotizar", { state: { selectedService: service } });
    } else {
      setSelectedService(service);
      setShowModal(true);
    }
  };

  const handleActivitySelection = (activity: string) => {
    const combinedService = `${activity} de ${selectedService}`;
    navigate("/cotizar", { state: { selectedService: combinedService } });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-center mb-12 text-indigo-800"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Nuestros Servicios
          </motion.h1>

          <motion.div
            className="max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar servicios..."
                className="w-full p-4 pl-12 pr-4 rounded-full border-2 border-indigo-300 focus:outline-none focus:border-indigo-500 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400"
                size={24}
              />
            </div>
          </motion.div>

          <div className="space-y-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <motion.div
                  className="flex items-center justify-between p-6 cursor-pointer"
                  onClick={() => toggleCategory(service.category)}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-indigo-600 bg-indigo-100 p-3 rounded-full">
                      {service.icon}
                    </span>
                    <h3 className="text-2xl font-semibold text-indigo-800">
                      {service.category}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`text-indigo-500 transition-transform duration-300 ${
                      expandedCategory === service.category
                        ? "transform rotate-180"
                        : ""
                    }`}
                    size={24}
                  />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedCategory === service.category ? "auto" : 0,
                    opacity: expandedCategory === service.category ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-indigo-50">
                    {service.items.map((item, itemIndex) => (
                      <motion.button
                        key={itemIndex}
                        className="flex items-center space-x-2 text-left bg-white p-3 rounded-lg transition-all duration-300 hover:bg-indigo-100 hover:shadow-md"
                        onClick={() =>
                          handleServiceClick(item, service.category)
                        }
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></span>
                        <span className="text-gray-700">{item}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <Modal
            isOpen={showModal}
            onRequestClose={() => setShowModal(false)}
            style={customStyles}
            contentLabel="Selecciona el tipo de actividad"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-indigo-800">
                Selecciona el tipo de actividad
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {academicActivities.map((activity, index) => (
                <motion.button
                  key={index}
                  className="bg-indigo-50 p-3 rounded-lg transition-all duration-300 hover:bg-indigo-100 text-left"
                  onClick={() => handleActivitySelection(activity)}
                  whileHover={{ scale: 1.05 }}
                >
                  {activity}
                </motion.button>
              ))}
            </div>
          </Modal>

          <motion.div
            className="mt-16 bg-white p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-700">
              Tipos de Tareas que Manejamos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <TaskType
                icon={<FileText />}
                title="Ensayos y Trabajos Escritos"
              />
              <TaskType icon={<Calculator />} title="Análisis de Datos" />
              <TaskType icon={<BookOpen />} title="Resúmenes y Reseñas" />
              <TaskType icon={<Microscope />} title="Informes de Laboratorio" />
              <TaskType icon={<Code />} title="Proyectos de Programación" />
              <TaskType icon={<Presentation />} title="Presentaciones" />
              <TaskType icon={<FileQuestion />} title="Exámenes y Quizzes" />
              <TaskType icon={<Award />} title="Proyectos Finales" />
              <TaskType icon={<GraduationCap />} title="Tesis y Monográficos" />
              <TaskType icon={<PenTool />} title="Diseño y Creatividad" />
              <TaskType icon={<Globe />} title="Traducciones" />
              <TaskType icon={<BookOpen />} title="Investigación Académica" />
            </div>
          </motion.div>
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-indigo-800">
              ¿Prefieres un contacto mas directo?
            </h2>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-full hover:bg-green-600 transition-all duration-300"
            >
              <FaWhatsapp size={24} className="mr-2" />
              Contactar por WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

const TaskType: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => {
  return (
    <motion.div
      className="flex items-center space-x-3 bg-indigo-50 p-4 rounded-xl transition-all duration-300 hover:bg-indigo-100 hover:shadow-md"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-indigo-600">{icon}</span>
      <span className="font-medium text-indigo-800">{title}</span>
    </motion.div>
  );
};

export default Services;

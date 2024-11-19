import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Lazy load de App
const App = lazy(() => import("./App.tsx"));

// Componente de carga mientras se carga la aplicación
const LoadingFallback = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-indigo-800 font-medium">Cargando...</p>
    </div>
  </div>
);

// Precarga de recursos críticos
const preloadResources = () => {
  // Precargar la imagen del hero
  const heroImageLink = document.createElement("link");
  heroImageLink.rel = "preload";
  heroImageLink.as = "image";
  heroImageLink.href = "/images/hero-image.webp";
  document.head.appendChild(heroImageLink);

  // Precargar el logo
  const logoLink = document.createElement("link");
  logoLink.rel = "preload";
  logoLink.as = "image";
  logoLink.href = "/images/logo.svg";
  document.head.appendChild(logoLink);
};

// Inicialización de la aplicación
const initializeApp = () => {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("No se encontró el elemento root");
  }

  // Precarga de recursos
  preloadResources();

  // Renderizado de la aplicación
  createRoot(container).render(
    <StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </StrictMode>
  );
};

// Iniciar la aplicación
initializeApp();

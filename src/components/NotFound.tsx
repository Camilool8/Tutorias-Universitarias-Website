import React from "react";
import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-blue-600 animate-bounce">
            404
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ¡Ups! Página no encontrada
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Lo sentimos, la página que estás buscando no existe o ha sido
            movida.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver a la página principal
          </Link>
          <Link
            to="/cotizar"
            className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            <Search className="w-5 h-5 mr-2" />
            Solicitar una cotización
          </Link>
        </div>
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a la página anterior
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

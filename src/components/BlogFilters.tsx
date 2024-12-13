import React from "react";
import { motion } from "framer-motion";
import { Search, Tag, Filter, X } from "lucide-react";

const BlogFilters = ({
  filters,
  setFilters,
  categories,
  tags,
  onClearFilters,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col space-y-4">
        {/* Barra superior de filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Buscador */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Buscar artículos..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          {/* Selector de Categorías */}
          <div className="relative min-w-[200px]">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none text-gray-700"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name} ({category.post_count})
                </option>
              ))}
            </select>
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          {/* Botón limpiar filtros */}
          {(filters.search || filters.category || filters.tag) && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center whitespace-nowrap"
            >
              <X size={18} className="mr-2" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tags populares */}
        {tags.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tags populares
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <motion.button
                  key={tag.id}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, tag: tag.slug }))
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                    filters.tag === tag.slug
                      ? "bg-indigo-100 text-indigo-800 font-medium"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Tag size={14} className="mr-1.5" />
                  {tag.name}
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-white bg-opacity-50 rounded-full">
                    {tag.post_count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Filtros activos */}
        {(filters.search || filters.category || filters.tag) && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Filtros activos
            </h3>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Búsqueda: {filters.search}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, search: "" }))
                    }
                    className="ml-2 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Categoría:{" "}
                  {categories.find((c) => c.slug === filters.category)?.name}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: "" }))
                    }
                    className="ml-2 hover:text-purple-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.tag && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Tag: {tags.find((t) => t.slug === filters.tag)?.name}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, tag: "" }))}
                    className="ml-2 hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFilters;

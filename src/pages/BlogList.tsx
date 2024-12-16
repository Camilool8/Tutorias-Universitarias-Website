import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import SEO from "../components/shared/SEO";
import BlogFilters from "../components/BlogFilters";
import BlogPostCard from "../components/BlogPostCard";
import { BookOpen } from "lucide-react";

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    tag: "",
  });

  useEffect(() => {
    Promise.all([fetchPosts(), fetchCategories(), fetchTags()]);
  }, []);

  // Efecto para recargar posts cuando cambien los filtros
  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.category) params.append("category", filters.category);
      if (filters.tag) params.append("tag", filters.tag);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/blog/posts/public?${params}`);
      if (!response.ok) throw new Error("Error al cargar los posts");

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories");
      if (!response.ok) throw new Error("Error al cargar las categorías");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/blog/tags");
      if (!response.ok) throw new Error("Error al cargar los tags");
      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      tag: "",
    });
  };

  return (
    <>
      <SEO
        title="Blog Universitario"
        description="Descubre artículos académicos, consejos de estudio, guías y recursos para mejorar tu rendimiento universitario. Blog especializado en educación superior."
        canonicalUrl="https://www.tutoriasuniversitarias.com/blog"
        keywords="blog universitario, consejos estudio, guías académicas, recursos universitarios, tutorías"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog Universitario - Tutorías Universitarias",
          description: "Recursos y consejos para estudiantes universitarios",
          publisher: {
            "@type": "Organization",
            name: "Tutorías Universitarias",
          },
        }}
      />
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
            <div className="container mx-auto px-4 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.h1
                  className="text-5xl md:text-6xl font-bold text-center mb-6 text-indigo-800"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Blog{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Universitario
                  </span>
                </motion.h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                  Descubre consejos, guías y recursos para impulsar tu éxito
                  académico
                </p>
              </motion.div>

              {/* Filtros */}
              <BlogFilters
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                tags={tags}
                onClearFilters={clearFilters}
              />
            </div>
          </section>

          {/* Posts Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No se encontraron posts
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filters.search || filters.category || filters.tag
                      ? "No hay posts que coincidan con tus filtros. Intenta con otros criterios de búsqueda."
                      : "Aún no hay posts publicados. ¡Vuelve pronto!"}
                  </p>
                  {(filters.search || filters.category || filters.tag) && (
                    <button
                      onClick={clearFilters}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Posts count */}
                  <div className="text-center mb-8">
                    <p className="text-gray-600">
                      Mostrando {posts.length}{" "}
                      {posts.length === 1 ? "post" : "posts"}
                      {(filters.search || filters.category || filters.tag) &&
                        " con los filtros seleccionados"}
                    </p>
                  </div>

                  {/* Posts grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                      <BlogPostCard
                        key={post.id}
                        post={post}
                        index={index}
                        onTagClick={(tag) =>
                          setFilters((prev) => ({ ...prev, tag: tag.slug }))
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </PageTransition>
    </>
  );
};

export default BlogList;

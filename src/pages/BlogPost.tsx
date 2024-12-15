import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEO from "../components/shared/SEO";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Tag,
  ChevronLeft,
  Eye,
  BookOpen,
  Calculator,
} from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/posts/public/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          navigate("/404");
          return;
        }
        throw new Error("Error al cargar el post");
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error || "Post no encontrado"}</p>
        <Link
          to="/blog"
          className="inline-flex items-center mt-4 text-indigo-600 hover:text-indigo-800"
        >
          <ChevronLeft className="mr-2" size={20} />
          Volver al blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        canonicalUrl={`https://www.tutoriasuniversitarias.com/blog/${post.slug}`}
        ogType="article"
        keywords={post.tags?.map((tag) => tag.name).join(", ")}
        image={post.featured_image}
      >
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        <meta property="article:section" content={post.category?.name} />
        {post.tags?.map((tag) => (
          <meta property="article:tag" content={tag.name} key={tag.id} />
        ))}
      </SEO>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <article className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Imagen destacada */}
            {post.featured_image && (
              <div className="relative h-[400px]">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Metadatos y título */}
              <div className="mb-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Link to="/blog" className="hover:text-indigo-600">
                    Blog
                  </Link>
                  <span>/</span>
                  {post.blog_categories && (
                    <>
                      <Link
                        to={`/blog`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/blog", {
                            state: { category: post.blog_categories.slug },
                          });
                        }}
                        className="hover:text-indigo-600"
                      >
                        {post.blog_categories.name}
                      </Link>
                      <span>/</span>
                    </>
                  )}
                  <span className="text-gray-600">{post.title}</span>
                </nav>

                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {post.title}
                </h1>

                {/* Info del autor y fecha */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Tutorías Universitarias
                      </p>
                      <p className="text-xs">Autor</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>
                      {new Date(post.published_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{post.reading_time || "5"} min lectura</span>
                  </div>

                  <div className="flex items-center">
                    <Eye size={16} className="mr-1" />
                    <span>{post.view_count || 0} vistas</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags &&
                  post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to="/blog"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/blog", { state: { tag: tag.slug } });
                      }}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 
               rounded-full text-sm text-gray-600 hover:bg-gray-200 
               transition-colors"
                    >
                      <Tag size={14} className="mr-1" />
                      {tag.name}
                    </Link>
                  ))}
              </div>

              {/* Contenido del post */}
              <div className="prose prose-lg max-w-none mb-8">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-indigo-600 hover:text-indigo-800"
                      />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1 {...props} className="text-3xl font-bold mt-8 mb-4" />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} className="text-2xl font-bold mt-6 mb-3" />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} className="text-xl font-bold mt-4 mb-2" />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className="list-disc pl-6 mb-4" />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol {...props} className="list-decimal pl-6 mb-4" />
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
              {/* Footer del post */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">
                  ¿Necesitas ayuda con tus estudios?
                </h3>
                <p className="text-gray-600 mb-6">
                  En Tutorías Universitarias estamos comprometidos con tu éxito
                  académico. ¿Tienes dudas o necesitas apoyo con alguna materia?
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/cotizar"
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg
                 hover:bg-indigo-700 transition-colors"
                  >
                    <Calculator className="mr-2" />
                    Solicitar Cotización
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navegación */}
          <div className="mt-8 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ChevronLeft size={20} className="mr-2" />
              Volver al blog
            </Link>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPost;

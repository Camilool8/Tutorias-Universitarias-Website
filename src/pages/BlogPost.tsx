import React, { useState, useEffect } from "react";
import SEO from "../components/shared/SEO";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Tag,
  ChevronLeft,
  Eye,
  Calculator,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  BookOpen,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsHeaderVisible(scrollPosition > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

      // Obtener posts relacionados basados en tags
      if (data.tags?.length) {
        const tagIds = data.tags.map((tag) => tag.id);
        const relatedResponse = await fetch(
          `/api/blog/posts/public?${new URLSearchParams({
            tags: tagIds.join(","),
            exclude: data.id,
            limit: 3,
          })}`
        );

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          data.related_posts = relatedData.posts;
        }
      }

      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform = "copy") => {
    const url = window.location.href;
    const title = encodeURIComponent(post?.title || "");
    const description = encodeURIComponent(post?.excerpt || "");

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}%0A${description}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${url}&text=${title}%0A${description}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${description}`,
          "_blank"
        );
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          setShowShareTooltip(true);
          setTimeout(() => setShowShareTooltip(false), 2000);
        } catch (err) {
          console.error("Error al copiar URL:", err);
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 mb-8">{error || "Post no encontrado"}</p>
        <Link
          to="/blog"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
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
        title={post.title}
        description={post.excerpt || post.meta_description}
        canonicalUrl={`https://www.tutoriasuniversitarias.com/blog/${post.slug}`}
        ogType="article"
        keywords={post.keywords}
        image={post.featured_image} // Esta es la única página donde usamos imagen dinámica
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          image: post.featured_image,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: {
            "@type": "Organization",
            name: "Tutorías Universitarias",
          },
          publisher: {
            "@type": "Organization",
            name: "Tutorías Universitarias",
            logo: {
              "@type": "ImageObject",
              url: "https://www.tutoriasuniversitarias.com/images/logo-dark.svg",
            },
          },
        }}
      />
      {/* Header flotante */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHeaderVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 shadow-lg transform"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/blog"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ChevronLeft size={20} className="mr-2" />
            <span className="font-medium">Volver al blog</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleShare("facebook")}
              className="p-2 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <Facebook className="text-blue-600" size={20} />
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="p-2 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <Twitter className="text-blue-400" size={20} />
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="p-2 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <Linkedin className="text-blue-700" size={20} />
            </button>
            {/* Botón de copiar con tooltip */}
            <div className="relative">
              <button
                onClick={() => handleShare("copy")}
                className="p-2 hover:bg-indigo-50 rounded-full transition-colors"
                aria-label="Copiar enlace"
              >
                <Copy className="text-gray-600" size={20} />
              </button>
              {showShareTooltip && (
                <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  ¡Enlace copiado!
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <article className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {post.featured_image && (
          <div className="relative w-full min-h-[60vh] md:h-[70vh] overflow-hidden pt-16">
            {" "}
            <div className="absolute inset-0">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />{" "}
            </div>
            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-8 md:p-12">
              {" "}
              <div className="container mx-auto max-w-4xl">
                <div className="space-y-6">
                  {" "}
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/blog?tag=${tag.slug}`}
                        className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm 
                          text-white rounded-full text-sm hover:bg-white/30 transition-colors"
                      >
                        <Tag size={14} className="mr-1" />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                  <h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white 
                         leading-tight tracking-tight"
                  >
                    {post.title}
                  </h1>
                  {post.excerpt && (
                    <p
                      className="text-base sm:text-lg text-white/90 leading-relaxed 
                         max-w-3xl font-medium backdrop-blur-sm"
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {new Date(post.published_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      {post.reading_time || "5"} min lectura
                    </span>
                    <span className="flex items-center">
                      <Eye size={16} className="mr-2" />
                      {post.view_count || 0} vistas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12">
            {/* Contenido del Post */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      {...props}
                      className="text-4xl font-bold mt-12 mb-6 text-gray-900"
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      {...props}
                      className="text-3xl font-bold mt-10 mb-5 text-gray-800"
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      {...props}
                      className="text-2xl font-bold mt-8 mb-4 text-gray-700"
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      {...props}
                      className="mb-6 text-gray-600 leading-relaxed text-lg"
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-indigo-600 hover:text-indigo-800 underline 
                                          decoration-2 decoration-indigo-200 hover:decoration-indigo-500 
                                          transition-all duration-300"
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      {...props}
                      className="list-disc pl-6 mb-6 text-gray-600 space-y-3"
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      {...props}
                      className="list-decimal pl-6 mb-6 text-gray-600 space-y-3"
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      {...props}
                      className="my-8 relative bg-gray-50 border-l-4 border-indigo-500 
              py-6 px-8 text-gray-700 italic"
                    >
                      <div className="absolute right-4 top-4 text-indigo-200">
                        <MessageCircle size={24} />
                      </div>
                      <div className="relative text-lg leading-relaxed">
                        {props.children}
                      </div>
                    </blockquote>
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        {...props}
                        className="bg-gray-100 text-indigo-600 px-1.5 py-0.5 
                                                rounded font-mono text-sm"
                      />
                    ) : (
                      <div className="relative group">
                        <pre
                          className="bg-gray-900 text-white p-6 rounded-xl overflow-x-auto 
                                      my-8 text-sm leading-relaxed"
                        >
                          <code {...props} />
                        </pre>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(props.children)
                          }
                          className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg 
                                   opacity-0 group-hover:opacity-100 transition-opacity 
                                   hover:bg-white/20"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ),
                  img: ({ node, ...props }) => (
                    <figure className="my-12">
                      <img
                        {...props}
                        className="w-full rounded-2xl shadow-xl hover:shadow-2xl 
                                  transition-shadow duration-300"
                        loading="lazy"
                      />
                      {props.alt && (
                        <figcaption className="mt-4 text-center text-sm text-gray-500 italic">
                          {props.alt}
                        </figcaption>
                      )}
                    </figure>
                  ),
                  table: ({ node, ...props }) => (
                    <div className="my-8 overflow-x-auto">
                      <table
                        {...props}
                        className="w-full border-collapse bg-white 
                                                 shadow-lg rounded-lg overflow-hidden"
                      />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead {...props} className="bg-gray-50" />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      {...props}
                      className="px-6 py-3 text-left text-xs font-medium 
                                            text-gray-500 uppercase tracking-wider 
                                            border-b border-gray-200"
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      {...props}
                      className="px-6 py-4 text-sm text-gray-500 
                                            border-b border-gray-200"
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* CTA Final */}
            <div className="mt-16">
              <div
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 
                            relative overflow-hidden shadow-2xl transform hover:scale-[1.02] 
                            transition-all duration-300"
              >
                <div
                  className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full 
                              transform translate-x-32 -translate-y-32 blur-3xl"
                />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-white">
                      <BookOpen size={48} className="mb-6 text-white/90" />
                      <h3 className="text-3xl font-bold mb-4">
                        ¿Necesitas ayuda con tus estudios?
                      </h3>
                      <p className="text-lg text-white/80 leading-relaxed">
                        Nuestro equipo de tutores expertos está disponible 24/7
                        para ayudarte con tus trabajos académicos. Obtén la
                        asistencia personalizada que necesitas para alcanzar tus
                        metas.
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Link
                        to="/cotizar"
                        className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-800 
           rounded-xl font-bold hover:bg-yellow-300 transition-colors 
           duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Calculator className="mr-2" size={20} />
                        Solicitar Cotización
                      </Link>
                      <Link
                        to="/services"
                        className="inline-flex items-center justify-center px-8 py-4 
           border-2 border-white text-white rounded-xl font-bold 
           hover:bg-white/10 transition-colors duration-300"
                      >
                        Conoce Nuestros Servicios
                        <ArrowRight className="ml-2" size={20} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Relacionados */}
            <div className="mt-16 border-t border-gray-200 pt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Lecturas Relacionadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {post.related_posts?.slice(0, 3).map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl 
                             transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {relatedPost.featured_image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      </div>
                    )}
                    <div className="p-6">
                      {/* Tags compartidos */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {relatedPost.tags
                          ?.filter((tag) =>
                            post.tags?.some(
                              (currentTag) => currentTag.id === tag.id
                            )
                          )
                          .map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                            >
                              {tag.name}
                            </span>
                          ))}
                      </div>
                      <h3
                        className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 
                                   transition-colors line-clamp-2"
                      >
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        {new Date(relatedPost.published_at).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPost;

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, BookOpen } from "lucide-react";

const BlogPostCard = ({ post, index, onTagClick }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl flex flex-col group overflow-hidden"
    >
      {/* Imagen del Post */}
      <Link
        to={`/blog/${post.slug}`}
        className="block relative overflow-hidden aspect-[16/9]"
      >
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
            <BookOpen size={48} className="text-indigo-200" />
          </div>
        )}
        {/* Categoría como badge sobre la imagen */}
        {post.category && (
          <Link
            to={`/blog`}
            onClick={(e) => {
              e.preventDefault();
              onTagClick({ slug: post.category.slug });
            }}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm 
                       px-3 py-1.5 rounded-full text-sm font-medium text-indigo-600 
                       hover:bg-white transition-colors duration-300"
          >
            {post.category.name}
          </Link>
        )}
      </Link>

      {/* Contenido del Post */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Metadatos superiores */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5" />
            {new Date(post.published_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1.5" />
            {post.reading_time || 5} min
          </div>
        </div>

        {/* Título y Extracto */}
        <Link
          to={`/blog/${post.slug}`}
          className="group-hover:text-indigo-600 transition-colors duration-300"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>

        {/* Footer con Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onTagClick(tag)}
                  className="inline-flex items-center px-2.5 py-1 text-xs
                           bg-gray-50 hover:bg-gray-100 text-gray-600
                           rounded-lg transition-colors duration-300"
                >
                  <Tag size={10} className="mr-1 text-gray-400" />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default BlogPostCard;

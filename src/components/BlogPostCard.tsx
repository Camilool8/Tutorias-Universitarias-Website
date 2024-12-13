import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, Tag, BookOpen } from "lucide-react";

const BlogPostCard = ({ post, index, onTagClick }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group"
    >
      {/* Imagen destacada */}
      <Link
        to={`/blog/${post.slug}`}
        className="block relative overflow-hidden h-48"
      >
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <BookOpen size={48} className="text-indigo-300" />
          </div>
        )}
      </Link>

      <div className="p-6 flex-grow flex flex-col">
        {/* Metadatos superiores */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {new Date(post.published_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            {post.view_count || 0} vistas
          </div>
        </div>

        {/* Título y extracto */}
        <Link
          to={`/blog/${post.slug}`}
          className="group-hover:text-indigo-600 transition-colors"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

        {/* Categoría */}
        {post.blog_categories && (
          <div className="mb-4">
            <Link
              to={`/blog`}
              onClick={(e) => {
                e.preventDefault();
                onTagClick({ slug: post.blog_categories.slug });
              }}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <BookOpen size={14} className="mr-1" />
              {post.blog_categories.name}
            </Link>
          </div>
        )}

        {/* Tags */}
        {post.blog_tags && post.blog_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {post.blog_tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag)}
                className="inline-flex items-center px-2 py-1 bg-gray-100 
                         rounded-full text-xs text-gray-600 hover:bg-gray-200 
                         transition-colors cursor-pointer"
              >
                <Tag size={12} className="mr-1" />
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Tiempo de lectura */}
        <div className="mt-4 pt-4 border-t flex items-center text-sm text-gray-500">
          <Clock size={14} className="mr-1" />
          {post.reading_time || 5} min lectura
        </div>
      </div>
    </motion.article>
  );
};

export default BlogPostCard;

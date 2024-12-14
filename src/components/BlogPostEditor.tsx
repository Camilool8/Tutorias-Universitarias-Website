import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Tag, Plus, AlertCircle } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

const BlogPostEditor = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => {
    const initialTags =
      post?.blog_posts_tags?.map((pt) => pt.blog_tags.id) || [];

    return {
      title: "",
      content: "",
      excerpt: "",
      meta_title: "",
      meta_description: "",
      featured_image: "",
      category_id: "",
      status: "draft",
      ...post,
      tags: initialTags,
    };
  });
  const [allTags, setAllTags] = useState([]);
  const [originalTags, setOriginalTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch("/api/blog/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al cargar los tags");
        const data = await response.json();
        setAllTags(data);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };

    fetchAllTags();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (post?.blog_posts_tags) {
      const postTagIds = post.blog_posts_tags.map((pt) => pt.blog_tags.id);

      setOriginalTags(postTagIds);
      setFormData((prev) => ({
        ...prev,
        tags: postTagIds,
      }));
    }
  }, [post?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.title.trim()) throw new Error("El título es requerido");
      if (!formData.content.trim())
        throw new Error("El contenido es requerido");
      if (!formData.category_id) throw new Error("La categoría es requerida");

      const token = localStorage.getItem("adminToken");
      const slug = post?.slug || generateSlug(formData.title);
      const tagsToSend = Array.isArray(formData.tags) ? formData.tags : [];
      const tagsHaveChanged =
        JSON.stringify(originalTags.sort()) !==
        JSON.stringify(tagsToSend.sort());

      const requestBody = {
        ...formData,
        slug,
        ...(tagsHaveChanged && { tags: tagsToSend }),
      };

      // Si es un post existente (PUT)
      if (post?.id) {
        const response = await fetch(`/api/blog/posts/${post.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Error al actualizar el post");
        const updatedPost = await response.json();
        onSave(updatedPost);
      } else {
        // Si es un nuevo post (POST)
        const response = await fetch("/api/blog/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Error al crear el post");
        const newPost = await response.json();
        onSave(newPost);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 200);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/blog/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar las categorías");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Error al cargar las categorías");
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => {
      const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
      const isTagSelected = currentTags.includes(tagId);

      const newTags = isTagSelected
        ? currentTags.filter((id) => id !== tagId)
        : [...currentTags, tagId];

      return {
        ...prev,
        tags: newTags,
      };
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/blog/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategory,
          // Generar slug a partir del nombre
          slug: newCategory
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        }),
      });

      if (!response.ok) throw new Error("Error al crear la categoría");

      const category = await response.json();
      setCategories([...categories, category]);
      setFormData((prev) => ({ ...prev, category_id: category.id }));
      setNewCategory("");
    } catch (err) {
      setError("Error al crear la categoría");
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const response = await fetch("/api/blog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      if (!response.ok) throw new Error("Error al crear el tag");

      const createdTag = await response.json();

      // Actualizar la lista de tags
      setAllTags((prev) => [...prev, createdTag]);

      // Seleccionar automáticamente el nuevo tag
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, createdTag.id],
      }));

      setNewTag("");
    } catch (err) {
      setError("Error al crear el tag");
    }
  };

  const renderTags = () => (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
        const isSelected = currentTags.includes(tag.id);
        const wasOriginallySelected = originalTags.includes(tag.id);

        return (
          <motion.button
            key={tag.id}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTagToggle(tag.id)}
            className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-sm 
            transition-all duration-200 relative
            ${
              isSelected
                ? "bg-indigo-100 text-indigo-800 border-2 border-indigo-300"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }
          `}
          >
            <Tag
              size={14}
              className={`mr-1.5 ${
                isSelected ? "text-indigo-600" : "text-gray-400"
              }`}
            />
            <span>{tag.name}</span>

            {/* Indicador de tag original */}
            {wasOriginallySelected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            )}

            {tag.post_count > 0 && (
              <span
                className={`
                ml-1.5 px-1.5 py-0.5 text-xs rounded-full
                ${isSelected ? "bg-indigo-50" : "bg-gray-50"}
              `}
              >
                {tag.post_count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-semibold">
            {post ? "Editar Post" : "Nuevo Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]"
        >
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm">
              <AlertCircle size={14} className="mr-2" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Primera columna */}
            <div className="space-y-3">
              {/* Campos básicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extracto
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nueva categoría"
                      className="w-32 px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sección de Tags */}
              <div className="space-y-4">
                {/* Header de la sección */}
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  {post?.blog_posts_tags?.length > 0 && (
                    <div className="flex items-center text-xs text-indigo-600">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                      Tags del post
                    </div>
                  )}
                </div>

                {/* Input para nuevo tag */}
                <div className="relative">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Agregar nuevo tag..."
                    className="w-full px-4 py-2 pr-12 border rounded-lg 
               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
               placeholder-gray-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
               rounded-full hover:bg-gray-100 disabled:opacity-50
               disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} className="text-indigo-600" />
                  </button>
                </div>

                {/* Lista de tags */}
                <div className="p-4 border rounded-lg bg-gray-50 min-h-[100px]">
                  {allTags.length > 0 ? (
                    renderTags()
                  ) : (
                    <div className="flex justify-center items-center h-24 text-gray-500 text-sm">
                      No hay tags disponibles. Crea uno nuevo.
                    </div>
                  )}
                </div>

                {/* Footer con contador y estadísticas */}
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600">
                    {formData.tags.length} tag
                    {formData.tags.length !== 1 && "s"} seleccionado
                    {formData.tags.length !== 1 && "s"}
                  </div>
                  {post?.blog_posts_tags?.length > 0 &&
                    formData.tags.length !== post.blog_posts_tags.length && (
                      <div className="text-indigo-600">
                        {formData.tags.length > post.blog_posts_tags.length
                          ? `${
                              formData.tags.length - post.blog_posts_tags.length
                            } tags añadidos`
                          : `${
                              post.blog_posts_tags.length - formData.tags.length
                            } tags removidos`}
                      </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen Destacada
                </label>
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured_image: e.target.value,
                    }))
                  }
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
                {formData.featured_image && (
                  <div className="mt-2">
                    <img
                      src={formData.featured_image}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Título (SEO)
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.meta_title.length}/60 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Descripción (SEO)
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.meta_description.length}/160 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Editor Markdown */}
          <div className="mb-20">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <div data-color-mode="light">
              <MDEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content: content || "" }))
                }
                height={400}
                preview="edit"
                hideToolbar={false}
                enableScroll={true}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Usa Markdown para dar formato a tu contenido. Soporta **negrita**,
              *cursiva*, [enlaces](url), y más.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
            <div className="max-w-4xl mx-auto flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-2" />
                    <span>Guardar Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BlogPostEditor;

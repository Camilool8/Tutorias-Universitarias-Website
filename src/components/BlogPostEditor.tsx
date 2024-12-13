import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Tag, Plus, AlertCircle } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

const BlogPostEditor = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    meta_title: "",
    meta_description: "",
    featured_image: "",
    category_id: "",
    tags: [],
    status: "draft",
    slug: "",
    ...post,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

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

      const slug = generateSlug(formData.title);

      const postResponse = await fetch(
        post?.id ? `/api/blog/posts/${post.id}` : "/api/blog/posts",
        {
          method: post?.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            slug,
            tags: undefined,
          }),
        }
      );

      if (!postResponse.ok) throw new Error("Error al guardar el post");
      const savedPost = await postResponse.json();

      const tagsResponse = await fetch(`/api/blog/posts/${savedPost.id}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tags: formData.tags,
        }),
      });

      if (!tagsResponse.ok) throw new Error("Error al guardar los tags");

      onSave(savedPost);
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

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

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

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/blog/tags", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar los tags");
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError("Error al cargar los tags");
    }
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

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/blog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTag,
          slug: newTag
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        }),
      });

      if (!response.ok) throw new Error("Error al crear el tag");

      const tag = await response.json();
      setTags([...tags, tag]);
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.id],
      }));
      setNewTag("");
    } catch (err) {
      setError("Error al crear el tag");
    }
  };

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

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nuevo tag"
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 min-h-[60px]">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                          formData.tags.includes(tag.id)
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData.tags.includes(tag.id)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...formData.tags, tag.id]
                              : formData.tags.filter((id) => id !== tag.id);
                            setFormData((prev) => ({ ...prev, tags: newTags }));
                          }}
                        />
                        <Tag size={12} className="mr-1" />
                        {tag.name}
                      </label>
                    ))}
                  </div>
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

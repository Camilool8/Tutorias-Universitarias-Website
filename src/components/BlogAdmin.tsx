import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Link,
  Search,
  Eye,
  ImageIcon,
  Calendar,
  AlertCircle,
} from "lucide-react";
import BlogPostEditor from "./BlogPostEditor";

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/blog/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al cargar los posts");
      }

      const data = await response.json();
      const sortedPosts = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];

      setPosts(sortedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el post");
      }

      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.message);
    }
  };

  // Asegurarnos de que posts es un array antes de filtrar
  const filteredPosts =
    posts && Array.isArray(posts)
      ? posts.filter((post) => {
          const matchesSearch = post.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesStatus =
            statusFilter === "all" || post.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
      : [];

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="w-8 h-8 animate-spin text-indigo-600">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 rounded-lg flex items-center text-red-700">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y Botón Nuevo Post */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar posts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-600"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borradores</option>
            <option value="published">Publicados</option>
            <option value="archived">Archivados</option>
          </select>
          <button
            onClick={() => {
              setEditingPost(null);
              setShowEditor(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Post
          </button>
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay posts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No se encontraron posts con los filtros actuales"
                : "Comienza creando tu primer post"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Vista móvil */}
            <div className="sm:hidden">
              {filteredPosts.map((post) => (
                <MobilePostCard
                  key={post.id}
                  post={post}
                  onEdit={() => {
                    setEditingPost(post);
                    setShowEditor(true);
                  }}
                  onDelete={() => handleDelete(post.id)}
                />
              ))}
            </div>

            {/* Vista desktop */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vistas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onEdit={() => {
                      setEditingPost(post);
                      setShowEditor(true);
                    }}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <BlogPostEditor
          post={editingPost}
          onClose={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
          onSave={async (savedPost) => {
            await fetchPosts();
            setShowEditor(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
};

// Componente para vista móvil
const MobilePostCard = ({ post, onEdit, onDelete }) => {
  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{post.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[post.status]
          }`}
        >
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <Calendar size={14} className="mr-1" />
        {new Date(post.published_at || post.created_at).toLocaleDateString()}
        <Eye size={14} className="ml-3 mr-1" />
        {post.view_count || 0} vistas
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Link size={18} />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const PostRow = ({ post, onEdit, onDelete }) => {
  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{post.title}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            statusColors[post.status]
          }`}
        >
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(post.published_at || post.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {post.view_count || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Link size={18} />
          </button>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BlogAdmin;

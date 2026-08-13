import { useEffect, useState } from "react";
import { colours, fonts } from "../../../theme/theme";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/categoryService";
import CategoryFormModal from "./CategoryForm";
import AdminCard from "../AdminCard";

const EditButton = ({ name, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      style={{
        borderColor: colours.border,
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
      className="group flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colours.accent;
        e.currentTarget.style.backgroundColor = colours.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colours.border;
        e.currentTarget.style.backgroundColor = colours.background;
      }}
    >
      <span
        style={{ color: colours.text }}
        className="transition-colors duration-300 group-hover:text-[#A77C6B]"
      >
        {name}
      </span>
    </button>
  );
};

// Removed local EditIcon, DeleteIcon, and CategoryCard to use global AdminCard instead.

const PlusIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const AddCategoryCard = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{
        backgroundColor: colours.background,
        borderColor: colours.border,
        color: colours.mutedText,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colours.accent;
        e.currentTarget.style.color = colours.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colours.border;
        e.currentTarget.style.color = colours.mutedText;
      }}
    >
      <span className="mb-2 transition-transform duration-300 group-hover:scale-110">
        <PlusIcon />
      </span>

      <span
        className="text-base font-medium"
        style={{ fontFamily: fonts.secondary }}
      >
        Add Category
      </span>
    </button>
  );
};

const AdminCollection = () => {
  const navigate = useNavigate();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCreateCategory = async (fields) => {
    try {
      await createCategory(fields);
      await loadCategories();
    } catch (err) {
      alert(err.message || "Failed to create category");
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      // Ensure 'all-products' is placed first if present in the data
      const sorted = [...data].sort((a, b) => {
        if (a.slug === "all-products") return -1;
        if (b.slug === "all-products") return 1;
        return 0;
      });

      setCategories(sorted);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}" category?`
    );

    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (err) {
      alert(err.message || "Failed to delete category");
    }
  };

  const handleOpenCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setCategoryModalOpen(true);
  };

  const handleSubmitCategory = async (fields) => {
    try {
      if (modalMode === "edit" && selectedCategory) {
        await updateCategory(selectedCategory.id, fields);
      } else {
        await createCategory(fields);
      }
  
      await loadCategories();
    } catch (err) {
      alert(err.message || "Failed to save category");
    }
  };

  return (
    <div
      className="px-6 py-8"
      style={{
        backgroundColor: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            Product Categories
          </h1>
    
          <p
            className="mt-1 text-sm"
            style={{
              color: colours.mutedText,
              fontFamily: fonts.secondary,
            }}
          >
            Manage sections displayed on the Collection Page.
          </p>
        </div>
  
        <div>
          <EditButton
            name={editMode ? "Done" : "Edit Categories"}
            onClick={() => setEditMode((prev) => !prev)}
          />
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading categories...
        </p>
      )}

      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <AdminCard
              key={category.id}
              title={category.name}
              editMode={editMode}
              onClick={() => {
                if (!editMode) {
                  navigate(`/admin/collection/${category.slug}`);
                }
              }}
              onEdit={() => handleEditCategory(category)}
              onDelete={() => handleDeleteCategory(category)}
              showDelete={category.slug !== "all-products"}
            />
          ))}

          {editMode && (
            <AddCategoryCard onClick={handleOpenCreateCategory} />
          )}
        </div>
      )}

      <CategoryFormModal
        open={categoryModalOpen}
        mode={modalMode}
        category={selectedCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleSubmitCategory}
      />
    </div>
  );
};

export default AdminCollection;
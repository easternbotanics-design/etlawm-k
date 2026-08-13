import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { colours, fonts } from "../../../theme/theme";
import {
  slugify,
  uploadCategoryImage,
} from "../../../services/categoryService";

const CategoryFormModal = ({ open, mode = "create", category = null, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    imageFile: null,
    is_active: true,
  });

  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && category) {
      setForm({
        name: category.name || "",
        subtitle: category.subtitle || category.description || "",
        imageFile: null,
        is_active: category.isActive ?? true,
      });

      setPreview(category.imageUrl || category.image || "");
    } else {
      setForm({
        name: "",
        subtitle: "",
        imageFile: null,
        is_active: true,
      });

      setPreview("");
    }
  }, [open, mode, category]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      imageFile: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({
      name: "",
      subtitle: "",
      imageFile: null,
      is_active: true,
    });

    setPreview("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    try {
      setSaving(true);

      let imageUrl = category?.imageUrl || category?.image || null;

      if (form.imageFile) {
        imageUrl = await uploadCategoryImage(form.imageFile);
      }

      await onSubmit({
        name: form.name.trim(),
        slug: slugify(form.name),
        subtitle: form.subtitle.trim(),
        description: form.subtitle.trim() || `Products in ${form.name.trim()}`,
        image_url: imageUrl,
        is_active: form.is_active,
      });

      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = mode === "edit" ? "Edit Category" : "Add Category";
  const buttonText = mode === "edit" ? "Save Changes" : "Create Category";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-xl"
        style={{
          backgroundColor: colours.background,
          borderColor: colours.border,
          fontFamily: fonts.secondary,
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{
                color: colours.secondary,
                fontFamily: fonts.primary,
              }}
            >
              {modalTitle}
            </h2>

            <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
              {mode === "edit"
                ? "Update this product category section."
                : "Create a new product category section."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border p-2"
            style={{
              borderColor: colours.border,
              color: colours.text,
              backgroundColor: colours.background,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: colours.text }}
            >
              Category Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Hair Care"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: colours.border,
                backgroundColor: colours.background,
                color: colours.text,
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: colours.text }}
            >
              Subtitle
            </label>

            <input
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              placeholder="Products in Hair Care"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: colours.border,
                backgroundColor: colours.background,
                color: colours.text,
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: colours.text }}
            >
              Category Image
            </label>

            <label
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center text-sm"
              style={{
                borderColor: colours.border,
                color: colours.mutedText,
                backgroundColor: colours.background,
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Category preview"
                  className="h-32 w-full rounded-xl object-cover"
                />
              ) : (
                <span>Click to upload image from device</span>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {preview && (
              <p className="mt-2 text-xs" style={{ color: colours.mutedText }}>
                Upload a new image only if you want to replace the current one.
              </p>
            )}
          </div>

          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: colours.text }}
          >
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active category
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: colours.border,
                color: colours.text,
                backgroundColor: colours.background,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl border px-4 py-3 text-sm disabled:opacity-60"
              style={{
                borderColor: colours.accent,
                color: colours.accent,
                backgroundColor: colours.primary,
              }}
            >
              {saving ? "Saving..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
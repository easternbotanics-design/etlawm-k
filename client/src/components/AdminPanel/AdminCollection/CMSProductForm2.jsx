import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../../../services/productService.js';
import { createProduct, updateProduct, uploadImage, addProductImage } from '../../../services/adminService.js';
import concernService from '../../../services/concernService.js';
import { colours, fonts } from '../../../theme/theme.js';
import {
  FormStyles,
  FormCard,
  TextInput,
  StepperInput,
  CompoundInput,
  SelectField,
  ExpandableTextarea,
  ImageUploadCard,
  TagsCard,
  ActionButtonsCard,
  inputStyle,
  cardStyle,
} from '../FormComponents.jsx';

const API = import.meta.env.VITE_SERVER_API;

const BADGE_OPTIONS = ['', 'Bestseller', 'New Arrival', 'Limited Edition', 'Award Winner', 'Organic', 'Sale'].map(
  (b) => ({ value: b, label: b || 'No Badge' })
);
const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'amount', label: '₹ Off' },
];
const SIZE_UNIT_OPTIONS = ['g', 'ml', 'units', 'capsules', 'tablets', 'pcs'].map((u) => ({ value: u, label: u }));
const PRODUCT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'archived', label: 'Archived' },
];

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptyForm = {
  name: '',
  slug: '',
  code: '',
  categoryId: '',
  badge: '',
  price: '',
  discountValue: '',
  discountType: 'percentage',
  stockQty: '0',
  sizeValue: '',
  sizeUnit: 'ml',
  description: '',
  ingredients: '',
  usageInstructions: '',
  benefits: '',
  status: 'active',
  seoTitle: '',
  seoDescription: '',
  skinType: '',
  suitableFor: '',
  texture: '',
  concerns: [],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allIngredients, setAllIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [concernOptions, setConcernOptions] = useState([]);

  useEffect(() => {
    const loadDynamicConcerns = async () => {
      try {
        const data = await concernService.getPublicConcerns();
        if (data.success && Array.isArray(data.concerns) && data.concerns.length > 0) {
          const formatted = data.concerns.map((c) => ({
            value: c.slug || c.name,
            label: c.name,
          }));
          setConcernOptions(formatted);
        }
      } catch (err) {
        console.error('Failed to load dynamic concerns', err);
      }
    };
    loadDynamicConcerns();
  }, []);

  useEffect(() => {
    const loadAllIngredients = async () => {
      try {
        setLoadingIngredients(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/api/admin/ingredients`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAllIngredients(data.ingredients ?? []);
        }
      } catch (err) {
        console.error('Failed to load ingredients', err);
      } finally {
        setLoadingIngredients(false);
      }
    };
    loadAllIngredients();
  }, []);

  const refreshIngredientsList = async () => {
    try {
      setLoadingIngredients(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/ingredients`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAllIngredients(data.ingredients ?? []);
      }
    } catch (err) {
      console.error('Failed to refresh ingredients', err);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleToggleIngredient = (ingredient) => {
    setSelectedIngredients((prev) => {
      const exists = prev.some((item) => String(item.id) === String(ingredient.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(ingredient.id));
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleRemoveIngredient = (ingredientId) => {
    setSelectedIngredients((prev) => prev.filter((item) => String(item.id) !== String(ingredientId)));
  };

  const handleCreateNewIngredient = () => {
    window.open('/admin/content/ingredients', '_blank');
  };

  const filteredIngredients = allIngredients.filter(
    (ing) =>
      ing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const basePrice = Number(form.price || 0);
  const discountValue = Number(form.discountValue || 0);
  const finalPrice = Math.max(
    0,
    form.discountType === 'percentage'
      ? Math.floor(basePrice - (basePrice * discountValue) / 100)
      : basePrice - discountValue
  );

  useEffect(() => {
    const initForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const catRes = await fetch(`${API}/api/categories`);
        if (!catRes.ok) throw new Error('Failed to load categories');
        const catData = await catRes.json();
        const filteredCats = (catData.categories ?? []).filter((cat) => cat.slug !== 'all-products');
        setCategories(filteredCats);

        if (isEditMode) {
          const product = await getProductById(id);
          if (!product) throw new Error('Product not found');

          setForm({
            name: product.name || '',
            slug: product.slug || createSlug(product.name || ''),
            code: product.code || product.sku || '',
            categoryId: product.categoryId || product.category_id || '',
            badge: product.badge || '',
            price: product.originalPrice || product.original_price || product.price || '',
            discountValue: product.discountValue || product.discount_value || '',
            discountType: product.discountType || product.discount_type || 'percentage',
            stockQty: String(product.stockQty ?? product.stock_qty ?? 0),
            sizeValue: product.sizeValue || product.size_value || '',
            sizeUnit: product.sizeUnit || product.size_unit || 'ml',
            description: product.description || '',
            ingredients: product.ingredients || '',
            usageInstructions: product.usageInstructions || product.usage_instructions || '',
            benefits: Array.isArray(product.benefits) ? product.benefits.join('\n') : product.benefits || '',
            status: product.status || (product.isActive || product.is_active ? 'active' : 'archived'),
            seoTitle: product.seoTitle || product.seo_title || '',
            seoDescription: product.seoDescription || product.seo_description || '',
            skinType: product.skinType || product.skin_type || '',
            suitableFor: product.suitableFor || product.suitable_for || '',
            texture: product.texture || '',
            concerns: product.concerns || [],
          });

          const imgRes = await fetch(`${API}/api/product/${id}/images`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            setUploadedImages(imgData.images ?? []);
          } else if (product.image) {
            setUploadedImages([{ id: null, image_url: product.image, is_primary: true, sort_order: 0 }]);
          }

          const ingRes = await fetch(`${API}/api/product/${id}/ingredients`);
          if (ingRes.ok) {
            const ingData = await ingRes.json();
            const raw = ingData.ingredients ?? [];
            const unique = Array.from(new Map(raw.map((i) => [String(i.id), i])).values());
            setSelectedIngredients(unique);
          }
        }
      } catch (err) {
        setError(err.message ?? 'An error occurred while loading form data.');
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      setShowNewCategoryInput(value === 'NEW_CATEGORY');
    }

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'name' && !isEditMode) {
        next.slug = createSlug(value);
        if (!prev.seoTitle) next.seoTitle = value;
      }

      return next;
    });
  };

  const handleConcernChange = (concernValue) => {
    setForm((prev) => {
      const current = [...prev.concerns];
      return current.includes(concernValue)
        ? { ...prev, concerns: current.filter((item) => item !== concernValue) }
        : { ...prev, concerns: [...current, concernValue] };
    });
  };

  const handleFileChange = async (files) => {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) return;

    setUploadingImage(true);
    setError(null);

    try {
      const newUrls = [];
      for (const file of fileList) {
        const uploadResult = await uploadImage(file);
        if (uploadResult?.url) newUrls.push(uploadResult.url);
      }

      if (newUrls.length > 0) {
        setUploadedImages((prev) => {
          const updated = [...prev];
          newUrls.forEach((url, i) => {
            const hasPrimary = updated.some((img) => img.is_primary);
            updated.push({
              id: null,
              image_url: url,
              is_primary: !hasPrimary && i === 0,
              sort_order: updated.length,
            });
          });
          return updated;
        });
        setSuccess('Images uploaded successfully.');
        setTimeout(() => setSuccess(null), 2500);
      }
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetPrimary = (index) => {
    setUploadedImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const moveImage = (index, direction) => {
    setUploadedImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;

      const reordered = [...prev];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];

      return reordered.map((img, i) => ({
        ...img,
        sort_order: i,
        is_primary: i === 0,
      }));
    });
  };

  const handleDeleteImage = async (index) => {
    const target = uploadedImages[index];

    if (target.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/api/admin/products/${id}/images/${target.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) throw new Error('Failed to delete image from database');
      } catch (err) {
        setError(`Failed to delete image: ${err.message}`);
        return;
      }
    }

    setUploadedImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((img, i) => ({
        ...img,
        sort_order: i,
        is_primary: i === 0,
      }));
    });
  };

  const handleSubmit = async (e, submitMode = 'publish') => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Product Name is required.');
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (form.discountType === 'percentage' && discountValue > 100) {
      setError('Percentage discount cannot be more than 100.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let finalCategoryId = form.categoryId;
      if (form.categoryId === 'NEW_CATEGORY' && newCategoryName.trim()) {
        const response = await fetch(`${API}/api/admin/categories`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name: newCategoryName.trim() }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message ?? 'Failed to create new category');
        }
        const data = await response.json();
        finalCategoryId = data.category.id;
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || createSlug(form.name),
        code: form.code.trim() || null,
        category_id: finalCategoryId && finalCategoryId !== 'NEW_CATEGORY' ? Number(finalCategoryId) : null,
        badge: form.badge || null,

        price: Number(finalPrice.toFixed(2)),
        original_price: discountValue > 0 ? Number(basePrice.toFixed(2)) : null,

        discount_value: discountValue || null,
        discount_type: discountValue > 0 ? form.discountType : 'percentage',

        stock_qty: Number(form.stockQty || 0),

        size_value: form.sizeValue ? Number(form.sizeValue) : null,
        size_unit: form.sizeValue ? form.sizeUnit : null,

        description: form.description,
        ingredients: form.ingredients,
        usage_instructions: form.usageInstructions,

        benefits: form.benefits
          ? form.benefits
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
          : [],

        status: submitMode === 'draft' ? 'draft' : form.status,
        is_active: submitMode !== 'draft' && form.status === 'active',
        is_draft: submitMode === 'draft',

        seo_title: form.seoTitle || form.name,
        seo_description: form.seoDescription || form.description.slice(0, 155),

        skin_type: form.skinType.trim() || null,
        suitable_for: form.suitableFor.trim() || null,
        texture: form.texture.trim() || null,

        concerns: form.concerns,
      };

      let savedProduct;
      if (isEditMode) {
        savedProduct = await updateProduct(id, payload);

        for (let i = 0; i < uploadedImages.length; i++) {
          const img = uploadedImages[i];
          if (!img.id) {
            await addProductImage(id, img.image_url, i === 0, i);
          } else if (i === 0 || img.is_primary) {
            const token = localStorage.getItem('token');
            await fetch(`${API}/api/admin/products/${id}/images/${img.id}/primary`, {
              method: 'PATCH',
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });
          }
        }

        setSuccess(submitMode === 'draft' ? 'Draft saved successfully.' : 'Product updated successfully.');

        const token = localStorage.getItem('token');
        await fetch(`${API}/api/admin/products/${id}/ingredients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ingredientIds: selectedIngredients.map((i) => i.id) }),
        });
      } else {
        savedProduct = await createProduct(payload);

        if (savedProduct?.id) {
          for (let i = 0; i < uploadedImages.length; i++) {
            const img = uploadedImages[i];
            await addProductImage(savedProduct.id, img.image_url, i === 0, i);
          }

          const token = localStorage.getItem('token');
          await fetch(`${API}/api/admin/products/${savedProduct.id}/ingredients`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ ingredientIds: selectedIngredients.map((i) => i.id) }),
          });
        }

        setSuccess(submitMode === 'draft' ? 'Draft saved successfully.' : 'Product published successfully.');
      }

      setTimeout(() => navigate('/admin/collection'), 1200);
    } catch (err) {
      setError(err.message ?? 'Failed to save product details.');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    { value: 'NEW_CATEGORY', label: '+ Add New Category' },
  ];

  return (
    <div style={{ backgroundColor: colours.primary, fontFamily: fonts.secondary, color: colours.text }} className="min-h-screen flex flex-col">
      <FormStyles />

      <main className="flex-1 pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full pb-16">
        <div className="mb-8">
          <Link
            to="/admin/collection"
            style={{ color: colours.accent }}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-colors font-semibold mb-4 no-underline"
          >
            <svg className="w-4 h-4 duration-100 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>

          <div style={cardStyle} className="border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-3xl md:text-4xl tracking-wide font-normal">
                {isEditMode ? 'Edit Product' : 'Add Product'}
              </h1>
              <p style={{ color: colours.mutedText }} className="text-xs tracking-wider uppercase font-semibold mt-1">
                {isEditMode ? `ID: ${id} • Update product catalogue details` : 'Create product profile, inventory, images and SEO details'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs" style={{ color: colours.mutedText }}>
              <span>Collections</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>Add Product</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-3 rounded shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-start gap-3 rounded shadow-sm">
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div style={cardStyle} className="flex flex-col items-center justify-center py-20 border rounded-2xl">
            <div style={{ borderTopColor: colours.accent }} className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 mb-4"></div>
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading product data...</p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, 'publish')} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              {/* General */}
              <FormCard title="General" description="Core product information shown on the store.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput label="Product Name" required name="name" value={form.name} onChange={handleChange} placeholder="e.g. Botanical Hair Serum" />
                  <TextInput label="Slug" name="slug" value={form.slug} onChange={handleChange} placeholder="botanical-hair-serum" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextInput label="Product Code" name="code" value={form.code} onChange={handleChange} placeholder="BHS-100ML" />

                  <div>
                    <SelectField label="Category" required name="categoryId" value={form.categoryId} onChange={handleChange} options={categoryOptions} />
                    {showNewCategoryInput && (
                      <input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        style={inputStyle}
                        className="form-input mt-3 w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
                      />
                    )}
                  </div>

                  <SelectField label="Tag / Badge" name="badge" value={form.badge} onChange={handleChange} options={BADGE_OPTIONS} />
                </div>
              </FormCard>

              {/* Pricing & Inventory */}
              <FormCard title="Pricing & Inventory" description="Discount supports percentage or flat rupee amount.">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <TextInput
                    label="Price" required type="number" name="price" value={form.price} onChange={handleChange}
                    min="1" step="0.01" placeholder="850"
                  />

                  <div className="md:col-span-2">
                    <CompoundInput
                      label="Discount"
                      selectWidth="w-24"
                      inputProps={{ type: 'number', name: 'discountValue', value: form.discountValue, onChange: handleChange, min: '0', step: '0.01', placeholder: '12' }}
                      selectProps={{ name: 'discountType', value: form.discountType, onChange: handleChange }}
                      options={DISCOUNT_TYPES}
                    />
                    <p style={{ color: colours.mutedText }} className="text-[11px] mt-2">Final price: ₹{finalPrice.toFixed(2)}</p>
                  </div>

                  <StepperInput label="Stock" required name="stockQty" value={form.stockQty} onChange={handleChange} min={0} placeholder="50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CompoundInput
                    label="Size / Quantity"
                    selectWidth="w-24"
                    inputProps={{ type: 'number', name: 'sizeValue', value: form.sizeValue, onChange: handleChange, min: '0', step: '0.01', placeholder: '100' }}
                    selectProps={{ name: 'sizeUnit', value: form.sizeUnit, onChange: handleChange }}
                    options={SIZE_UNIT_OPTIONS}
                  />

                  <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={PRODUCT_STATUS} />
                </div>
              </FormCard>

              {/* Content */}
              <FormCard title="Content" description="Separate fields make the product page easier to design.">
                <ExpandableTextarea
                  label="Description" name="description" value={form.description} onChange={handleChange}
                  rows={5} placeholder="Enter full product details..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ExpandableTextarea
                    label="Ingredients" name="ingredients" value={form.ingredients} onChange={handleChange}
                    rows={4} placeholder="Amla, Bhringraj, Rosemary..."
                  />
                  <ExpandableTextarea
                    label="Usage Instructions" name="usageInstructions" value={form.usageInstructions} onChange={handleChange}
                    rows={4} placeholder="Apply 2-3 drops and massage gently..."
                  />
                </div>

                <ExpandableTextarea
                  label="Benefits / Highlights" name="benefits" value={form.benefits} onChange={handleChange}
                  rows={4} placeholder="One benefit per line is best for rendering bullet points."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextInput label="Skin Type" name="skinType" value={form.skinType} onChange={handleChange} placeholder="e.g. All Skin Types, Oily, Sensitive" />
                  <TextInput label="Suitable For" name="suitableFor" value={form.suitableFor} onChange={handleChange} placeholder="e.g. Men & Women, Hair Fall, Acne" />
                  <TextInput label="Texture" name="texture" value={form.texture} onChange={handleChange} placeholder="e.g. Lightweight Gel, Serum, Cream" />
                </div>
              </FormCard>

              {/* Ingredient relations (bespoke — chips + modal picker, not a fixed tag set) */}
              <FormCard title="Ingredients" description="Select and order the ingredients for this product.">
                <div className="flex flex-wrap gap-2 min-h-[50px] p-4 rounded-xl border border-dashed items-center" style={{ borderColor: colours.border, backgroundColor: `${colours.primary}33` }}>
                  {selectedIngredients.length > 0 ? (
                    selectedIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        style={{ backgroundColor: colours.accent, color: colours.background, fontFamily: fonts.secondary }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-200"
                      >
                        <span>{ingredient.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(ingredient.id)}
                          className="hover:scale-110 active:scale-95 transition-transform text-white bg-transparent border-none p-0 cursor-pointer text-sm font-bold leading-none"
                          title="Remove ingredient"
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  ) : (
                    <span style={{ color: colours.mutedText }} className="text-xs italic select-none">
                      No ingredients selected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button" onClick={() => setShowPopup(true)}
                    style={{ backgroundColor: colours.secondary, color: colours.background }}
                    className="form-btn-primary px-4 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer border-none"
                  >
                    Add Existing Ingredient
                  </button>
                  <button
                    type="button" onClick={handleCreateNewIngredient}
                    style={{ borderColor: colours.border, color: colours.text }}
                    className="form-btn-secondary border px-4 py-3 rounded-lg text-xs uppercase tracking-widest font-semibold bg-transparent transition-all cursor-pointer"
                  >
                    Create New Ingredient
                  </button>
                </div>
              </FormCard>

              {/* SEO */}
              <FormCard title="SEO" description="Optional product-level metadata for the product page.">
                <TextInput label="SEO Title" name="seoTitle" value={form.seoTitle} onChange={handleChange} placeholder="Botanical Hair Serum for Hair Fall" />

                <div>
                  <ExpandableTextarea
                    label="SEO Description" name="seoDescription" value={form.seoDescription} onChange={handleChange}
                    rows={3} maxLength="160" placeholder="Short search result description, ideally under 160 characters."
                  />
                  <p style={{ color: colours.mutedText }} className="text-[11px] mt-2">{form.seoDescription.length}/160 characters</p>
                </div>
              </FormCard>
            </div>

            <aside className="xl:col-span-4 space-y-8">
              <ImageUploadCard
                description="Upload multiple images. First image is used as primary."
                images={uploadedImages.map((img) => ({ url: img.image_url }))}
                uploading={uploadingImage}
                onUpload={handleFileChange}
                onMove={moveImage}
                onSetPrimary={handleSetPrimary}
                onRemove={handleDeleteImage}
              />

              <TagsCard
                title="Concern Tags"
                description="Used for filters such as dandruff, acne and glow."
                options={concernOptions}
                selected={form.concerns}
                onToggle={handleConcernChange}
              />

              <ActionButtonsCard
                isEditMode={isEditMode}
                saving={saving}
                disabled={uploadingImage}
                submitLabel={saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Publish Product'}
                onSaveDraft={(e) => handleSubmit(e, 'draft')}
                cancelHref="/admin/collection"
                LinkComponent={Link}
              />
            </aside>
          </form>
        )}
      </main>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div style={cardStyle} className="w-full max-w-lg rounded-2xl border shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: colours.border }}>
              <h3 style={{ fontFamily: fonts.primary }} className="text-xl font-semibold">Add Existing Ingredients</h3>
              <button
                type="button" onClick={() => setShowPopup(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors bg-transparent border-none text-2xl p-0 cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-4 border-b flex gap-3 items-center" style={{ borderColor: colours.border }}>
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..." style={inputStyle}
                className="form-input flex-1 rounded-lg border px-4 py-2 text-sm placeholder-stone-400 focus:outline-none transition-all"
              />
              <button
                type="button" onClick={refreshIngredientsList} disabled={loadingIngredients}
                className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                style={{ borderColor: colours.border, color: colours.text }}
              >
                {loadingIngredients ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>

            <div className="p-4 space-y-2" style={{ maxHeight: '400px', overflowY: 'auto' }} data-lenis-prevent>
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((ing) => {
                  const isSelected = selectedIngredients.some((item) => String(item.id) === String(ing.id));
                  return (
                    <div
                      key={ing.id}
                      style={{ borderColor: colours.border, backgroundColor: isSelected ? `${colours.accent}15` : 'transparent' }}
                      className="flex items-center justify-between p-3 rounded-xl border transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {ing.image_url ? (
                          <img src={ing.image_url} alt={ing.name} className="w-10 h-10 rounded-lg object-cover border" style={{ borderColor: colours.border }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-stone-100" style={{ borderColor: colours.border }}>🌱</div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{ing.name}</p>
                          {ing.scientific_name && (
                            <p style={{ color: colours.mutedText }} className="text-xs italic truncate">{ing.scientific_name}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button" onClick={() => handleToggleIngredient(ing)}
                        style={{
                          backgroundColor: isSelected ? colours.accent : 'transparent',
                          color: isSelected ? colours.background : colours.text,
                          borderColor: isSelected ? colours.accent : colours.border,
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer"
                      >
                        {isSelected ? 'Selected' : 'Add'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center" style={{ color: colours.mutedText }}>
                  {loadingIngredients ? 'Loading ingredients...' : `No ingredients found matching "${searchQuery}"`}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: colours.border }}>
              <button
                type="button" onClick={() => setShowPopup(false)}
                style={{ backgroundColor: colours.secondary, color: colours.background }}
                className="form-btn-primary px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer border-none"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
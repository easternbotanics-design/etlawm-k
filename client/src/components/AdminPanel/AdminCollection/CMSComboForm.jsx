import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../../../services/productService.js';
import { uploadImage, getComboById, createCombo, updateCombo } from '../../../services/adminService.js';
import { colours, fonts } from '../../../theme/theme.js';
import {
  FormStyles,
  FormCard,
  TextInput,
  CompoundInput,
  SelectField,
  ExpandableTextarea,
  ImageUploadCard,
  ActionButtonsCard,
  inputStyle,
  cardStyle,
} from '../FormComponents.jsx';

const BADGE_OPTIONS = [
  { value: 'combo', label: 'Combo (Default)' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'special_offer', label: 'Special Offer' },
  { value: 'limited_edition', label: 'Limited Edition' },
];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: '₹ Off' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
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
  badge: 'combo',
  price: '',
  originalPrice: '',
  discountValue: '',
  discountType: 'percentage',
  description: '',
  status: 'active',
  selectedProductIds: [],
};

export default function CMSComboForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState(emptyForm);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsData = await getProducts();
        if (Array.isArray(productsData)) {
          setAvailableProducts(productsData);
        }

        if (isEditMode) {
          const res = await getComboById(id);
          if (res.success && res.combo) {
            const comb = res.combo;
            const selectedIds = Array.isArray(comb.products)
              ? comb.products.map((p) => String(p.product_id || p.id))
              : [];

            setForm({
              name: comb.name || '',
              slug: comb.slug || createSlug(comb.name || ''),
              badge: comb.badge || 'combo',
              price: comb.price || '',
              originalPrice: comb.original_price || '',
              discountValue: comb.discount_value || '',
              discountType: comb.discount_type || 'percentage',
              description: comb.description || '',
              status: comb.is_active ? 'active' : 'disabled',
              selectedProductIds: selectedIds,
            });

            if (Array.isArray(comb.images) && comb.images.length > 0) {
              setUploadedImages(comb.images);
            } else if (comb.image_url) {
              setUploadedImages([{ image_url: comb.image_url, is_primary: true, sort_order: 0 }]);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading combo form data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'name' && !isEditMode) {
        next.slug = createSlug(value);
      }

      return next;
    });
  };

  const handleToggleProduct = (productId) => {
    const idStr = String(productId);
    setForm((prev) => {
      const current = prev.selectedProductIds;
      const updated = current.includes(idStr)
        ? current.filter((i) => i !== idStr)
        : [...current, idStr];

      // Auto-compute total original price of selected products
      const sumOriginalPrice = availableProducts
        .filter((p) => updated.includes(String(p.id)))
        .reduce((sum, p) => sum + (Number(p.price) || 0), 0);

      return {
        ...prev,
        selectedProductIds: updated,
        originalPrice: sumOriginalPrice > 0 ? String(sumOriginalPrice) : prev.originalPrice,
      };
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

  const handleDeleteImage = (index) => {
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
      setError('Combo Name is required.');
      return;
    }

    if (form.selectedProductIds.length === 0) {
      setError('Please select at least one product for this combo.');
      return;
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      setError('Discount value is required and must be greater than 0.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const primaryImg = uploadedImages.find((img) => img.is_primary) || uploadedImages[0];
      const mainImageUrl = primaryImg ? primaryImg.image_url : null;

      const baseOriginal = Number(form.originalPrice) || 0;
      const discountVal = Number(form.discountValue) || 0;
      let computedPrice = Number(form.price);

      if (!computedPrice || isNaN(computedPrice) || computedPrice <= 0) {
        if (form.discountType === 'percentage') {
          computedPrice = Math.floor(baseOriginal - (baseOriginal * discountVal) / 100);
        } else {
          computedPrice = Math.floor(baseOriginal - discountVal);
        }
      } else {
        computedPrice = Math.floor(computedPrice);
      }
      computedPrice = Math.max(0, computedPrice);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || createSlug(form.name),
        badge: form.badge || 'combo',
        price: computedPrice,
        original_price: baseOriginal > 0 ? Math.floor(baseOriginal) : null,
        discount_value: discountVal,
        discount_type: form.discountType,
        description: form.description,
        image_url: mainImageUrl,
        images: uploadedImages,
        is_active: submitMode !== 'draft' && form.status === 'active',
        product_ids: form.selectedProductIds,
      };

      if (isEditMode) {
        await updateCombo(id, payload);
      } else {
        await createCombo(payload);
      }

      setSuccess(isEditMode ? 'Combo updated successfully.' : 'Combo created successfully.');
      setTimeout(() => navigate('/admin/collection/combos'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to save combo details.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProductsList = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: colours.primary, fontFamily: fonts.secondary, color: colours.text }} className="min-h-screen flex flex-col">
      <FormStyles />

      <main className="flex-1 pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full pb-16">
        <div className="mb-8">
          <Link
            to="/admin/collection/combos"
            style={{ color: colours.accent }}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-colors font-semibold mb-4 no-underline"
          >
            <svg className="w-4 h-4 duration-100 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Combos
          </Link>

          <div style={cardStyle} className="border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 style={{ fontFamily: fonts.primary, color: colours.text }} className="text-3xl md:text-4xl tracking-wide font-normal">
                {isEditMode ? 'Edit Combo Offer' : 'Add Combo Offer'}
              </h1>
              <p style={{ color: colours.mutedText }} className="text-xs tracking-wider uppercase font-semibold mt-1">
                {isEditMode ? `ID: ${id} • Update combo package, products, pricing and images` : 'Create a new combo offer with selected products, discount, and gallery images'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs" style={{ color: colours.mutedText }}>
              <span>Collections</span>
              <span>/</span>
              <span>Combos</span>
              <span>/</span>
              <span style={{ color: colours.accent }}>{isEditMode ? 'Edit' : 'Add'}</span>
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
            <p style={{ fontFamily: fonts.primary, color: colours.text }} className="text-lg">Loading combo data...</p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, 'publish')} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              {/* General Details */}
              <FormCard title="General Details" description="Define combo title, URL slug, and badge identifier.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput
                    label="Combo Name"
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Hair Care Essential Bundle"
                  />
                  <TextInput
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="hair-care-essential-bundle"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Tag / Badge"
                    name="badge"
                    value={form.badge}
                    onChange={handleChange}
                    options={BADGE_OPTIONS}
                  />
                  <SelectField
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </FormCard>

              {/* Combo Products Selection */}
              <FormCard
                title="Select Combo Products"
                description={`Choose products included in this combo (${form.selectedProductIds.length} selected).`}
              >
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={inputStyle}
                    className="form-input w-full rounded-lg border px-4 py-2.5 text-sm placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>

                <div
                  className="max-h-64 overflow-y-auto border rounded-xl p-3 space-y-2"
                  style={{ borderColor: colours.border, backgroundColor: `${colours.primary}33` }}
                  data-lenis-prevent
                >
                  {filteredProductsList.length === 0 ? (
                    <p style={{ color: colours.mutedText }} className="text-xs italic text-center py-4">
                      No matching products found.
                    </p>
                  ) : (
                    filteredProductsList.map((product) => {
                      const isSelected = form.selectedProductIds.includes(String(product.id));
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleToggleProduct(product.id)}
                          style={{
                            borderColor: isSelected ? colours.accent : colours.border,
                            backgroundColor: isSelected ? `${colours.accent}15` : colours.background,
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {product.primary_image || product.image ? (
                              <img
                                src={product.primary_image || product.image}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg shrink-0 border border-stone-200"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0"
                                style={{ backgroundColor: colours.primary, color: colours.accent }}
                              >
                                PROD
                              </div>
                            )}
                            <div className="truncate">
                              <p className="text-xs font-semibold text-stone-800 truncate">{product.name}</p>
                              <p style={{ color: colours.mutedText }} className="text-[11px]">
                                ₹{parseFloat(product.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-stone-300 accent-stone-800 shrink-0 cursor-pointer"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </FormCard>

              {/* Pricing & Discount */}
              <FormCard title="Pricing & Discount" description="Set price, discount percentage or flat amount. Final price is rounded down (floored).">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextInput
                    label="Original Total Price"
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Sum of selected products"
                  />

                  <div>
                    <CompoundInput
                      label="Discount"
                      selectWidth="w-24"
                      inputProps={{
                        type: 'number',
                        name: 'discountValue',
                        value: form.discountValue,
                        onChange: handleChange,
                        min: '0',
                        step: '0.01',
                        placeholder: '15',
                      }}
                      selectProps={{
                        name: 'discountType',
                        value: form.discountType,
                        onChange: handleChange,
                      }}
                      options={DISCOUNT_TYPES}
                    />
                    {Number(form.originalPrice) > 0 && Number(form.discountValue) > 0 && (
                      <p style={{ color: colours.mutedText }} className="text-[11px] mt-2">
                        Suggested Floored Price: ₹
                        {Math.max(
                          0,
                          form.discountType === 'percentage'
                            ? Math.floor(Number(form.originalPrice) - (Number(form.originalPrice) * Number(form.discountValue)) / 100)
                            : Math.floor(Number(form.originalPrice) - Number(form.discountValue))
                        )}
                      </p>
                    )}
                  </div>

                  <TextInput
                    label="Combo Price"
                    required
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="Final Bundle Price"
                  />
                </div>
              </FormCard>

              {/* Description */}
              <FormCard title="Description" description="Enter description for this combo offer.">
                <ExpandableTextarea
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Detailed description of what is included in this combo offer..."
                />
              </FormCard>
            </div>

            {/* Sidebar Column */}
            <aside className="xl:col-span-4 space-y-8">
              <ImageUploadCard
                title="Combo Images"
                description="Upload images for this combo. First image is used as primary thumbnail."
                images={uploadedImages.map((img) => ({ url: img.image_url }))}
                uploading={uploadingImage}
                onUpload={handleFileChange}
                onMove={moveImage}
                onSetPrimary={handleSetPrimary}
                onRemove={handleDeleteImage}
              />

              <ActionButtonsCard
                isEditMode={isEditMode}
                saving={saving}
                disabled={uploadingImage}
                submitLabel={saving ? 'Saving...' : isEditMode ? 'Update Combo' : 'Publish Combo'}
                onSaveDraft={(e) => handleSubmit(e, 'draft')}
                cancelHref="/admin/collection/combos"
                LinkComponent={Link}
              />
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

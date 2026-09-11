import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReviewsTable from './ReviewsTable';
import { colours, fonts } from '../../../theme/theme';
import reviewService from "../../../services/reviewService";
import { uploadImage } from "../../../services/adminService";

/* ── Action button component ─────── */
const ActionButton = ({ name, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={name}
    style={{
      borderColor: colours.border,
      backgroundColor: colours.background,
      fontFamily: fonts.secondary,
    }}
    className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium duration-300 shadow-xs hover:shadow-md"
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = colours.accent;
      e.currentTarget.style.backgroundColor = colours.primary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = colours.border;
      e.currentTarget.style.backgroundColor = colours.background;
    }}
  >
    {icon}
    <span
      style={{ color: colours.text }}
      className="transition-colors duration-300 group-hover:text-[#A77C6B]"
    >
      {name}
    </span>
  </button>
);

/* ── Inline SVG Icons ─ */
const ArrowLeftIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const PhotoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ProductReviews = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [productName, setProductName] = useState('');
  const [reviewsBgImage, setReviewsBgImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await reviewService.getReviewsByProductSlug(slug);
        
        setReviews(data.reviews ?? []);
        setReviewsBgImage(data.reviews_bg_image ?? null);
        setProductName(
          data.product_name ??
            slug
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
        );
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [slug]);

  const handleEdit = (review) => {
    navigate(`/admin/content/reviews/edit/${review.id}`, {
      state: {
        returnTo: `/admin/content/reviews/${slug}`,
      },
    });
  };

  const handleDeleted = (deletedReview) => {
    setReviews((prev) => prev.filter((r) => r.id !== deletedReview.id));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setModalError('');
    setModalSuccess('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile && !previewUrl) {
      setModalError('Please select an image file to upload.');
      return;
    }

    try {
      setUploading(true);
      setModalError('');
      setModalSuccess('');

      let imageUrl = reviewsBgImage;

      if (selectedFile) {
        const uploadRes = await uploadImage(selectedFile, 'product-images');
        imageUrl = uploadRes.url;
      }

      const res = await reviewService.updateProductReviewsBgImage(slug, imageUrl);
      setReviewsBgImage(res.reviews_bg_image ?? imageUrl);
      setModalSuccess('Background photo updated successfully!');
      
      setTimeout(() => {
        setIsPhotoModalOpen(false);
        setModalSuccess('');
        setSelectedFile(null);
        setPreviewUrl('');
      }, 1000);
    } catch (err) {
      setModalError(err.message || 'Failed to upload and save image.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      setModalError('');
      setModalSuccess('');

      await reviewService.updateProductReviewsBgImage(slug, null);
      setReviewsBgImage(null);
      setSelectedFile(null);
      setPreviewUrl('');
      setModalSuccess('Background photo removed successfully.');

      setTimeout(() => {
        setIsPhotoModalOpen(false);
        setModalSuccess('');
      }, 1000);
    } catch (err) {
      setModalError(err.message || 'Failed to remove background photo.');
    } finally {
      setUploading(false);
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
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/content/reviews')}
        className="group mb-4 flex cursor-pointer items-center gap-1 text-sm bg-transparent border-none"
        style={{ color: colours.accent }}
      >
        <span className="transition-transform duration-100 group-hover:-translate-x-1 inline-flex">
          <ArrowLeftIcon />
        </span>
        <span>Back</span>
      </button>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: colours.secondary,
              fontFamily: fonts.primary,
            }}
          >
            {productName || 'Product Reviews'}
          </h1>

          <p className="mt-1 text-sm" style={{ color: colours.mutedText }}>
            Manage customer reviews for this product.
          </p>
        </div>

        {/* Action Buttons: Add Photo beside Add Review */}
        <div className="flex items-center gap-3">
          <ActionButton
            name={reviewsBgImage ? "Edit Photo" : "Add Photo"}
            icon={<PhotoIcon />}
            onClick={() => {
              setModalError('');
              setModalSuccess('');
              setSelectedFile(null);
              setPreviewUrl('');
              setIsPhotoModalOpen(true);
            }}
          />

          <ActionButton
            name="Add Review"
            onClick={() =>
              navigate('/admin/content/reviews/add-review', {
                state: {
                  returnTo: `/admin/content/reviews/${slug}`,
                },
              })
            }
          />
        </div>
      </div>

      {/* Background image badge indicator */}
      {reviewsBgImage && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/50">
          <img
            src={reviewsBgImage}
            alt="Review Section Background"
            className="w-12 h-12 object-cover rounded-lg border border-amber-300"
          />
          <div className="text-xs">
            <span className="font-semibold text-stone-800">Review Section Background Photo Active</span>
            <p className="text-stone-500">This photo will appear as the background on the product page review section.</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-sm" style={{ color: colours.mutedText }}>
          Loading reviews...
        </p>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-8 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Reviews table */}
      {!loading && !error && (
        <ReviewsTable
          reviews={reviews}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}

      {/* Upload Background Photo Modal Popup */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl transition-all border"
            style={{
              backgroundColor: colours.background,
              borderColor: colours.border,
              fontFamily: fonts.secondary,
            }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: colours.border }}>
              <h3 className="text-xl font-semibold" style={{ color: colours.secondary, fontFamily: fonts.primary }}>
                Upload Review Background Photo
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer bg-transparent border-none"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs sm:text-sm text-stone-600">
                Upload a background photo for <span className="font-semibold">{productName}</span>'s review section on the product page. Stored in Supabase storage bucket.
              </p>

              {/* Current / Selected Image Preview */}
              {(previewUrl || reviewsBgImage) && (
                <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50 max-h-48 flex items-center justify-center">
                  <img
                    src={previewUrl || reviewsBgImage}
                    alt="Review background preview"
                    className="w-full h-44 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* File Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Select Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="w-full text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  Allowed formats: JPG, PNG, WebP, SVG. Stored in Supabase <span className="font-semibold text-stone-600">product-images</span> bucket.
                </p>
              </div>

              {/* Messages */}
              {modalError && (
                <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 text-xs rounded-xl bg-green-50 text-green-700 border border-green-200">
                  {modalSuccess}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200 gap-3">
                {reviewsBgImage ? (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? 'Removing...' : 'Remove Photo'}
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(false)}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl text-xs font-medium border text-stone-700 hover:bg-stone-100 transition-all cursor-pointer disabled:opacity-50"
                    style={{ borderColor: colours.border }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadAndSave}
                    disabled={uploading || (!selectedFile && !reviewsBgImage)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 hover:bg-stone-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {uploading ? 'Uploading...' : 'Save Photo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;


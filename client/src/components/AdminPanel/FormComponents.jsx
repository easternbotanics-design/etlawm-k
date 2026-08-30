// FormComponents.jsx
// Reusable CMS form building blocks — extracted from CMSProductForm.jsx so every
// admin form (products, categories, ingredients, etc.) can be built by composing
// these instead of rewriting field markup each time.
//
// USAGE: adjust the theme import path below to match where you drop this file.
// It currently assumes the same depth CMSProductForm.jsx used.
import { useEffect, useRef, useState } from 'react';
import { colours, fonts } from '../../theme/theme.js';

// ---------------------------------------------------------------------------
// Shared style objects + focus-state CSS (inject <FormStyles /> once per page)
// ---------------------------------------------------------------------------
export const inputStyle = {
  color: colours.text,
  borderColor: colours.border,
  backgroundColor: `${colours.primary}66`,
};

export const cardStyle = {
  backgroundColor: colours.background,
  borderColor: colours.border,
};

const SCOPED_CSS = `
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    border-color: ${colours.accent} !important;
    background-color: ${colours.background} !important;
    box-shadow: 0 0 0 1px ${colours.accent} !important;
  }
  .form-btn-primary:hover {
    background-color: ${colours.accent} !important;
    color: ${colours.background} !important;
    box-shadow: 0 4px 12px rgba(167, 124, 107, 0.2) !important;
  }
  .form-btn-secondary:hover {
    background-color: ${colours.primary} !important;
  }
  .form-stepper-btn:hover {
    background-color: ${colours.primary} !important;
  }
`;

/** Drop this once near the top of every form page (inside the themed wrapper). */
export const FormStyles = () => <style>{SCOPED_CSS}</style>;

// ---------------------------------------------------------------------------
// FieldLabel — the small uppercase title that sits above every input
// ---------------------------------------------------------------------------
export const FieldLabel = ({ children, required }) => (
  <label style={{ color: colours.mutedText }} className="block text-xs uppercase tracking-widest font-semibold mb-2">
    {children}
    {required ? ' *' : ''}
  </label>
);

// ---------------------------------------------------------------------------
// FormCard — the bordered rounded-2xl container with an optional heading
// Wrap any combination of the field components below in one of these.
// ---------------------------------------------------------------------------
export const FormCard = ({ title, description, children, className = '', sticky = false }) => (
  <section
    style={cardStyle}
    className={`border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 ${sticky ? 'sticky top-24' : ''} ${className}`}
  >
    {(title || description) && (
      <div>
        {title && (
          <h2 style={{ fontFamily: fonts.primary }} className="text-2xl font-semibold">
            {title}
          </h2>
        )}
        {description && (
          <p style={{ color: colours.mutedText }} className="text-xs mt-1">
            {description}
          </p>
        )}
      </div>
    )}
    {children}
  </section>
);

// ---------------------------------------------------------------------------
// TextInput — plain text/number/etc input with label + placeholder
// ---------------------------------------------------------------------------
export const TextInput = ({ label, required, className = '', ...props }) => (
  <div className={className}>
    {label && <FieldLabel required={required}>{label}</FieldLabel>}
    <input
      {...props}
      style={inputStyle}
      className="form-input w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
    />
  </div>
);

// ---------------------------------------------------------------------------
// StepperInput — number input with −/+ buttons on either side
// onChange fires with the same { target: { name, value } } shape as a normal
// input event, so it drops straight into an existing handleChange(e) handler.
// ---------------------------------------------------------------------------
export const StepperInput = ({
  label,
  required,
  name,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  placeholder,
  className = '',
}) => {
  const update = (delta) => {
    const next = Math.min(max, Math.max(min, Number(value || 0) + delta));
    onChange({ target: { name, value: String(next) } });
  };

  return (
    <div className={className}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={inputStyle} className="form-input flex items-center rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => update(-step)}
          style={{ color: colours.text }}
          className="form-stepper-btn px-4 py-3 text-lg leading-none bg-transparent border-none cursor-pointer transition-colors"
        >
          −
        </button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-center text-sm focus:outline-none py-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => update(step)}
          style={{ color: colours.text }}
          className="form-stepper-btn px-4 py-3 text-lg leading-none bg-transparent border-none cursor-pointer transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CompoundInput — number/text input with an attached dropdown (Discount %/₹,
// Size value + unit, etc). inputProps/selectProps pass straight through.
// ---------------------------------------------------------------------------
export const CompoundInput = ({
  label,
  required,
  inputProps,
  selectProps,
  options,
  selectWidth = 'w-24',
  className = '',
}) => (
  <div className={className}>
    {label && <FieldLabel required={required}>{label}</FieldLabel>}
    <div className="flex gap-2">
      <input
        {...inputProps}
        style={inputStyle}
        className="form-input flex-1 min-w-0 rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none transition-all"
      />
      <select
        {...selectProps}
        style={inputStyle}
        className={`form-select ${selectWidth} rounded-lg border px-2 py-3 text-sm focus:outline-none transition-all`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// SelectField — plain labelled dropdown
// ---------------------------------------------------------------------------
export const SelectField = ({ label, required, options, className = '', ...props }) => (
  <div className={className}>
    {label && <FieldLabel required={required}>{label}</FieldLabel>}
    <select
      {...props}
      style={inputStyle}
      className="form-select w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-all"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// ---------------------------------------------------------------------------
// ExpandableTextarea v2 — auto-grows with content and animates the grow/shrink
// with a real CSS transition (native browser resize-handles don't animate at
// all, which is what felt "cranky"). Caps out at `maxHeight`, at which point
// an Expand/Collapse pill appears to smoothly open it up to `expandedMaxHeight`
// and scroll internally past that (data-lenis-prevent keeps Lenis from
// hijacking that internal scroll).
// ---------------------------------------------------------------------------
export const ExpandableTextarea = ({
  label,
  required,
  rows = 4,
  minHeight,
  maxHeight = 220,
  expandedMaxHeight = 480,
  className = '',
  value,
  onChange,
  ...props
}) => {
  const textareaRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const floorHeight = minHeight ?? rows * 21 + 26; // rough line-height + vertical padding
  const cap = isExpanded ? expandedMaxHeight : maxHeight;

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    // Collapse first so scrollHeight reflects actual content, not the old
    // fixed height — this happens in the same synchronous tick as the line
    // below, so nothing is ever painted at 0px; the browser only animates
    // from the last-painted height to the new target height.
    el.style.height = '0px';
    const natural = el.scrollHeight;
    const next = Math.min(Math.max(natural, floorHeight), cap);
    el.style.height = `${next}px`;
    setIsOverflowing(natural > cap);
  };

  useEffect(() => {
    resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isExpanded, cap]);

  useEffect(() => {
    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cap]);

  return (
    <div className={className}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className="relative">
        <textarea
          {...props}
          ref={textareaRef}
          value={value}
          onChange={onChange}
          data-lenis-prevent
          style={{
            ...inputStyle,
            minHeight: floorHeight,
            transition:
              'height 260ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease',
          }}
          className="form-textarea block w-full rounded-lg border px-4 py-3 text-sm placeholder-stone-400 focus:outline-none resize-none overflow-y-auto"
        />

        {(isOverflowing || isExpanded) && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            style={{ borderColor: colours.border, color: colours.mutedText, backgroundColor: colours.background }}
            className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border shadow-sm cursor-pointer transition-colors hover:opacity-80"
          >
            <svg
              className={`w-3 h-3 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ImageUploadCard — upload button + reorderable image list with primary/remove
// images: [{ url, label? }]
// ---------------------------------------------------------------------------
export const ImageUploadCard = ({
  title = 'Images',
  description = 'Upload multiple images. First image is used as primary.',
  images = [],
  uploading = false,
  multiple = true,
  onUpload,
  onMove,
  onSetPrimary,
  onRemove,
  className = '',
}) => (
  <FormCard title={title} description={description} className={className}>
    <label
      style={{ backgroundColor: colours.secondary, color: colours.background }}
      className="form-btn-primary cursor-pointer transition-all duration-300 text-xs uppercase tracking-widest font-semibold px-4 py-3.5 rounded-lg text-center block w-full relative"
    >
      {uploading ? 'Uploading Images...' : 'Upload Images'}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={uploading}
        onChange={(e) => onUpload?.(e.target.files)}
        className="hidden"
      />
    </label>

    {images.length > 0 ? (
      <div className="space-y-3 pt-2">
        {images.map((img, index) => (
          <div
            key={img.url ?? index}
            style={{ borderColor: colours.border, backgroundColor: `${colours.primary}66` }}
            className="rounded-xl border p-3 flex gap-3"
          >
            <div className="w-20 h-24 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: colours.border }}>
              <img src={img.url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Image {index + 1}</p>
                  <p style={{ color: colours.mutedText }} className="text-[11px]">
                    {index === 0 ? 'Primary image' : img.label ?? 'Gallery image'}
                  </p>
                </div>
                {index === 0 && (
                  <span style={{ backgroundColor: colours.accent, color: colours.background }} className="text-[10px] px-2 py-1 rounded-full">
                    Primary
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => onMove?.(index, -1)}
                  disabled={index === 0}
                  style={{ borderColor: colours.border, color: colours.text }}
                  className="text-[11px] border rounded px-2 py-1 disabled:opacity-40 cursor-pointer"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => onMove?.(index, 1)}
                  disabled={index === images.length - 1}
                  style={{ borderColor: colours.border, color: colours.text }}
                  className="text-[11px] border rounded px-2 py-1 disabled:opacity-40 cursor-pointer"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => onSetPrimary?.(index)}
                  style={{ borderColor: colours.border, color: colours.text }}
                  className="text-[11px] border rounded px-2 py-1 cursor-pointer"
                >
                  Set Primary
                </button>
                <button
                  type="button"
                  onClick={() => onRemove?.(index)}
                  className="text-[11px] border rounded px-2 py-1 cursor-pointer text-red-700 border-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div
        style={{ backgroundColor: colours.background, borderColor: colours.border }}
        className="aspect-[4/3] w-full rounded-xl border border-dashed flex flex-col items-center justify-center p-4"
      >
        <svg className="w-12 h-12 mb-3" style={{ color: colours.mutedText }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
        </svg>
        <p style={{ color: colours.accent }} className="text-xs uppercase tracking-wider font-semibold text-center">
          No Images Uploaded
        </p>
      </div>
    )}
  </FormCard>
);

// ---------------------------------------------------------------------------
// TagsCard — click-to-toggle pill tags (concern tags, categories, filters...)
// options: [{ value, label }]   selected: [value, value, ...]
// ---------------------------------------------------------------------------
export const TagsCard = ({
  title = 'Tags',
  description,
  options = [],
  selected = [],
  onToggle,
  columns = 2,
  className = '',
}) => (
  <FormCard title={title} description={description} className={className}>
    <div className={`grid grid-cols-${columns} gap-3`}>
      {options.map(({ value, label }) => {
        const isChecked = selected.includes(value);
        return (
          <button
            type="button"
            key={value}
            onClick={() => onToggle?.(value)}
            style={{
              backgroundColor: isChecked ? colours.accent : `${colours.primary}66`,
              color: isChecked ? colours.background : colours.text,
              borderColor: isChecked ? colours.accent : colours.border,
            }}
            className="px-3 py-2 text-left text-xs rounded-lg border transition-all duration-200 cursor-pointer"
          >
            {label}
          </button>
        );
      })}
    </div>
  </FormCard>
);

// ---------------------------------------------------------------------------
// ActionButtonsCard — Submit (Add/Update) + Save as Draft + Cancel, in a
// sticky sidebar card. Pass cancelHref for a <Link>, or cancelOnClick for a
// button — whichever your router setup needs.
// ---------------------------------------------------------------------------
export const ActionButtonsCard = ({
  isEditMode = false,
  saving = false,
  disabled = false,
  submitLabel,
  onSubmit,
  onSaveDraft,
  cancelHref,
  cancelOnClick,
  cancelLabel = 'Cancel',
  showDraft = true,
  LinkComponent, // pass your router's <Link> component (e.g. react-router-dom's Link)
  className = '',
}) => {
  const resolvedSubmitLabel = submitLabel ?? (saving ? 'Saving...' : isEditMode ? 'Update' : 'Publish');
  const CancelLink = LinkComponent;

  return (
    <section style={cardStyle} className={`border rounded-2xl p-6 shadow-sm space-y-3 sticky top-24 ${className}`}>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={saving || disabled}
        style={{ backgroundColor: colours.secondary, color: colours.background }}
        className="form-btn-primary w-full disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-widest font-semibold py-4 rounded-lg shadow-md border-none cursor-pointer"
      >
        {resolvedSubmitLabel}
      </button>

      {showDraft && (
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving || disabled}
          style={{ borderColor: colours.border, color: colours.text }}
          className="form-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer disabled:opacity-50"
        >
          Save as Draft
        </button>
      )}

      {cancelHref && CancelLink ? (
        <CancelLink
          to={cancelHref}
          style={{ borderColor: colours.border, color: colours.mutedText }}
          className="form-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center block no-underline"
        >
          {cancelLabel}
        </CancelLink>
      ) : (
        <button
          type="button"
          onClick={cancelOnClick}
          style={{ borderColor: colours.border, color: colours.mutedText }}
          className="form-btn-secondary w-full border transition-colors text-xs uppercase tracking-widest font-semibold py-4 rounded-lg text-center bg-transparent cursor-pointer"
        >
          {cancelLabel}
        </button>
      )}
    </section>
  );
};

/* ---------------------------------------------------------------------------
USAGE EXAMPLE (mirrors the Pricing & Inventory card from the screenshot):

import { Link } from 'react-router-dom';
import {
  FormStyles, FormCard, TextInput, StepperInput, CompoundInput,
  SelectField, ExpandableTextarea, ImageUploadCard, TagsCard, ActionButtonsCard,
} from './FormComponents';

<FormStyles />

<FormCard title="Pricing & Inventory" description="Discount supports percentage or flat rupee amount.">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <TextInput label="Price" required name="price" value={form.price} onChange={handleChange} placeholder="0" />

    <CompoundInput
      label="Discount"
      inputProps={{ name: 'discountValue', value: form.discountValue, onChange: handleChange, placeholder: '0' }}
      selectProps={{ name: 'discountType', value: form.discountType, onChange: handleChange }}
      options={[{ value: 'percentage', label: '%' }, { value: 'amount', label: '₹ Off' }]}
    />

    <StepperInput label="Stock" required name="stockQty" value={form.stockQty} onChange={handleChange} min={0} />
  </div>
</FormCard>

<ImageUploadCard
  images={uploadedImages}
  uploading={uploadingImage}
  onUpload={(files) => handleFileChange({ target: { files } })}
  onMove={moveImage}
  onSetPrimary={handleSetPrimary}
  onRemove={handleDeleteImage}
/>

<TagsCard
  title="Concern Tags"
  description="Used for filters such as dandruff, acne and glow."
  options={CONCERNS}
  selected={form.concerns}
  onToggle={handleConcernChange}
/>

<ActionButtonsCard
  isEditMode={isEditMode}
  saving={saving}
  onSaveDraft={(e) => handleSubmit(e, 'draft')}
  cancelHref="/admin/collection"
  LinkComponent={Link}
/>
--------------------------------------------------------------------------- */
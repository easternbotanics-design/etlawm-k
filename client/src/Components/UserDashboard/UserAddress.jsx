import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { colours, fonts } from "../../theme/theme";
import CustomSelect from "../CustomSelect";
import {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getPincodeDetails,
} from "../../services/addressService";

const EMPTY_FORM = {
  line1: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
  pincodeVerified: false,
};

const UserAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [localities, setLocalities] = useState([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    try {
      setLoading(true);

      const data = await getAddresses();

      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err.message || "Failed to load addresses.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    const pincode = String(formData.pincode || "").trim();

    if (pincode.length !== 6) {
      setLocalities([]);
      setPincodeError("");
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setPincodeLoading(true);
        setPincodeError("");

        const data = await getPincodeDetails(pincode);

        if (cancelled) return;

        const localityOptions = data.localities || [];

        setLocalities(localityOptions);

        setFormData((current) => {
          if (current.pincode !== pincode) return current;

          return {
            ...current,
            city: data.district || "",
            state: data.state || "",
            locality: current.locality || localityOptions[0]?.name || "",
            pincodeVerified: data.isDeliverable === true,
          };
        });

        if (!data.isDeliverable) {
          setPincodeError("This PIN code is not marked as deliverable.");
        }
      } catch (error) {
        if (cancelled) return;

        setLocalities([]);
        setPincodeError(error.message || "Invalid PIN code.");

        setFormData((current) => ({
          ...current,
          city: "",
          state: "",
          locality: "",
          pincodeVerified: false,
        }));
      } finally {
        if (!cancelled) {
          setPincodeLoading(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [formData.pincode]);

  function updateFormField(name, value) {
    if (name === "pincode") {
      const nextPincode = value.replace(/\D/g, "").slice(0, 6);

      setFormData((current) => ({
        ...current,
        pincode: nextPincode,
        city: "",
        state: "",
        locality: "",
        pincodeVerified: false,
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(EMPTY_FORM);
    setLocalities([]);
    setPincodeError("");
    setMsg({ type: "", text: "" });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { line1, city, state, pincode, pincodeVerified } = formData;

    if (!line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setMsg({
        type: "error",
        text: "All required fields must be completed.",
      });
      return;
    }

    if (pincode.length !== 6 || !pincodeVerified) {
      setMsg({
        type: "error",
        text: "Enter a valid deliverable PIN code.",
      });
      return;
    }

    try {
      setSaving(true);
      setMsg({ type: "", text: "" });

      const payload = {
        line1: [formData.line1, formData.locality].filter(Boolean).join(", "),
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        is_default: formData.is_default,
      };

      const res = await addAddress(payload);

      if (res.success) {
        resetForm();
        setShowForm(false);

        setMsg({
          type: "success",
          text: "Address added successfully.",
        });

        loadAddresses();
      }
    } catch (err) {
      console.error(err);

      setMsg({
        type: "error",
        text: err.message || "Failed to add address.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await setDefaultAddress(id);

      if (res.success) {
        loadAddresses();
      }
    } catch (err) {
      console.error(err);

      setMsg({
        type: "error",
        text: err.message || "Failed to update address.",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await deleteAddress(id);

      if (res.success) {
        setMsg({
          type: "success",
          text: "Address deleted.",
        });

        loadAddresses();
      }
    } catch (err) {
      console.error(err);

      setMsg({
        type: "error",
        text: err.message || "Failed to delete address.",
      });
    }
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-stone-800" />
        <p className="mt-2 text-xs text-stone-400">Syncing addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-medium tracking-wide text-neutral-800"
            style={{ fontFamily: fonts.primary }}
          >
            Shipping Destinations
          </h2>

          <p className="mt-1 text-xs text-stone-400">
            Manage delivery addresses for checkout flows
          </p>
        </div>

        {addresses.length > 0 && !showForm && (
          <button
            type="button"
            onClick={openForm}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-neutral-800 hover:text-white"
            style={{
              borderColor: colours.secondary,
              color: colours.secondary,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Address
          </button>
        )}
      </div>

      {msg.text && (
        <div
          className={`rounded-lg border p-3 text-xs font-semibold ${
            msg.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      {showForm && (
        <div
          className="max-w-xl animate-in slide-in-from-top-4 rounded-xl border bg-white p-6 shadow-xs duration-200"
          style={{ borderColor: colours.border }}
        >
          <h3
            className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-800"
            style={{ fontFamily: fonts.primary }}
          >
            Add New Shipping Address
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Street Address / Line 1 *
              </label>

              <input
                type="text"
                required
                placeholder="Flat, house no, building, apartment, road"
                value={formData.line1}
                onChange={(e) => updateFormField("line1", e.target.value)}
                className="w-full rounded-md border bg-neutral-50 px-3 py-2 text-xs transition-colors focus:border-stone-800 focus:outline-none"
                style={{ borderColor: colours.border }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Pincode *
                </label>

                <input
                  type="text"
                  required
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={(e) => updateFormField("pincode", e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-md border bg-neutral-50 px-3 py-2 text-xs transition-colors focus:border-stone-800 focus:outline-none"
                  style={{ borderColor: colours.border }}
                />

                {pincodeLoading && (
                  <p className="mt-1 text-[10px] text-stone-400">
                    Checking PIN code...
                  </p>
                )}

                {pincodeError && (
                  <p className="mt-1 text-[10px] text-red-700">
                    {pincodeError}
                  </p>
                )}

                {formData.pincodeVerified && !pincodeError && (
                  <p className="mt-1 text-[10px] text-emerald-700">
                    PIN code verified.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Locality
                </label>

                <CustomSelect
                  value={formData.locality}
                  onChange={(val) => updateFormField("locality", val)}
                  disabled={localities.length === 0}
                  placeholder={
                    localities.length === 0
                      ? "Enter PIN first"
                      : "Select locality"
                  }
                  options={localities.map((locality) => ({
                    value: locality.name,
                    label: locality.name,
                  }))}
                  inputClassName="w-full rounded-md border bg-neutral-50 px-3 py-2 text-xs transition-colors focus:border-stone-800 focus:outline-none"
                  optionClassName="px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  City / District *
                </label>

                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Autofilled from PIN code"
                  value={formData.city}
                  className="w-full cursor-not-allowed rounded-md border bg-neutral-100 px-3 py-2 text-xs transition-colors focus:outline-none"
                  style={{ borderColor: colours.border }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  State *
                </label>

                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Autofilled from PIN code"
                  value={formData.state}
                  className="w-full cursor-not-allowed rounded-md border bg-neutral-100 px-3 py-2 text-xs transition-colors focus:outline-none"
                  style={{ borderColor: colours.border }}
                />
              </div>
            </div>

            <label
              htmlFor="addr-default"
              className="mt-2 flex cursor-pointer select-none items-center gap-2"
            >
              <div className="relative h-4 w-4">
                <input
                  id="addr-default"
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) =>
                    updateFormField("is_default", e.target.checked)
                  }
                  className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />

                <div
                  className="flex h-4 w-4 items-center justify-center rounded-sm border bg-white transition-all peer-checked:border-stone-800 peer-checked:bg-stone-800"
                  style={{ borderColor: colours.border }}
                >
                  {formData.is_default && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>

              <span className="text-xs font-semibold text-neutral-800">
                Set as default billing and delivery address
              </span>
            </label>

            <div
              className="flex items-center gap-3 border-t pt-4"
              style={{ borderColor: colours.border }}
            >
              <button
                type="submit"
                disabled={saving || pincodeLoading}
                className="cursor-pointer rounded-md border-none px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: colours.secondary }}
              >
                {saving ? "Adding Address..." : "Save Destination"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="cursor-pointer rounded-md border bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-100"
                style={{
                  borderColor: colours.border,
                  color: colours.mutedText,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div
          onClick={openForm}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-transparent p-10 text-center transition-all hover:bg-white"
          style={{ borderColor: colours.border }}
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border text-stone-400"
            style={{ borderColor: colours.border }}
          >
            <Plus className="h-5 w-5" />
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            No destinations saved
          </h3>

          <p className="mt-1 max-w-sm text-xs text-stone-400">
            Click here to add your first delivery address.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
              style={{
                borderColor: addr.is_default ? colours.accent : colours.border,
              }}
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Destination
                  </span>

                  {addr.is_default ? (
                    <span
                      className="rounded-full border bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800"
                      style={{ borderColor: "#a7e0a4" }}
                    >
                      Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-bold uppercase tracking-wider text-stone-400 underline hover:text-neutral-700"
                    >
                      Make default
                    </button>
                  )}
                </div>

                <p className="mb-1 text-xs font-semibold leading-normal text-neutral-800">
                  {addr.line1}
                </p>

                <p className="text-xs leading-normal text-neutral-500">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>

              <div
                className="mt-6 flex justify-end border-t pt-3"
                style={{ borderTopColor: colours.border }}
              >
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="flex cursor-pointer items-center gap-1 border-none bg-transparent text-[11px] font-semibold text-stone-400 transition-colors hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAddress;
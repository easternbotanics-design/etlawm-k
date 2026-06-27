import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAddresses,
  getPincodeDetails,
} from "../../services/addressService";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Home,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { colours, fonts } from "../../theme/theme";
import CustomSelect from "../CustomSelect";

function AddressAndDetails({
  addressDetails,
  setAddressDetails,
  isComplete,
  onBack,
  onContinue,
}) {
  const { user } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [localities, setLocalities] = useState([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const lastCheckedPincodeRef = useRef("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSavedDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function loadSavedAddresses() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await getAddresses();

        if (res?.success) {
          const addresses = res.addresses || [];
          setSavedAddresses(addresses);

          const defaultAddress = addresses.find(
            (address) => address.is_default,
          );

          if (defaultAddress) {
            selectAddress(defaultAddress);
          }
        }
      } catch (err) {
        console.error("Failed to load saved addresses in cart:", err);
      }
    }

    loadSavedAddresses();
  }, []);

  useEffect(() => {
    const pincode = String(addressDetails.pincode || "").trim();

    if (pincode.length !== 6) {
      lastCheckedPincodeRef.current = "";
      setLocalities([]);
      setPincodeError("");
      setPincodeLoading(false);
      return;
    }

    if (lastCheckedPincodeRef.current === pincode) {
      return;
    }

    lastCheckedPincodeRef.current = pincode;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setPincodeLoading(true);
        setPincodeError("");

        const data = await getPincodeDetails(pincode);

        if (cancelled) return;

        const localityOptions = data.localities || [];

        setLocalities(localityOptions);

        if (!data.isDeliverable) {
          setPincodeError("This PIN code is not marked as deliverable.");

          setAddressDetails((current) => {
            if (String(current.pincode || "").trim() !== pincode) {
              return current;
            }

            return {
              ...current,
              city: data.district || "",
              state: data.state || "",
              locality: localityOptions[0]?.name || "",
              pincodeVerified: false,
            };
          });

          return;
        }

        setAddressDetails((current) => {
          if (String(current.pincode || "").trim() !== pincode) {
            return current;
          }

          return {
            ...current,
            city: data.district || "",
            state: data.state || "",
            locality: current.locality || localityOptions[0]?.name || "",
            pincodeVerified: true,
          };
        });
      } catch (error) {
        if (cancelled) return;

        setLocalities([]);
        setPincodeError(error.message || "Invalid PIN code.");

        setAddressDetails((current) => {
          if (String(current.pincode || "").trim() !== pincode) {
            return current;
          }

          return {
            ...current,
            city: "",
            state: "",
            locality: "",
            pincodeVerified: false,
          };
        });
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
  }, [addressDetails.pincode, setAddressDetails]);

  function selectAddress(address) {
    setSelectedAddressId(address.id);
    setPincodeError("");
    setLocalities([]);
    setPincodeLoading(false);

    setAddressDetails((current) => ({
      ...current,
      addressLine: address.line1 || "",
      city: "",
      state: "",
      pincode: "",
      locality: "",
      pincodeVerified: false,
      fullName:
        current.fullName ||
        (user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
          : ""),
      phoneNumber:
        current.phoneNumber || (user ? user.phone_number || "" : ""),
    }));
  }

  function updateField(name, value) {
    setSelectedAddressId("");

    if (name === "pincode") {
      const nextPincode = value.replace(/\D/g, "").slice(0, 6);

      lastCheckedPincodeRef.current = "";

      setAddressDetails((current) => ({
        ...current,
        pincode: nextPincode,
        city: "",
        state: "",
        locality: "",
        pincodeVerified: false,
      }));

      setLocalities([]);
      setPincodeError("");
      setPincodeLoading(false);

      return;
    }

    setAddressDetails((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!isComplete) return;

    onContinue();
  }

  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            Address and details
          </h2>

          <p
            className="mt-1 text-sm opacity-55"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            Add the delivery address for the selected cart items.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold opacity-60 transition-opacity hover:opacity-100"
          style={{
            color: colours.text,
            fontFamily: fonts.secondary,
          }}
        >
          <ArrowLeft size={16} />
          Back to cart
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-5 sm:p-6"
        style={{
          borderColor: colours.border,
          backgroundColor: colours.background,
        }}
      >
        {savedAddresses.length > 0 && (
          <div ref={dropdownRef} className="relative mb-6">
            <button
              type="button"
              onClick={() => setShowSavedDropdown(!showSavedDropdown)}
              className="flex items-center gap-1.5 text-sm font-semibold outline-none cursor-pointer"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              <span>Select from saved addresses</span>
              {showSavedDropdown ? (
                <ChevronUp size={16} className="opacity-60" />
              ) : (
                <ChevronDown size={16} className="opacity-60" />
              )}
            </button>

            {showSavedDropdown && (
              <div
                className="absolute left-0 z-50 mt-2 w-full max-w-md rounded-xl border bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                style={{
                  borderColor: colours.border,
                  fontFamily: fonts.secondary,
                }}
              >
                {savedAddresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => {
                      selectAddress(address);
                      setShowSavedDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-50 flex flex-col gap-0.5 border-b last:border-b-0 cursor-pointer"
                    style={{
                      borderColor: colours.border,
                      color: colours.text,
                    }}
                  >
                    <span className="font-semibold text-[10px] uppercase tracking-wider opacity-50">
                      {address.is_default ? "Default Address" : "Saved Address"}
                    </span>
                    <span className="font-medium text-neutral-800">
                      {address.line1}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {address.city}, {address.state} - {address.pincode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<User size={16} />}
            label="Full name"
            name="fullName"
            value={addressDetails.fullName}
            placeholder="Enter full name"
            onChange={updateField}
            required
          />

          <InputField
            icon={<Phone size={16} />}
            label="Phone number"
            name="phoneNumber"
            value={addressDetails.phoneNumber}
            placeholder="Enter phone number"
            onChange={updateField}
            required
          />

          <div>
            <InputField
              icon={<MapPin size={16} />}
              label="PIN code"
              name="pincode"
              value={addressDetails.pincode}
              placeholder="Enter 6-digit PIN code"
              onChange={updateField}
              inputMode="numeric"
              required
            />

            {pincodeLoading && (
              <p
                className="mt-2 text-xs"
                style={{
                  color: colours.mutedText,
                  fontFamily: fonts.secondary,
                }}
              >
                Checking PIN code...
              </p>
            )}

            {pincodeError && (
              <p
                className="mt-2 text-xs"
                style={{
                  color: "#b91c1c",
                  fontFamily: fonts.secondary,
                }}
              >
                {pincodeError}
              </p>
            )}

            {addressDetails.pincodeVerified && !pincodeError && (
              <p
                className="mt-2 text-xs"
                style={{
                  color: "#047857",
                  fontFamily: fonts.secondary,
                }}
              >
                PIN code verified.
              </p>
            )}
          </div>

          <InputField
            icon={<Home size={16} />}
            label="House / flat / building"
            name="addressLine"
            value={addressDetails.addressLine}
            placeholder="House no, building, street"
            onChange={updateField}
            required
          />

          <label className="block">
            <span
              className="mb-2 block text-sm font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              Locality
            </span>

            <CustomSelect
              value={addressDetails.locality || ""}
              onChange={(value) => updateField("locality", value)}
              disabled={localities.length === 0}
              placeholder={
                localities.length === 0
                  ? "Enter PIN code first"
                  : "Select locality"
              }
              options={localities.map((locality) => ({
                value: locality.name,
                label: locality.name,
              }))}
            />
          </label>

          <InputField
            label="City / district"
            name="city"
            value={addressDetails.city}
            placeholder="Autofilled from PIN code"
            onChange={updateField}
            readOnly
            required
          />

          <InputField
            label="State"
            name="state"
            value={addressDetails.state}
            placeholder="Autofilled from PIN code"
            onChange={updateField}
            readOnly
            required
          />

          <InputField
            label="Landmark"
            name="landmark"
            value={addressDetails.landmark}
            placeholder="Nearby landmark"
            onChange={updateField}
          />

          <label className="block">
            <span
              className="mb-2 block text-sm font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              Delivery type
            </span>

            <CustomSelect
              value={addressDetails.deliveryType}
              onChange={(value) => updateField("deliveryType", value)}
              options={[
                { value: "standard", label: "Standard delivery" },
                { value: "express", label: "Express delivery" },
              ]}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span
            className="mb-2 block text-sm font-semibold"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            Order notes
          </span>

          <textarea
            value={addressDetails.orderNotes}
            onChange={(event) => updateField("orderNotes", event.target.value)}
            rows={4}
            placeholder="Any delivery instructions"
            className="w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
            style={{
              borderColor: colours.border,
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          />
        </label>
      </form>
    </section>
  );
}

function InputField({
  icon,
  label,
  name,
  value,
  placeholder,
  onChange,
  required = false,
  inputMode,
  readOnly = false,
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-sm font-semibold"
        style={{
          color: colours.text,
          fontFamily: fonts.secondary,
        }}
      >
        {label}
        {required ? " *" : ""}
      </span>

      <div
        className="flex h-12 items-center gap-3 rounded-xl border px-4"
        style={{
          borderColor: colours.border,
          backgroundColor: readOnly ? "rgba(0,0,0,0.03)" : "transparent",
        }}
      >
        {icon && <span className="opacity-45">{icon}</span>}

        <input
          value={value || ""}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          readOnly={readOnly}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none read-only:cursor-not-allowed"
          style={{
            color: colours.text,
            fontFamily: fonts.secondary,
          }}
        />
      </div>
    </label>
  );
}

export default AddressAndDetails;
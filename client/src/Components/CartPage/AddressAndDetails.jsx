import { useState, useEffect, useRef, useMemo } from "react";
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

const API = import.meta.env.VITE_SERVER_API;

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

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const digitRefs = useRef([]);

  const isPhoneVerified = useMemo(() => {
    if (!user) return false;
    const sanitizePhone = (ph) => String(ph || "").replace(/\D/g, "");
    const currentPhone = sanitizePhone(addressDetails.phoneNumber);
    const userPhone = sanitizePhone(user.phone_number);
    return currentPhone === userPhone || !!addressDetails.phoneVerified;
  }, [addressDetails.phoneNumber, addressDetails.phoneVerified, user]);

  const sanitizePhone = (ph) => String(ph || "").replace(/\D/g, "");
  const currentPhone = sanitizePhone(addressDetails.phoneNumber);
  const userPhone = user ? sanitizePhone(user.phone_number) : "";
  const needsVerification = user && currentPhone !== userPhone && !addressDetails.phoneVerified;

  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const timer = setTimeout(() => setOtpResendTimer((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpResendTimer]);

  async function handleSendPhoneOtp() {
    const rawPhone = String(addressDetails.phoneNumber || "").replace(/\D/g, "");
    if (rawPhone.length < 10) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSendingOtp(true);
      setPhoneError("");
      setOtpError("");

      const response = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: rawPhone,
          country_code: "+91",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setShowOtpModal(true);
      setOtpResendTimer(60);
      setOtpDigits(Array(6).fill(""));
    } catch (err) {
      setPhoneError(err.message);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyPhoneOtp(event) {
    if (event) event.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits of the OTP.");
      return;
    }

    const rawPhone = String(addressDetails.phoneNumber || "").replace(/\D/g, "");

    try {
      setVerifyingOtp(true);
      setOtpError("");

      const response = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: rawPhone,
          country_code: "+91",
          otp,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }

      setAddressDetails((current) => ({
        ...current,
        phoneVerified: true,
      }));
      setShowOtpModal(false);
      setPhoneError("");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  }

  const handleDigitChange = (idx, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = char;
    setOtpDigits(next);

    if (char && idx < 5) {
      digitRefs.current[idx + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (idx, event) => {
    if (event.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    event.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });

    setOtpDigits(next);
    setTimeout(() => {
      digitRefs.current[Math.min(pasted.length, 5)]?.focus();
    }, 50);
  };

  const verifySuffix = needsVerification ? (
    <button
      type="button"
      onClick={handleSendPhoneOtp}
      disabled={sendingOtp || currentPhone.length < 10}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: colours.accent,
        color: colours.background,
        fontFamily: fonts.secondary,
      }}
    >
      {sendingOtp ? "Sending..." : "Verify"}
    </button>
  ) : null;

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

    if (name === "phoneNumber") {
      setAddressDetails((current) => ({
        ...current,
        phoneNumber: value,
        phoneVerified: false,
      }));
      setPhoneError("");
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

          <div>
            <InputField
              icon={<Phone size={16} />}
              label="Phone number"
              name="phoneNumber"
              value={addressDetails.phoneNumber}
              placeholder="Enter phone number"
              onChange={updateField}
              required
              suffix={verifySuffix}
            />

            {phoneError && (
              <p
                className="mt-2 text-xs"
                style={{
                  color: "#b91c1c",
                  fontFamily: fonts.secondary,
                }}
              >
                {phoneError}
              </p>
            )}

            {isPhoneVerified && addressDetails.phoneNumber && (
              <p
                className="mt-2 text-xs font-semibold"
                style={{
                  color: "#047857",
                  fontFamily: fonts.secondary,
                }}
              >
                Phone number verified.
              </p>
            )}
          </div>

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

      {showOtpModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            style={{
              backgroundColor: colours.background,
              borderColor: colours.border,
              fontFamily: fonts.secondary,
              color: colours.text,
            }}
            className="w-full max-w-md rounded-2xl border p-8 shadow-2xl transition-all duration-300 transform scale-100 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95"
          >
            {/* Decorative background gradients */}
            <div
              className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-30 blur-xl"
              style={{ background: colours.accent }}
            />
            <div
              className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full opacity-30 blur-xl"
              style={{ background: colours.hover }}
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 transition-colors bg-transparent border-none text-2xl p-0 cursor-pointer leading-none"
            >
              &times;
            </button>

            {/* Phone Verification Icon */}
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${colours.accent}15`,
                color: colours.accent,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>

            {/* Title */}
            <h3
              style={{ fontFamily: fonts.primary }}
              className="mb-2 text-2xl font-normal tracking-wide"
            >
              Verify Delivery Number
            </h3>

            {/* Description */}
            <p
              className="mb-6 text-sm opacity-70 leading-relaxed max-w-[320px]"
              style={{ color: colours.mutedText }}
            >
              We have sent a 6-digit OTP code to the number **+{user?.country_code || "91"} {addressDetails.phoneNumber}**.
            </p>

            {/* OTP inputs */}
            <form onSubmit={handleVerifyPhoneOtp} className="w-full flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        digitRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      className="h-12 w-11 rounded-xl border text-center text-[24px] font-semibold outline-none transition-all duration-200"
                      style={{
                        fontFamily: fonts.primary,
                        background: colours.background,
                        borderColor: colours.border,
                        color: colours.text,
                      }}
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <p
                  className="text-xs text-center"
                  style={{
                    color: "#b91c1c",
                    fontFamily: fonts.secondary,
                  }}
                >
                  {otpError}
                </p>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full cursor-pointer rounded-xl border py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{
                  background: colours.secondary,
                  borderColor: colours.secondary,
                  color: colours.background,
                }}
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend Logic */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpDigits(Array(6).fill(""));
                    setOtpError("");
                  }}
                  className="underline underline-offset-4 bg-transparent border-none cursor-pointer"
                  style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                >
                  Cancel
                </button>

                {otpResendTimer > 0 ? (
                  <span style={{ color: colours.mutedText }}>Resend in {otpResendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    className="font-bold underline underline-offset-4 bg-transparent border-none cursor-pointer"
                    style={{ color: colours.accent }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
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
  suffix,
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

        {suffix && <div className="flex items-center">{suffix}</div>}
      </div>
    </label>
  );
}

export default AddressAndDetails;
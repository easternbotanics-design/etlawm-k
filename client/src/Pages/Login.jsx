import { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colours, fonts } from '../theme/theme.js';
import CustomSelect from '../Components/CustomSelect';

const API = import.meta.env.VITE_SERVER_API;

const INPUT_CLASS =
  'w-full rounded-xl border px-4 py-3 pl-11 text-[13px] outline-none transition-all duration-200 placeholder:font-light';
const LABEL_CLASS =
  'text-[10px] font-bold uppercase tracking-[1.5px]';

function IconPhone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function LoginInput({ id, name, type = 'text', placeholder, value, onChange, required, maxLength, autoComplete, icon }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative flex items-center">
      <span
        className="pointer-events-none absolute left-4 flex items-center"
        style={{ color: focused ? colours.accent : colours.mutedText }}
      >
        {icon}
      </span>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={INPUT_CLASS}
        style={{
          fontFamily: fonts.secondary,
          background: colours.background,
          borderColor: focused ? colours.accent : colours.border,
          color: colours.text,
          boxShadow: focused ? `0 0 0 3px ${colours.hover}40` : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function PrimaryButton({ children, disabled, type = 'submit', onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="mt-1 rounded-xl border px-5 py-3 text-[11px] font-bold uppercase tracking-[1.8px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        fontFamily: fonts.secondary,
        background: hovered ? colours.secondary : colours.accent,
        borderColor: hovered ? colours.secondary : colours.accent,
        color: colours.background,
      }}
    >
      {children}
    </button>
  );
}

function StatusBanner({ msg, type }) {
  if (!msg) return null;

  const success = type === 'success';

  return (
    <p
      className="rounded-xl border px-3 py-2 text-[12px] leading-relaxed"
      style={{
        fontFamily: fonts.secondary,
        color: success ? '#4a8060' : '#a94d4d',
        background: success ? 'rgba(74,128,96,0.08)' : 'rgba(169,77,77,0.07)',
        borderColor: success ? 'rgba(74,128,96,0.2)' : 'rgba(169,77,77,0.18)',
      }}
    >
      {msg}
    </p>
  );
}

function OtpBox({ idx, value, onChange, onKeyDown, inputRef }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      ref={inputRef}
      id={`otp-digit-${idx}`}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(event) => onChange(idx, event.target.value)}
      onKeyDown={(event) => onKeyDown(idx, event)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      autoComplete="one-time-code"
      className="h-12 w-11 rounded-xl border text-center text-[24px] font-semibold outline-none transition-all duration-200"
      style={{
        fontFamily: fonts.primary,
        background: colours.background,
        borderColor: focused ? colours.accent : colours.border,
        color: colours.text,
        boxShadow: focused ? `0 0 0 3px ${colours.hover}40` : 'none',
      }}
    />
  );
}

function GoogleButton({ onClick, loading }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-[12px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        fontFamily: fonts.secondary,
        color: colours.text,
        background: hovered ? colours.primary : colours.background,
        borderColor: hovered ? colours.accent : colours.border,
        boxShadow: hovered ? `0 8px 24px ${colours.hover}33` : 'none',
      }}
    >
      <IconGoogle />
      {loading ? 'Loading Google profile…' : 'Continue with Google'}
    </button>
  );
}

function StepDots({ step }) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="block h-2 rounded-full transition-all duration-300"
          style={{
            width: item === step ? '22px' : '8px',
            background: item === step ? colours.accent : colours.border,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, token, user, loading: authLoading, isAdmin } = useAuth();

  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [digits, setDigits] = useState(Array(4).fill(''));
  const [name, setName] = useState({ first: '', last: '' });
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resend, setResend] = useState(0);
  const [pendingToken, setPendingToken] = useState(null);
  const [googleProfile, setGoogleProfile] = useState(null);

  const digitRefs = useRef([]);

  const alertShownRef = useRef(false);
  
  useEffect(() => {
    if (alertShownRef.current) return;
  
    if (!authLoading && !token && !user) {
      alertShownRef.current = true;
      alert("Work in progress, you won't be able to log in");
    }
  }, [authLoading, token, user]);

  useEffect(() => {
    if (!authLoading && token && user) {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [authLoading, token, user, isAdmin, navigate]);

  useEffect(() => {
    if (resend <= 0) return undefined;
    const timer = setTimeout(() => setResend((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resend]);

  const clearStatus = () => setStatus({ msg: '', type: '' });
  const showError = (msg) => setStatus({ msg, type: 'error' });
  const showSuccess = (msg) => setStatus({ msg, type: 'success' });

  const handleSendOtp = async (event) => {
    event?.preventDefault();
    clearStatus();

    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 7) {
      showError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: rawPhone,
          country_code: countryCode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        showError(data.message || 'Could not send OTP.');
        return;
      }

      setStep(1);
      setResend(60);
      showSuccess('OTP sent. Check your WhatsApp messages.');
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    } catch {
      showError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (idx, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);

    if (char && idx < 3) {
      digitRefs.current[idx + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (idx, event) => {
    if (event.key === 'Backspace' && !digits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 4);

    if (!pasted) return;

    event.preventDefault();
    const next = Array(4).fill('');
    pasted.split('').forEach((char, index) => {
      next[index] = char;
    });

    setDigits(next);
    setTimeout(() => {
      digitRefs.current[Math.min(pasted.length, 3)]?.focus();
    }, 50);
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    clearStatus();

    const otp = digits.join('');
    if (otp.length !== 4) {
      showError('Please enter all four OTP digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phone.replace(/\D/g, ''),
          country_code: countryCode,
          otp,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        showError(data.message || 'OTP verification failed.');
        return;
      }

      if (data.isNewUser || !data.user?.first_name) {
        setPendingToken(data.token);
        setName({
          first: data.user?.first_name || '',
          last: data.user?.last_name || '',
        });
        clearStatus();
        setStep(2);
        return;
      }

      login(data.token, data.user);
      navigate(data.user.is_admin ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch {
      showError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async ({ access_token: accessToken }) => {
      setGoogleLoading(true);
      clearStatus();

      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Google profile request failed.');
        }

        const profile = await response.json();
        const fullName = String(profile.name || '').trim().split(/\s+/).filter(Boolean);
        const first = profile.given_name || fullName[0] || '';
        const last = profile.family_name || fullName.slice(1).join(' ') || '';

        setName({ first, last });
        setGoogleProfile({
          accessToken,
          sub: profile.sub,
          email: profile.email,
          picture: profile.picture,
        });
        showSuccess('Name fields filled from your Google account.');
      } catch {
        showError('Could not load your Google profile.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      showError('Google sign-in was cancelled or failed.');
    },
  });

  const handleOnboard = async (event) => {
    event.preventDefault();
    clearStatus();

    if (!name.first.trim()) {
      showError('First name is required.');
      return;
    }

    if (!pendingToken) {
      showError('Your verification session has expired. Please verify your number again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({
          first_name: name.first.trim(),
          last_name: name.last.trim() || undefined,
          google_email: googleProfile?.email || undefined,
          google_sub: googleProfile?.sub || undefined,
          profile_picture: googleProfile?.picture || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        showError(data.message || 'Could not complete your profile.');
        return;
      }

      login(data.token, data.user);
      navigate(data.user.is_admin ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch {
      showError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (token && user)) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: colours.primary, fontFamily: fonts.secondary }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[2px]"
          style={{ color: colours.mutedText }}
        >
          Loading session…
        </p>
      </div>
    );
  }

  const headings = ['Welcome', 'Verify your number', 'Complete your profile'];
  const subtitles = [
    'Enter your mobile number to continue.',
    `Enter the four-digit code sent to ${countryCode} ${phone}.`,
    'Add your name manually or use Google to fill it automatically.',
  ];

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: colours.primary, fontFamily: fonts.secondary }}
    >
      <section
        className="flex min-h-[580px] w-full max-w-[900px] overflow-hidden rounded-[24px] border shadow-[0_28px_80px_rgba(43,27,14,0.14)] max-md:max-w-[520px]"
        style={{
          background: colours.background,
          borderColor: colours.border,
        }}
      >
        <aside
          className="relative hidden w-[40%] flex-col justify-between overflow-hidden p-10 md:flex"
          style={{ background: colours.surface }}
        >
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: `${colours.hover}70` }}
          />
          <div
            className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full"
            style={{ background: `${colours.primary}B8` }}
          />

          <div className="relative z-10">
            <p
              className="text-[12px] font-bold uppercase tracking-[5px]"
              style={{ color: colours.secondary, fontFamily: fonts.logo }}
            >
              ETLAWM
            </p>
          </div>

          <div className="relative z-10">
            <p
              className="mb-5 max-w-[260px] text-[32px] font-normal leading-[1.18]"
              style={{ color: colours.text, fontFamily: fonts.primary }}
            >
              A quieter way to begin your daily ritual.
            </p>
            <p
              className="mb-7 max-w-[250px] text-[12px] leading-[1.8]"
              style={{ color: colours.mutedText }}
            >
              bleh
            </p>
            <StepDots step={step} />
          </div>
        </aside>

        <div className="flex flex-1 flex-col justify-center px-7 py-10 sm:px-12 md:px-14">
          <div className="mb-8 md:hidden">
            <p
              className="text-[11px] font-bold uppercase tracking-[4px]"
              style={{ color: colours.secondary, fontFamily: fonts.logo }}
            >
              ETLAWM
            </p>
          </div>

          <div className="mb-8">
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-[2px]"
              style={{ color: colours.accent }}
            >
              Step {step + 1} of 3
            </p>
            <h1
              className="mb-2 text-[34px] font-semibold leading-tight sm:text-[40px]"
              style={{ color: colours.text, fontFamily: fonts.primary }}
            >
              {headings[step]}
            </h1>
            <p
              className="max-w-[430px] text-[12px] leading-[1.7]"
              style={{ color: colours.mutedText }}
            >
              {subtitles[step]}
            </p>
          </div>

          {step === 0 && (
            <form className="flex flex-col gap-4" onSubmit={handleSendOtp} noValidate>
              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS} style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
                  Mobile number
                </label>

                <div className="flex gap-2">
                  <CustomSelect
                    value={countryCode}
                    onChange={(val) => setCountryCode(val)}
                    options={[
                      { value: "+91", label: "IN +91" },
                      { value: "+1", label: "US +1" },
                      { value: "+44", label: "UK +44" },
                      { value: "+971", label: "AE +971" },
                      { value: "+65", label: "SG +65" },
                      { value: "+61", label: "AU +61" },
                    ]}
                    inputClassName="min-w-[100px] rounded-xl border px-3 py-3 text-[13px] outline-none transition-colors duration-200 cursor-pointer"
                    optionClassName="px-3 py-2 text-[13px]"
                  />

                  <div className="flex-1">
                    <LoginInput
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      maxLength={12}
                      autoComplete="tel"
                      icon={<IconPhone />}
                    />
                  </div>
                </div>
              </div>

              <StatusBanner {...status} />

              <PrimaryButton disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </PrimaryButton>
            </form>
          )}

          {step === 1 && (
            <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp} noValidate>
              <div className="flex flex-col gap-2">
                <label className={LABEL_CLASS} style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
                  Enter OTP
                </label>

                <div className="flex flex-wrap gap-2" onPaste={handleOtpPaste}>
                  {digits.map((digit, index) => (
                    <OtpBox
                      key={index}
                      idx={index}
                      value={digit}
                      onChange={handleDigitChange}
                      onKeyDown={handleDigitKeyDown}
                      inputRef={(element) => {
                        digitRefs.current[index] = element;
                      }}
                    />
                  ))}
                </div>
              </div>

              <StatusBanner {...status} />

              <PrimaryButton disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </PrimaryButton>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setDigits(Array(4).fill(''));
                    clearStatus();
                  }}
                  className="underline underline-offset-4"
                  style={{ color: colours.mutedText, fontFamily: fonts.secondary }}
                >
                  Change number
                </button>

                {resend > 0 ? (
                  <span style={{ color: colours.mutedText }}>Resend in {resend}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="font-bold underline underline-offset-4"
                    style={{ color: colours.accent }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="flex flex-col gap-4" onSubmit={handleOnboard} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="first_name" className={LABEL_CLASS} style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
                    First name
                  </label>
                  <LoginInput
                    id="first_name"
                    name="first_name"
                    placeholder="Your first name"
                    value={name.first}
                    onChange={(event) => setName((current) => ({ ...current, first: event.target.value }))}
                    required
                    autoComplete="given-name"
                    icon={<IconUser />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="last_name" className={LABEL_CLASS} style={{ color: colours.mutedText, fontFamily: fonts.secondary }}>
                    Last name
                  </label>
                  <LoginInput
                    id="last_name"
                    name="last_name"
                    placeholder="Your last name"
                    value={name.last}
                    onChange={(event) => setName((current) => ({ ...current, last: event.target.value }))}
                    autoComplete="family-name"
                    icon={<IconUser />}
                  />
                </div>
              </div>

              <div className="my-1 flex items-center gap-3">
                <span className="h-px flex-1" style={{ background: colours.border }} />
                <span
                  className="text-[9px] font-bold uppercase tracking-[1.4px]"
                  style={{ color: colours.mutedText }}
                >
                  or autofill with
                </span>
                <span className="h-px flex-1" style={{ background: colours.border }} />
              </div>

              <GoogleButton onClick={() => googleLogin()} loading={googleLoading} />

              <StatusBanner {...status} />

              <PrimaryButton disabled={loading || googleLoading}>
                {loading ? 'Saving profile…' : 'Continue to dashboard'}
              </PrimaryButton>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

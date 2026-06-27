// services/otpService.js
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendOtpMessage } from './whatsappService.js';

const normalizeIndianPhone = (phone_number, country_code = "+91") => {
  const digits = String(phone_number || "").replace(/\D/g, "");
  const ccDigits = String(country_code || "+91").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  if (digits.length === 10) {
    return `${ccDigits}${digits}`;
  }

  return `${ccDigits}${digits.replace(/^0+/, "")}`;
};

const getLocalIndianPhone = (e164phone) => {
  const digits = String(e164phone || "").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
};

const isValidIndianPhone = (e164phone) => {
  const localPhone = getLocalIndianPhone(e164phone);
  return /^[6-9]\d{9}$/.test(localPhone);
};

const sendOtp = async (phone_number, country_code = "+91") => {
  const e164phone = normalizeIndianPhone(phone_number, country_code);

  if (!isValidIndianPhone(e164phone)) {
    throw new Error("Invalid phone number format.");
  }

  const localPhone = getLocalIndianPhone(e164phone);
  
  // Generate 4-digit OTP
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

  console.log(`🔑 [OTP] Generated OTP for ${e164phone}: ${otpCode}`);

  // Send via WhatsApp
  try {
    await sendOtpMessage(e164phone, otpCode);
  } catch (err) {
    console.error(`❌ [OTP] Failed to send WhatsApp message to ${e164phone}:`, err.message || err);
  }

  // Hash OTP code
  const otp_hash = await bcrypt.hash(otpCode, 10);
  const session_id = crypto.randomBytes(16).toString('hex');

  return {
    e164phone,
    localPhone,
    session_id,
    otp_hash,
    otp: otpCode,
  };
};

const verifyOtp = async (otpRecord, otp) => {
  const cleanOtp = String(otp || "").replace(/\D/g, "");

  if (!otpRecord) {
    throw new Error("OTP session is missing.");
  }

  if (!otpRecord.otp_hash) {
    throw new Error("No secure OTP hash available for verification.");
  }

  if (!/^\d{4}$/.test(cleanOtp)) {
    throw new Error("Invalid OTP format.");
  }

  const isMatch = await bcrypt.compare(cleanOtp, otpRecord.otp_hash);

  if (!isMatch) {
    throw new Error("Incorrect OTP.");
  }

  return {
    success: true,
  };
};

export default {
  normalizeIndianPhone,
  getLocalIndianPhone,
  isValidIndianPhone,
  sendOtp,
  verifyOtp,
};

// services/otpService.js
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import axios from 'axios';

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
  
  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`🔑 [OTP] Generated OTP for ${e164phone}: ${otpCode}`);

  // Send via Fast2SMS
  try {
    const fast2smsData = {
      otp_id: process.env.FAST2SMS_OTP_ID,
      mobile: localPhone,
      otp_expiry: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
      otp_length: 6,
      otp: otpCode
    };

    const response = await axios({
      url: 'https://www.fast2sms.com/dev/otp/send',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': process.env.FAST2SMS_API_KEY,
        'content-type': 'application/json'
      },
      data: JSON.stringify(fast2smsData)
    });

    console.log(`[OTP] Fast2SMS response:`, response.data);

    if (!response.data || response.data.return !== true) {
      throw new Error(response.data?.message || "Fast2SMS returned failure status.");
    }
  } catch (error) {
    console.error(`❌ [OTP] Failed to send Fast2SMS SMS:`, error.response?.data || error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ [OTP] [DEVELOPMENT FALLBACK] Proceeding despite Fast2SMS failure. Your OTP code is: ${otpCode}`);
    } else {
      throw error;
    }
  }

  // Hash OTP code
  const otp_hash = await bcrypt.hash(otpCode, 10);
  const session_id = crypto.randomBytes(16).toString('hex');

  return {
    e164phone,
    localPhone,
    session_id,
    otp_hash,
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

  if (!/^\d{6}$/.test(cleanOtp)) {
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
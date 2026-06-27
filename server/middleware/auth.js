"use strict";

import "dotenv/config";
import jwt from "jsonwebtoken";

const EXPIRY = process.env.JWT_EXPIRY || "7d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
}

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRY });
}

function requireAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    req.user = jwt.verify(token, getSecret());
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid authentication token.",
    });
  }
}

function optionalAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, getSecret());
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid authentication token.",
    });
  }
}

function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    const decoded = jwt.verify(token, getSecret());
    if (!decoded.is_admin) {
      return res.status(403).json({ success: false, message: "Access denied. Administrators only." });
    }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid authentication token.",
    });
  }
}

export { signToken, requireAuth, requireAdmin, optionalAuth };
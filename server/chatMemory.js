const memory = new Map();
const humanSupportSessions = new Set();
const lastResponseTime = new Map();
const processedMessageIds = new Set();

export function getHistory(phone) {
  return memory.get(phone) || [];
}

export const saveMessage = (phone, role, text) => {
  const history = memory.get(phone) || [];

  history.push({ role, text, time: Date.now() });

  const lastMessages = history.slice(-8); // keeps last 8 messages
  memory.set(phone, lastMessages);
}

export const setHumanEscalated = (phone, escalated) => {
  if (escalated) {
    humanSupportSessions.add(phone);
  } else {
    humanSupportSessions.delete(phone);
  }
}

export const isHumanEscalated = (phone) => {
  return humanSupportSessions.has(phone);
}

export const checkRateLimit = (phone) => {
  const now = Date.now();
  const last = lastResponseTime.get(phone) || 0;
  if (now - last < 2000) { // 2 seconds threshold between automatic replies
    return false; // rate limited
  }
  lastResponseTime.set(phone, now);
  return true;
}

export const isDuplicateMessage = (messageId) => {
  if (!messageId) return false;
  if (processedMessageIds.has(messageId)) {
    return true;
  }
  processedMessageIds.add(messageId);
  // Keep the set size manageable (e.g., last 1000 messages)
  if (processedMessageIds.size > 1000) {
    const firstValue = processedMessageIds.values().next().value;
    processedMessageIds.delete(firstValue);
  }
  return false;
}
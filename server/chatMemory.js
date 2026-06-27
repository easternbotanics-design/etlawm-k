const memory = new Map();

export function getHistory(phone) {
  return memory.get(phone) || [];
}

export const saveMessage = (phone, role, text) => {
  const history = memory.get(phone) || [];

  history.push({ role, text, time: Date.now() });

  const lastMessages = history.slice(-8); // keeps last 8 messages
  memory.set(phone, lastMessages);
}
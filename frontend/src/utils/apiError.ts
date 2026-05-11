import axios from "axios";

type UnknownRecord = Record<string, unknown>;

const joinMessages = (value: unknown): string | null => {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || null;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return messages.length ? messages.join(", ") : null;
  }

  if (value && typeof value === "object") {
    const objectValues = Object.values(value as UnknownRecord);
    const nested = objectValues
      .map((item) => joinMessages(item))
      .filter((item): item is string => Boolean(item));
    return nested.length ? nested.join(", ") : null;
  }

  return null;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Network error. Check your internet connection.";
    }

    const data = error.response.data;
    if (typeof data === "string") {
      return data;
    }

    const message =
      joinMessages((data as UnknownRecord)?.error) ||
      joinMessages((data as UnknownRecord)?.detail) ||
      joinMessages((data as UnknownRecord)?.message) ||
      joinMessages(data);

    return message || fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

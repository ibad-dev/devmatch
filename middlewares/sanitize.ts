// lib/security/sanitize.ts
type Sanitizable =
  | string
  | number
  | boolean
  | object
  | null
  | undefined
  | unknown[];

const BANNED_KEYS = ["__proto__", "constructor", "prototype"];
const BANNED_PATTERN = /^\$|\.|\$where|\$regex/i;

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

function isValidKey(key: string): boolean {
  return !BANNED_KEYS.includes(key) && !BANNED_PATTERN.test(key);
}

export function deepSanitize<T extends Sanitizable>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => deepSanitize(item)) as T;
  }

  if (!isPlainObject(input)) {
    return input;
  }

  const cleanObject: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!isValidKey(key)) {
      continue;
    }

    if (isPlainObject(value) || Array.isArray(value)) {
      cleanObject[key] = deepSanitize(value);
    } else {
      cleanObject[key] = value;
    }
  }

  return cleanObject as T;
}

export type ZiplineFileSummary = {
  name: string;
  size?: number | null;
  type?: string | null;
  url: string;
};

type ZiplinePayload =
  | {
      files?: Array<string | Record<string, unknown>>;
      file?: Record<string, unknown>;
      url?: string;
      name?: string;
      size?: number;
      type?: string;
    }
  | null
  | undefined;

export function buildZiplineUploadUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, "")}/api/upload`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

export function getZiplineServerConfig(env = process.env) {
  const apiUrl = env.ZIPLINE_API_URL?.trim().replace(/\/$/, "") ?? "";
  const publicUrl = env.ZIPLINE_PUBLIC_URL?.trim().replace(/\/$/, "") ?? "";
  const token = env.ZIPLINE_TOKEN?.trim() ?? "";

  return {
    apiUrl,
    publicUrl,
    token,
    isConfigured: Boolean(apiUrl && token),
  };
}

export function getZiplineAuthorizationHeader(token: string) {
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}

export function normalizeZiplineResponse(payload: ZiplinePayload): ZiplineFileSummary {
  if (!payload || typeof payload !== "object") {
    throw new Error("Zipline returned an empty response.");
  }

  if ("file" in payload && payload.file && typeof payload.file === "object") {
    return normalizeFileRecord(payload.file);
  }

  if ("files" in payload && Array.isArray(payload.files) && payload.files.length > 0) {
    const firstFile = payload.files[0];

    if (typeof firstFile === "string") {
      return {
        name: getNameFromUrl(firstFile),
        url: firstFile,
      };
    }

    if (firstFile && typeof firstFile === "object") {
      return normalizeFileRecord(firstFile);
    }
  }

  if ("url" in payload && typeof payload.url === "string") {
    return {
      name: typeof payload.name === "string" ? payload.name : getNameFromUrl(payload.url),
      size: typeof payload.size === "number" ? payload.size : undefined,
      type: typeof payload.type === "string" ? payload.type : undefined,
      url: payload.url,
    };
  }

  throw new Error("Zipline returned an unexpected upload payload.");
}

export function rebasePublicUrl(url: string, internalBaseUrl: string, publicBaseUrl?: string) {
  if (!publicBaseUrl) {
    return url;
  }

  try {
    const current = new URL(url);
    const internal = new URL(internalBaseUrl);
    const target = new URL(publicBaseUrl);

    if (current.origin !== internal.origin) {
      return url;
    }

    return `${target.origin}${current.pathname}${current.search}${current.hash}`;
  } catch {
    return url;
  }
}

export function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return null;
}

function normalizeFileRecord(record: Record<string, unknown>): ZiplineFileSummary {
  const url = typeof record.url === "string" ? record.url : null;

  if (!url) {
    throw new Error("Zipline returned a file without a public URL.");
  }

  return {
    name:
      typeof record.name === "string"
        ? record.name
        : typeof record.originalName === "string"
          ? record.originalName
          : getNameFromUrl(url),
    size: typeof record.size === "number" ? record.size : undefined,
    type: typeof record.type === "string" ? record.type : undefined,
    url,
  };
}

function getNameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const fallback = parsed.pathname.split("/").filter(Boolean).at(-1);
    return fallback || "uploaded-file";
  } catch {
    return "uploaded-file";
  }
}

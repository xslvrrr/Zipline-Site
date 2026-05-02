import { NextResponse } from "next/server";
import {
  getZiplineAuthorizationHeader,
  buildZiplineUploadUrl,
  getErrorMessage,
  getZiplineServerConfig,
  normalizeZiplineResponse,
  rebasePublicUrl,
} from "@/lib/zipline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = getZiplineServerConfig();

  if (!config.isConfigured) {
    return NextResponse.json(
      {
        error: "Upload integration is not configured on the server.",
      },
      { status: 503 },
    );
  }

  const incoming = await request.formData();
  const file = incoming.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: "Please attach a file before uploading.",
      },
      { status: 400 },
    );
  }

  const body = new FormData();
  body.append("file", file, file.name);

  const upstreamResponse = await fetch(buildZiplineUploadUrl(config.apiUrl), {
    method: "POST",
    headers: {
      Authorization: getZiplineAuthorizationHeader(config.token),
    },
    body,
    cache: "no-store",
  });

  const payload = await upstreamResponse.json().catch(() => null);

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      {
        error: getErrorMessage(payload) ?? "Zipline rejected the upload request.",
      },
      { status: upstreamResponse.status },
    );
  }

  const normalized = normalizeZiplineResponse(payload);

  return NextResponse.json({
    file: {
      ...normalized,
      url: rebasePublicUrl(normalized.url, config.apiUrl, config.publicUrl),
    },
  });
}

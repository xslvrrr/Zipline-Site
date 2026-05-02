import {
  buildZiplineUploadUrl,
  formatFileSize,
  getErrorMessage,
  getZiplineAuthorizationHeader,
  getZiplineServerConfig,
  normalizeZiplineResponse,
  rebasePublicUrl,
} from "./zipline";

describe("zipline helpers", () => {
  it("builds the upstream upload endpoint", () => {
    expect(buildZiplineUploadUrl("https://zipline.internal.example.com/")).toBe(
      "https://zipline.internal.example.com/api/upload",
    );
  });

  it("normalizes array string responses", () => {
    expect(
      normalizeZiplineResponse({
        files: ["https://files.example.com/u/demo.png"],
      }),
    ).toEqual({
      name: "demo.png",
      url: "https://files.example.com/u/demo.png",
    });
  });

  it("normalizes object responses", () => {
    expect(
      normalizeZiplineResponse({
        file: {
          name: "brief.pdf",
          size: 2048,
          type: "application/pdf",
          url: "https://files.example.com/u/brief.pdf",
        },
      }),
    ).toEqual({
      name: "brief.pdf",
      size: 2048,
      type: "application/pdf",
      url: "https://files.example.com/u/brief.pdf",
    });
  });

  it("rebases internal URLs to the public domain", () => {
    expect(
      rebasePublicUrl(
        "https://zipline.internal.example.com/u/demo.png",
        "https://zipline.internal.example.com",
        "https://files.example.com",
      ),
    ).toBe("https://files.example.com/u/demo.png");
  });

  it("keeps the original URL when rebasing is not needed", () => {
    expect(
      rebasePublicUrl(
        "https://another-origin.example.com/u/demo.png",
        "https://zipline.internal.example.com",
        "https://files.example.com",
      ),
    ).toBe("https://another-origin.example.com/u/demo.png");
  });

  it("reads trimmed server configuration", () => {
    expect(
      getZiplineServerConfig({
        ZIPLINE_API_URL: "https://zipline.internal.example.com/ ",
        ZIPLINE_PUBLIC_URL: "https://files.example.com/ ",
        ZIPLINE_TOKEN: " secret-token ",
      }),
    ).toEqual({
      apiUrl: "https://zipline.internal.example.com",
      publicUrl: "https://files.example.com",
      token: "secret-token",
      isConfigured: true,
    });
  });

  it("formats byte sizes for the upload panel", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("normalizes the authorization header format", () => {
    expect(getZiplineAuthorizationHeader("secret-token")).toBe("Bearer secret-token");
    expect(getZiplineAuthorizationHeader("Bearer already-set")).toBe("Bearer already-set");
  });

  it("supports flat URL payloads and message extraction", () => {
    expect(
      normalizeZiplineResponse({
        url: "https://files.example.com/u/direct.txt",
      }),
    ).toEqual({
      name: "direct.txt",
      url: "https://files.example.com/u/direct.txt",
    });

    expect(getErrorMessage({ message: "Upload failed." })).toBe("Upload failed.");
  });

  it("throws on invalid upload payloads", () => {
    expect(() => normalizeZiplineResponse(null)).toThrow("Zipline returned an empty response.");
    expect(() => normalizeZiplineResponse({ file: {} })).toThrow(
      "Zipline returned a file without a public URL.",
    );
    expect(() => normalizeZiplineResponse({ files: [] })).toThrow(
      "Zipline returned an unexpected upload payload.",
    );
  });
});

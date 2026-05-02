// @vitest-environment node

import { POST } from "./route";

describe("POST /api/upload", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    vi.restoreAllMocks();
  });

  afterAll(() => {
    process.env = env;
  });

  it("returns 503 when the server integration is not configured", async () => {
    delete process.env.ZIPLINE_API_URL;
    delete process.env.ZIPLINE_TOKEN;

    const formData = new FormData();
    formData.append("file", new File(["hello"], "hello.txt", { type: "text/plain" }));

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Upload integration is not configured on the server.",
    });
  });

  it("forwards the file to Zipline and returns a public URL", async () => {
    process.env.ZIPLINE_API_URL = "https://zipline.internal.example.com/";
    process.env.ZIPLINE_PUBLIC_URL = "https://files.example.com";
    process.env.ZIPLINE_TOKEN = "secret-token";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          files: [
            {
              name: "demo.png",
              url: "https://zipline.internal.example.com/u/demo.png",
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.append("file", new File(["hello"], "demo.png", { type: "image/png" }));

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://zipline.internal.example.com/api/upload");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: {
        Authorization: "Bearer secret-token",
      },
      cache: "no-store",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      file: {
        name: "demo.png",
        url: "https://files.example.com/u/demo.png",
      },
    });
  });

  it("passes upstream errors back to the client", async () => {
    process.env.ZIPLINE_API_URL = "https://zipline.internal.example.com";
    process.env.ZIPLINE_TOKEN = "secret-token";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        }),
      ),
    );

    const formData = new FormData();
    formData.append("file", new File(["hello"], "demo.png", { type: "image/png" }));

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid token",
    });
  });
});

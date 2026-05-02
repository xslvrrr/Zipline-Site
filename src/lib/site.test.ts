import { getSiteUrl, siteConfig } from "./site";

describe("site config helpers", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterAll(() => {
    process.env = env;
  });

  it("falls back to the default site URL", () => {
    expect(getSiteUrl()).toBe(siteConfig.defaultSiteUrl);
  });

  it("normalizes a bare domain to https", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "files.example.com/";
    expect(getSiteUrl()).toBe("https://files.example.com");
  });

  it("trims trailing slashes from absolute URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://assets.example.com/";
    expect(getSiteUrl()).toBe("https://assets.example.com");
  });
});

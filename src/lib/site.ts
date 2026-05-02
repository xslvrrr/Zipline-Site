export const siteConfig = {
  name: "Zipline Edge",
  description:
    "A public-facing website and secure upload front door for a professional Zipline file host.",
  defaultSiteUrl: "https://files.example.com",
  metrics: [
    { value: "TLS-first", label: "Public upload surface behind HTTPS" },
    { value: "Proxy safe", label: "Upload token stays server-side" },
    { value: "Brand ready", label: "Custom domain, metadata, and SEO" },
  ],
  capabilities: [
    {
      title: "Public domain experience",
      description:
        "A clean marketing surface, polished upload flow, and metadata tuned for a branded file host.",
    },
    {
      title: "Server-side upload proxy",
      description:
        "The site accepts files and forwards them to Zipline from the server so your token never reaches the browser.",
    },
    {
      title: "Deployment readiness",
      description:
        "Sitemap, robots, environment templates, and launch instructions are already included.",
    },
    {
      title: "Domain and DNS planning",
      description:
        "The launch section calls out DNS records, proxy expectations, and the Zipline domain settings you need to enable.",
    },
  ],
  launchChecklist: [
    "Point your public domain or subdomain to the reverse proxy in front of this site and your Zipline origin.",
    "Set the Next.js proxy variables so uploads route to Zipline without exposing your token.",
    "Apply the Zipline domain variables so returned file links use the public hostname.",
    "Attach SSL at the proxy layer and verify both the homepage and uploaded asset URLs resolve over HTTPS.",
  ],
  dnsRows: [
    { type: "A", host: "files", value: "203.0.113.10", ttl: "Auto" },
    { type: "CNAME", host: "cdn", value: "files.example.com", ttl: "Auto" },
  ],
  envSnippet: `# Zipline server settings
CORE_DEFAULT_DOMAIN=files.example.com
DOMAINS=files.example.com,cdn.example.com
CORE_RETURN_HTTPS_URLS=true
CORE_TRUST_PROXY=true`,
  proxySnippet: `# This Next.js site
NEXT_PUBLIC_SITE_URL=https://files.example.com
ZIPLINE_API_URL=https://zipline.internal.example.com
ZIPLINE_PUBLIC_URL=https://files.example.com
ZIPLINE_TOKEN=replace-with-your-zipline-token`,
  uploadSnippet: `curl -X POST https://files.example.com/api/upload \\
  -F file=@launch-plan.pdf`,
};

export function getSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!candidate) {
    return siteConfig.defaultSiteUrl;
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate.replace(/\/$/, "");
  }

  return `https://${candidate.replace(/\/$/, "")}`;
}

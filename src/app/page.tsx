import { UploadPanel } from "@/components/upload-panel";
import { siteConfig } from "@/lib/site";
import { getZiplineServerConfig } from "@/lib/zipline";

export default function Home() {
  const ziplineConfig = getZiplineServerConfig();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-10">
      <header className="panel reveal rounded-full px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              {siteConfig.name}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Public website and secure upload surface for your Zipline host
            </p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <a className="rounded-full px-3 py-1 hover:bg-white" href="#platform">
              Platform
            </a>
            <a className="rounded-full px-3 py-1 hover:bg-white" href="#launch">
              Launch
            </a>
            <a className="rounded-full px-3 py-1 hover:bg-white" href="#api">
              API
            </a>
          </nav>
        </div>
      </header>

      <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div className="reveal reveal-delay-1">
          <p className="section-label">Public domain ready</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl">
            A clean public front door for your Zipline host.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            This site gives your file host a professional landing page, upload gateway, launch
            checklist, and deployment configuration so you can attach a real domain and ship with
            confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px] hover:bg-[var(--accent-strong)]"
              href="#upload"
            >
              Test an upload
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-6 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
              href="#launch"
            >
              Review launch plan
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {siteConfig.metrics.map((metric) => (
              <div key={metric.label} className="panel rounded-[1.75rem] p-5">
                <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <UploadPanel isConfigured={ziplineConfig.isConfigured} />
      </section>

      <section className="space-y-6 py-6" id="platform">
        <div className="reveal">
          <p className="section-label">Platform design</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Professional by default, but still practical to deploy
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {siteConfig.capabilities.map((capability, index) => (
            <article
              key={capability.title}
              className={`panel rounded-[1.75rem] p-6 reveal ${index > 1 ? "reveal-delay-1" : ""}`}
            >
              <h3 className="text-lg font-semibold tracking-tight">{capability.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {capability.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 py-10 xl:grid-cols-[0.95fr_1.05fr]" id="launch">
        <article className="panel reveal rounded-[2rem] p-6 md:p-8">
          <p className="section-label">Launch checklist</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Everything needed to attach a real public domain
          </h2>
          <div className="mt-6 space-y-4">
            {siteConfig.launchChecklist.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-[1.5rem] border border-white/70 bg-white/70 px-4 py-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-strong)]">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-[var(--muted)]">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-6">
          <article className="panel reveal reveal-delay-1 rounded-[2rem] p-6 md:p-8">
            <p className="section-label">DNS blueprint</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Suggested records</h3>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white">
              <div className="grid grid-cols-[0.7fr_0.9fr_1.4fr_0.6fr] gap-3 border-b border-[var(--line)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                <span>Type</span>
                <span>Host</span>
                <span>Value</span>
                <span>TTL</span>
              </div>
              {siteConfig.dnsRows.map((row) => (
                <div
                  key={`${row.type}-${row.host}`}
                  className="grid grid-cols-[0.7fr_0.9fr_1.4fr_0.6fr] gap-3 px-4 py-4 text-sm text-[var(--foreground)]"
                >
                  <span>{row.type}</span>
                  <span>{row.host}</span>
                  <span>{row.value}</span>
                  <span>{row.ttl}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel reveal reveal-delay-2 rounded-[2rem] p-6 md:p-8" id="api">
            <p className="section-label">Environment map</p>
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">Zipline instance</h3>
                <pre className="code-block mt-4 overflow-x-auto rounded-[1.5rem] p-4 text-xs leading-6">
                  {siteConfig.envSnippet}
                </pre>
              </div>
              <div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">Frontend proxy</h3>
                <pre className="code-block mt-4 overflow-x-auto rounded-[1.5rem] p-4 text-xs leading-6">
                  {siteConfig.proxySnippet}
                </pre>
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] bg-white/80 p-4">
              <p className="text-sm font-medium text-[var(--foreground)]">App integration</p>
              <pre className="code-block mt-3 overflow-x-auto rounded-[1.25rem] p-4 text-xs leading-6">
                {siteConfig.uploadSnippet}
              </pre>
            </div>
          </article>
        </div>
      </section>

      <footer className="reveal mt-auto pt-6 text-sm text-[var(--muted)]">
        Built as a public-facing frontend for Zipline with SEO metadata, robots, sitemap, and a
        secure upload proxy.
      </footer>
    </main>
  );
}

"use client";

import { startTransition, useState } from "react";
import { formatFileSize, type ZiplineFileSummary } from "@/lib/zipline";

type UploadPanelProps = {
  isConfigured: boolean;
};

type UploadState =
  | {
      error: null;
      file: null;
      phase: "idle" | "uploading";
    }
  | {
      error: string;
      file: null;
      phase: "error";
    }
  | {
      error: null;
      file: ZiplineFileSummary;
      phase: "success";
    };

const initialState: UploadState = {
  error: null,
  file: null,
  phase: "idle",
};

export function UploadPanel({ isConfigured }: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [state, setState] = useState<UploadState>(initialState);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || !isConfigured) {
      return;
    }

    setState({
      error: null,
      file: null,
      phase: "uploading",
    });

    const payload = new FormData();
    payload.append("file", selectedFile, selectedFile.name);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as {
        error?: string;
        file?: ZiplineFileSummary;
      };
      const uploadedFile = data.file;

      if (!response.ok || !uploadedFile) {
        throw new Error(data.error ?? "Upload failed.");
      }

      startTransition(() => {
        setState({
          error: null,
          file: uploadedFile,
          phase: "success",
        });
        setCopyLabel("Copy link");
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Upload failed.",
        file: null,
        phase: "error",
      });
    }
  }

  async function handleCopy() {
    if (state.phase !== "success") {
      return;
    }

    await navigator.clipboard.writeText(state.file.url);
    setCopyLabel("Copied");
  }

  const isDisabled = !selectedFile || !isConfigured || state.phase === "uploading";

  return (
    <section
      aria-labelledby="upload-panel-title"
      className="panel reveal reveal-delay-2 rounded-[2rem] p-6 text-left md:p-8"
      id="upload"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-label">Live upload gateway</p>
          <h2 id="upload-panel-title" className="mt-3 text-2xl font-semibold tracking-tight">
            Route a file through your public domain
          </h2>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]">
          {isConfigured ? "Proxy enabled" : "Awaiting server env"}
        </span>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
        The browser sends the file to this site. The server forwards it to Zipline and returns the
        public link, keeping your upload token out of the client.
      </p>

      {!isConfigured ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Set <code>ZIPLINE_API_URL</code> and <code>ZIPLINE_TOKEN</code> on the server to enable
          live uploads.
        </div>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label
          className="group block rounded-[1.75rem] border border-dashed border-[var(--line)] bg-white/85 p-5 transition hover:border-[var(--accent)]"
          htmlFor="upload-file"
        >
          <span className="text-sm font-medium text-[var(--foreground)]">Select a file</span>
          <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">
            Upload a PDF, image, video, or archive to validate the public path and returned file
            URL.
          </span>
          <input
            className="mt-4 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:font-medium file:text-white"
            id="upload-file"
            name="file"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setSelectedFile(nextFile);
            }}
            type="file"
          />
          {selectedFile ? (
            <div className="mt-4 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--foreground)]">
              <span className="block font-medium">{selectedFile.name}</span>
              <span className="mt-1 block text-[var(--muted)]">
                {formatFileSize(selectedFile.size)} {selectedFile.type ? `• ${selectedFile.type}` : ""}
              </span>
            </div>
          ) : null}
        </label>

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isDisabled}
          type="submit"
        >
          {state.phase === "uploading" ? "Uploading to Zipline..." : "Connect Zipline upload"}
        </button>
      </form>

      {state.phase === "error" ? (
        <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {state.error}
        </div>
      ) : null}

      {state.phase === "success" ? (
        <div className="mt-5 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-900">Upload complete</p>
          <a
            className="mt-2 block break-all text-sm leading-6 text-emerald-800 underline decoration-emerald-300 underline-offset-4"
            href={state.file.url}
            rel="noreferrer"
            target="_blank"
          >
            {state.file.url}
          </a>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-900">
              {state.file.name}
            </span>
            <button
              className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-medium text-emerald-900"
              onClick={handleCopy}
              type="button"
            >
              {copyLabel}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { UploadPanel } from "./upload-panel";

describe("UploadPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows setup guidance when the server config is missing", () => {
    render(<UploadPanel isConfigured={false} />);

    expect(
      screen.getByText((content) => content.includes("Set") && content.includes("enable live uploads")),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /Connect Zipline upload/i })).toBeDisabled();
  });

  it("uploads a file and exposes the returned URL", async () => {
    const user = userEvent.setup();
    const clipboardSpy = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        file: {
          name: "deck.pdf",
          url: "https://files.example.com/u/deck.pdf",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<UploadPanel isConfigured />);

    const input = screen.getByLabelText(/Select a file/i);
    const file = new File(["project deck"], "deck.pdf", { type: "application/pdf" });

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: /Connect Zipline upload/i }));

    await waitFor(() => {
      expect(screen.getByText(/Upload complete/i)).toBeVisible();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /Copy link/i }));

    expect(clipboardSpy).toHaveBeenCalledWith("https://files.example.com/u/deck.pdf");
  });

  it("surfaces upload errors", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Zipline rejected the upload.",
        }),
      }),
    );

    render(<UploadPanel isConfigured />);

    await user.upload(
      screen.getByLabelText(/Select a file/i),
      new File(["hello"], "hello.txt", { type: "text/plain" }),
    );
    await user.click(screen.getByRole("button", { name: /Connect Zipline upload/i }));

    await waitFor(() => {
      expect(screen.getByText(/Zipline rejected the upload/i)).toBeVisible();
    });
  });
});

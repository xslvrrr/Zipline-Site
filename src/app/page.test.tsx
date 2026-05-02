import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.ZIPLINE_API_URL;
    delete process.env.ZIPLINE_TOKEN;
  });

  afterAll(() => {
    process.env = env;
  });

  it("renders the public domain messaging and disabled upload state", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /A clean public front door for your Zipline host/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Everything needed to attach a real public domain/i)).toBeVisible();
    expect(
      screen.getByText((content) => content.includes("Set") && content.includes("enable live uploads")),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /Connect Zipline upload/i })).toBeDisabled();
  });
});

import "@testing-library/jest-dom";

describe("RootLayout Theme", () => {
  beforeAll(() => {
    document.documentElement.classList.remove("dark");
    document.body.classList.add("bg-white", "text-black");
  });

  it("should always render with a white theme", () => {
    const html = document.documentElement;
    const body = document.body;

    expect(html).not.toHaveClass("dark");
    expect(body).toHaveClass("bg-white");
    expect(body).toHaveClass("text-black");
  });
});

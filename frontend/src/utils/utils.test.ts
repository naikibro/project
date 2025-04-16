import { idOf } from "./utils";
import { v5 as uuidv5 } from "uuid";

jest.mock("uuid", () => ({
  v5: jest.fn(),
}));

describe("idOf", () => {
  const NAMESPACE = uuidv5.DNS;

  it("should generate a UUID using the provided argument and namespace", () => {
    const arg = "test-string";
    const expectedUUID = "expected-uuid";
    (uuidv5 as unknown as jest.Mock).mockReturnValue(expectedUUID);

    const result = idOf(arg);

    expect(uuidv5).toHaveBeenCalledWith(arg, NAMESPACE);
    expect(result).toBe(expectedUUID);
  });
});

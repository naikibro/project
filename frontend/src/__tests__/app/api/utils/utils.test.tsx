import {
  getUser,
  handleLogout,
  signIn,
  signUp,
  SignUpDto,
} from "src/app/api/utils/auth";

global.fetch = jest.fn();

describe("signUp", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call fetch with the correct URL and options", async () => {
    const mockData: SignUpDto = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue("application/json"),
      },
    });

    await signUp(mockData);

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockData),
    });
  });

  it("should throw an error if the response is not ok and content-type is application/json", async () => {
    const mockData: SignUpDto = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
    };

    const mockError = { message: "Signup failed" };

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      headers: {
        get: jest.fn().mockReturnValue("application/json"),
      },
      json: jest.fn().mockResolvedValue(mockError),
    });

    await expect(signUp(mockData)).rejects.toThrow("Signup failed");
  });

  it("should throw an error if the response is not ok and content-type is not application/json", async () => {
    const mockData: SignUpDto = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
    };

    const mockErrorText = "Signup failed: Some error text";

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      headers: {
        get: jest.fn().mockReturnValue("text/plain"),
      },
      text: jest.fn().mockResolvedValue(mockErrorText),
    });

    await expect(signUp(mockData)).rejects.toThrow(mockErrorText);
  });
});

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
});

describe("signUp", () => {
  const validData = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
  };

  it("should throw error with JSON response error message", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "Email already exists" }),
    });

    await expect(signUp(validData)).rejects.toThrow("Email already exists");
  });

  it("should throw error with text response when not JSON", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      headers: { get: () => "text/html" },
      text: async () => "Server error",
    });

    await expect(signUp(validData)).rejects.toThrow(
      "Signup failed: Server error"
    );
  });
});

describe("signIn", () => {
  const validData = {
    email: "test@example.com",
    password: "password123",
  };

  const authResponse = {
    accessToken: "valid_token",
    user: {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      isActive: true,
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
      role: "user",
      profilePicture: null,
    },
  };

  it("should return authResponse when successful", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => authResponse,
    });

    await expect(signIn(validData)).resolves.toEqual(authResponse);
  });

  it("should throw 'User not found' error on 404", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" }),
    });

    await expect(signIn(validData)).rejects.toThrow("User not found");
  });

  it("should throw error for invalid credentials when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(signIn(validData)).rejects.toThrow("Invalid credentials");
  });

  it("should throw error when accessToken is missing", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "", user: {} }),
    });

    await expect(signIn(validData)).rejects.toThrow(
      "Authentication failed: No token received."
    );
  });
});

describe("getUser", () => {
  const token = "valid_token";
  const userResponse = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    isActive: true,
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    role: "user",
    profilePicture: null,
  };

  it("should return user data when response is ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => userResponse,
    });

    await expect(getUser(token)).resolves.toEqual(userResponse);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/users/me",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  });

  it("should throw error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(getUser(token)).rejects.toThrow(
      "Session expired or unauthorized"
    );
  });
});

describe("handleLogout", () => {
  it("should remove token from localStorage and call the action", () => {
    localStorage.setItem("token", "some_token");
    const action = jest.fn();

    handleLogout(action);

    expect(localStorage.getItem("token")).toBeNull();
    expect(action).toHaveBeenCalled();
  });
});

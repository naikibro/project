import { Role } from "src/models/Role.model";

export interface SignUpDto {
  username: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  profilePicture?: string | null;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  role?: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signUp(data: SignUpDto): Promise<void> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.message || "Signup failed");
    } else {
      const errorText = await res.text();
      throw new Error(`Signup failed: ${errorText}`);
    }
  }
}

export async function signIn(data: SignInDto): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorResponse = await res.json();

      if (res.status === 404) {
        throw new Error("User not found");
      }

      throw new Error(errorResponse.message || "Invalid credentials");
    }

    const responseData: AuthResponse = await res.json();

    if (!responseData.accessToken) {
      throw new Error("Authentication failed: No token received.");
    }

    return responseData;
  } catch (error) {
    console.error("Sign-in API error:", error);
    throw new Error(error.message || "An error occurred during sign-in.");
  }
}

export const handleLogout = (action: () => void) => {
  localStorage.removeItem("token");
  action();
};

export async function getUser(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Session expired or unauthorized");
  }

  return res.json();
}

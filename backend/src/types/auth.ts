export const ACCESS_TOKEN_COOKIE = "access_token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

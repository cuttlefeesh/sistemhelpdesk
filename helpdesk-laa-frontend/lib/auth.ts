import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) throw new Error("FATAL: JWT_SECRET environment variable is not set.");
const SECRET = new TextEncoder().encode(rawSecret);

const COOKIE_NAME = "laa_helpdesk_session";
const SESSION_DURATION = 60 * 60; // 1 jam

export type UserPayload = {
  id: number;
  nim_nip: string;
  nama: string;
  email: string | null;
  role: string;
  prodi: string | null;
  kelas: string | null;
  session_id?: string;
};

export async function signToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function cookieName() {
  return COOKIE_NAME;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
  };
}

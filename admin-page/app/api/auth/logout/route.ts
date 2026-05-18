import { NextResponse } from "next/server";
import { cookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName(), "", { maxAge: 0, path: "/" });
  return response;
}

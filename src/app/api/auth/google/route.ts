import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";

const authService = new AuthService();

export const dynamic = "force-dynamic";

/**
 * Google OAuth login.
 * Frontend sends access_token from @react-oauth/google useGoogleLogin.
 * Backend verifies the token by calling Google's userinfo endpoint.
 */
export async function POST(req: Request) {
  try {
    const { accessToken } = (await req.json()) as {
      accessToken?: string;
    };

    if (!accessToken) {
      return NextResponse.json(
        { error: "accessToken wajib" },
        { status: 400 }
      );
    }

    // Verify access token with Google's userinfo API
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userInfoRes.ok) {
      return NextResponse.json(
        { error: "Token Google tidak valid" },
        { status: 401 }
      );
    }

    const payload = await userInfoRes.json();

    if (!payload?.email) {
      return NextResponse.json(
        { error: "Token Google tidak valid" },
        { status: 401 }
      );
    }

    const email = payload.email.toLowerCase();
    const username = payload.name || email.split("@")[0];

    const result = await authService.googleLogin(email, username, req);

    return result;
  } catch (err) {
    console.error("Google OAuth verification error:", err);
    return NextResponse.json(
      { error: "Verifikasi Google gagal" },
      { status: 401 }
    );
  }
}

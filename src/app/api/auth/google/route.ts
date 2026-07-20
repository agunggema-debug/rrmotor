import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { AuthService } from "@/lib/services/auth.service";

const authService = new AuthService();

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { idToken } = (await req.json()) as {
      idToken?: string;
    };

    if (!idToken) {
      return NextResponse.json(
        { error: "idToken wajib" },
        { status: 400 }
      );
    }

    // Verify Google token
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

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
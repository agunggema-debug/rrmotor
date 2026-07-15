import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { HttpError, serverError } from "@/lib/http";

const authService = new AuthService();

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username & password wajib" },
        { status: 400 }
      );
    }

    return authService.login(username, password);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return serverError(e);
  }
}
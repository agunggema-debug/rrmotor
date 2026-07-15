import { NextResponse } from "next/server";
import { MechanicService } from "@/lib/services/mechanic.service";

const mechanicService = new MechanicService();

export const dynamic = "force-dynamic";

export async function GET() {
  const mechanic = await mechanicService.getMechanic();
  return NextResponse.json(mechanic);
}

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

const API = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

describe("Bookings API", () => {
  let authCookie: string;

  beforeAll(async () => {
    const loginRes = await request(API)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin123" });
    authCookie = loginRes.headers["set-cookie"]?.[0] || "";
  });

  it("GET /api/bookings should return array", async () => {
    const res = await request(API).get("/api/bookings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/bookings should create booking (requires auth)", async () => {
    const res = await request(API)
      .post("/api/bookings")
      .set("Cookie", authCookie)
      .send({
        ownerName: "Test User",
        motor: "Vario",
        plate: "B 1234 TEST",
        serviceType: "Servis Ringan",
        appointmentDate: "Rab, 15 Jul",
        appointmentTime: "10:00",
        basePrice: 50000,
      });
    expect([200, 201]).toContain(res.status);
  });

  it("GET /api/bookings/:id should return booking", async () => {
    const listRes = await request(API).get("/api/bookings");
    const bookings = listRes.body;
    if (bookings.length > 0) {
      const res = await request(API).get(`/api/bookings/${bookings[0].id}`);
      expect(res.status).toBe(200);
    }
  });
});

describe("Sparepart API", () => {
  it("GET /api/sparepart should return array", async () => {
    const res = await request(API).get("/api/sparepart");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/sparepart/:id should return sparepart", async () => {
    const listRes = await request(API).get("/api/sparepart");
    const items = listRes.body;
    if (items.length > 0) {
      const res = await request(API).get(`/api/sparepart/${items[0].id}`);
      expect(res.status).toBe(200);
    }
  });
});

describe("Auth API", () => {
  it("POST /api/auth/login should reject empty credentials", async () => {
    const res = await request(API).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/login should reject wrong credentials", async () => {
    const res = await request(API)
      .post("/api/auth/login")
      .send({ username: "wrong", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login should set session cookie on success", async () => {
    const res = await request(API)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin123" });
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});

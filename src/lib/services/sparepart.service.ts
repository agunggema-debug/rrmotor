/* eslint-disable @typescript-eslint/no-explicit-any */
import { SparepartRepository } from "@/lib/repositories/sparepart";
import { HttpError } from "@/lib/http";
import { str, num, httpUrl, oneOf } from "@/lib/validate";

const sparepartRepo = new SparepartRepository();
const VALID_CATEGORIES = ["Mesin", "Body", "Kaki-kaki", "Kelistrikan", "Aksesoris", "Oli & Cairan"] as const;

export class SparepartService {
  async getSpareparts(category?: string, search?: string) {
    const where: any = {};
    if (category) {
      where.category = oneOf(category, VALID_CATEGORIES, "category");
    }
    if (search) {
      where.name = { contains: str(search) };
    }
    return sparepartRepo.findMany(where, { name: "asc" });
  }

  async getSparepart(id: number) {
    const item = await sparepartRepo.findUnique(id);
    if (!item) throw new HttpError(404, "Sparepart tidak ditemukan");
    return item;
  }

  async createSparepart(data: {
    name: string;
    category: string;
    price: number;
    stock?: number;
    description?: string;
    imageUrl?: string;
  }) {
    const name = str(data.name, { required: true, max: 100, field: "name" });
    const category = oneOf(str(data.category, { required: true, max: 50, field: "category" }), VALID_CATEGORIES, "category");
    const price = num(data.price, { required: true, min: 0, field: "price" });
    const stock = num(data.stock, { min: 0, integer: true, field: "stock" });
    const description = str(data.description, { max: 500, field: "description" });
    const rawImage = str(data.imageUrl, { max: 500, field: "imageUrl" });
    const imageUrl = rawImage ? httpUrl(rawImage, "imageUrl") : "";

    return sparepartRepo.create({ name, category, price, stock, description, imageUrl });
  }

  async updateSparepart(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = str(data.name, { required: true, max: 100, field: "name" });
    if (data.category !== undefined) {
      updateData.category = oneOf(str(data.category, { required: true, max: 50, field: "category" }), VALID_CATEGORIES, "category");
    }
    if (data.price !== undefined) updateData.price = num(data.price, { required: true, min: 0, field: "price" });
    if (data.stock !== undefined) updateData.stock = num(data.stock, { min: 0, integer: true, field: "stock" });
    if (data.description !== undefined) updateData.description = str(data.description, { max: 500, field: "description" });
    if (data.imageUrl !== undefined) {
      const raw = str(data.imageUrl, { max: 500, field: "imageUrl" });
      updateData.imageUrl = raw ? httpUrl(raw, "imageUrl") : "";
    }

    try {
      return await sparepartRepo.update(id, updateData);
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === "P2025") {
        throw new HttpError(404, "Sparepart tidak ditemukan");
      }
      throw e;
    }
  }

  async deleteSparepart(id: number) {
    try {
      await sparepartRepo.delete(id);
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === "P2025") {
        throw new HttpError(404, "Sparepart tidak ditemukan");
      }
      throw e;
    }
  }
}

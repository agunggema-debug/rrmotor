import { SparepartRepository } from "@/lib/repositories/sparepart";
import { HttpError } from "@/lib/http";
import { str, num, httpUrl, oneOf } from "@/lib/validate";
import type { Sparepart } from "@/lib/db-types";

const sparepartRepo = new SparepartRepository();
const VALID_CATEGORIES = ["Mesin", "Body", "Kaki-kaki", "Kelistrikan", "Aksesoris", "Oli & Cairan"] as const;

// Transform snake_case to camelCase for frontend compatibility
function toCamelCaseSparepart(item: Sparepart) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    stock: item.stock,
    description: item.description,
    imageUrl: item.image_url,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export class SparepartService {
  async getSpareparts(category?: string) {
    const where: Partial<Sparepart> = {};
    if (category) {
      where.category = oneOf(category, VALID_CATEGORIES, "category");
    }
    const items = await sparepartRepo.findMany(where, { name: "asc" });
    // Transform to camelCase for frontend
    return items.map(toCamelCaseSparepart);
  }

  async getSparepart(id: number) {
    const item = await sparepartRepo.findUnique(id);
    if (!item) throw new HttpError(404, "Sparepart tidak ditemukan");
    return toCamelCaseSparepart(item);
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

    return sparepartRepo.create({ name, category, price, stock, description, image_url: imageUrl });
  }

  async updateSparepart(id: number, data: Partial<Sparepart> & { imageUrl?: string }) {
    const updateData: Partial<Sparepart> = {};
    if (data.name !== undefined) updateData.name = str(data.name, { required: true, max: 100, field: "name" });
    if (data.category !== undefined) {
      updateData.category = oneOf(str(data.category, { required: true, max: 50, field: "category" }), VALID_CATEGORIES, "category");
    }
    if (data.price !== undefined) updateData.price = num(data.price, { required: true, min: 0, field: "price" });
    if (data.stock !== undefined) updateData.stock = num(data.stock, { min: 0, integer: true, field: "stock" });
    if (data.description !== undefined) updateData.description = str(data.description, { max: 500, field: "description" });
    if (data.imageUrl !== undefined) {
      const raw = str(data.imageUrl, { max: 500, field: "imageUrl" });
      updateData.image_url = raw ? httpUrl(raw, "imageUrl") : "";
    }

    try {
      return await sparepartRepo.update(id, updateData);
    } catch (e: unknown) {
      // Supabase returns error with message containing "not found" or similar
      if ((e as Error)?.message?.includes("not found")) {
        throw new HttpError(404, "Sparepart tidak ditemukan");
      }
      throw e;
    }
  }

  async deleteSparepart(id: number) {
    try {
      await sparepartRepo.delete(id);
    } catch (e: unknown) {
      if ((e as Error)?.message?.includes("not found")) {
        throw new HttpError(404, "Sparepart tidak ditemukan");
      }
      throw e;
    }
  }
}

import { MechanicRepository } from "@/lib/repositories/mechanic";

const mechanicRepo = new MechanicRepository();

export class MechanicService {
  async getMechanic() {
    return mechanicRepo.findFirst({ id: "asc" });
  }

  async getMechanics() {
    return mechanicRepo.findMany();
  }
}

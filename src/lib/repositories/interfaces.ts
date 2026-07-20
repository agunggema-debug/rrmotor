import type { User, Sparepart, Booking, Finding, Portfolio, Reward, Mechanic, VisitorSession, Redemption, Account } from "@/lib/db-types";
import type { Transaction as DbTransaction } from "@/lib/db-types";

// Booking include types
export interface BookingWithRelations extends Booking {
  findings?: Finding[];
  mechanic?: Mechanic | null;
}

// Transaction include types
export interface TransactionItemDb {
  sparepart_id: number;
  quantity: number;
  price_at_sale: number;
}

export interface TransactionItemWithSparepart extends TransactionItemDb {
  sparepart?: { id: number; name: string };
}

export interface TransactionWithItems extends DbTransaction {
  items?: TransactionItemWithSparepart[];
}

// User include types
export interface RedemptionWithReward extends Redemption {
  reward?: Reward;
}

export interface UserWithRedemptions extends User {
  redemptions?: RedemptionWithReward[];
}

// Account include types
export interface AccountWithUser extends Account {
  user?: User | null;
}

export interface IBookingRepository {
  findMany(): Promise<BookingWithRelations[]>;
  findUnique(id: number): Promise<BookingWithRelations | null>;
  create(data: {
    queue_number: string;
    owner_name: string;
    motor: string;
    plate: string;
    service_type: string;
    appointment_date: string;
    appointment_time: string;
    base_price: number;
    user_id?: number | null;
  }): Promise<BookingWithRelations>;
  update(id: number, data: Partial<Booking>): Promise<Booking>;
  delete(id: number): Promise<void>;
  findFirst(where?: Partial<Booking>, orderBy?: { created_at?: "asc" | "desc" }): Promise<Booking | null>;
}

export interface ISparepartRepository {
  findMany(where?: Partial<Sparepart>): Promise<Sparepart[]>;
  findUnique(id: number): Promise<Sparepart | null>;
  create(data: Omit<Sparepart, "id" | "created_at" | "updated_at">): Promise<Sparepart>;
  update(id: number, data: Partial<Sparepart>): Promise<Sparepart>;
  delete(id: number): Promise<void>;
  count(where?: Partial<Sparepart>): Promise<number>;
}

export interface IFindingRepository {
  findMany(where?: Partial<Finding>): Promise<Finding[]>;
  findUnique(id: number): Promise<Finding | null>;
  create(data: Omit<Finding, "id">): Promise<Finding>;
  update(id: number, data: Partial<Finding>): Promise<Finding>;
  delete(id: number): Promise<void>;
}

export interface ITransactionRepository {
  findMany(where?: Partial<DbTransaction>, orderBy?: { created_at?: "asc" | "desc" }, take?: number): Promise<TransactionWithItems[]>;
  findUnique(id: number): Promise<TransactionWithItems | null>;
  create(data: Omit<DbTransaction, "id" | "created_at"> & { items: { sparepart_id: number; quantity: number; price_at_sale: number }[] }): Promise<DbTransaction>;
  updateMany(where: Partial<{ transaction_id: number; sparepart_id: number }>, data: Partial<{ price_at_sale: number }>): Promise<{ count: number }>;
}

export interface IPortfolioRepository {
  findMany(orderBy?: { id?: "asc" | "desc" }): Promise<Portfolio[]>;
  create(data: Omit<Portfolio, "id">): Promise<Portfolio>;
}

export interface IRewardRepository {
  findMany(orderBy?: { id?: "asc" | "desc"; cost?: "asc" | "desc" }): Promise<Reward[]>;
  findUnique(id: number): Promise<Reward | null>;
}

export interface IUserRepository {
  findMany(): Promise<User[]>;
  findUnique(id: number): Promise<User | null>;
  findFirst(where?: Partial<User>): Promise<User | null>;
  update(id: number, data: Partial<User>): Promise<User>;
  create(data: Omit<User, "id" | "created_at">): Promise<User>;
  $transaction(arg: unknown[]): Promise<unknown[]>;
}

export interface IMechanicRepository {
  findMany(): Promise<Mechanic[]>;
  findFirst(orderBy?: { id?: "asc" | "desc" }): Promise<Mechanic | null>;
  create(data: Omit<Mechanic, "id">): Promise<Mechanic>;
}

export interface IVisitorRepository {
  count(where?: Partial<VisitorSession>): Promise<number>;
  upsert(id: string, data: { last_seen: string }): Promise<VisitorSession>;
  deleteMany(where?: Partial<VisitorSession>): Promise<{ count: number }>;
}

export interface IRedemptionRepository {
  create(data: Omit<Redemption, "id" | "created_at">): Promise<Redemption>;
}

export interface ITransactionItemRepository {
  updateMany(where: Partial<{ transaction_id: number; sparepart_id: number }>, data: Partial<{ price_at_sale: number }>): Promise<{ count: number }>;
}

export interface IAccountRepository {
  findUnique(where: { username?: string; id?: number }, include?: { user?: boolean }): Promise<AccountWithUser | null>;
  create(data: Omit<Account, "id" | "created_at">): Promise<Account>;
  upsert(where: { username?: string; id?: number }, data: Omit<Account, "id" | "created_at">): Promise<Account>;
  createMany(data: Omit<Account, "id" | "created_at">[]): Promise<{ count: number }>;
}
import type { Prisma } from "@prisma/client";
import type {
  Sparepart,
  Booking,
  Finding,
  Portfolio,
  Reward,
  User,
  Mechanic,
  VisitorSession,
  Redemption,
  Account,
} from "@prisma/client";
import type { Transaction as PrismaTransaction } from "@prisma/client";

export interface IBookingRepository {
  findMany(include?: Prisma.BookingInclude): Promise<Booking[]>;
  findUnique(id: number): Promise<Booking | null>;
  create(data: Prisma.BookingCreateInput): Promise<Booking>;
  update(id: number, data: Prisma.BookingUpdateInput): Promise<Booking>;
  delete(id: number): Promise<void>;
  findFirst(where?: Prisma.BookingWhereInput, orderBy?: Prisma.BookingOrderByWithRelationInput): Promise<Booking | null>;
}

export interface ISparepartRepository {
  findMany(where?: Prisma.SparepartWhereInput, orderBy?: Prisma.SparepartOrderByWithRelationInput): Promise<Sparepart[]>;
  findUnique(id: number): Promise<Sparepart | null>;
  create(data: Prisma.SparepartCreateInput): Promise<Sparepart>;
  update(id: number, data: Prisma.SparepartUpdateInput): Promise<Sparepart>;
  delete(id: number): Promise<void>;
  count(where?: Prisma.SparepartWhereInput): Promise<number>;
}

export interface IFindingRepository {
  findMany(where?: Prisma.FindingWhereInput): Promise<Finding[]>;
  findUnique(id: number): Promise<Finding | null>;
  create(data: Prisma.FindingCreateInput): Promise<Finding>;
  update(id: number, data: Prisma.FindingUpdateInput): Promise<Finding>;
  delete(id: number): Promise<void>;
}

export interface ITransactionRepository {
  findMany(where?: Prisma.TransactionWhereInput, orderBy?: Prisma.TransactionOrderByWithRelationInput, take?: number, include?: Prisma.TransactionInclude): Promise<PrismaTransaction[]>;
  findUnique(id: number, include?: Prisma.TransactionInclude): Promise<PrismaTransaction | null>;
  create(data: Prisma.TransactionCreateInput): Promise<PrismaTransaction>;
  updateMany(where: Prisma.TransactionItemWhereInput, data: Prisma.TransactionItemUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
}

export interface IPortfolioRepository {
  findMany(orderBy?: Prisma.PortfolioOrderByWithRelationInput): Promise<Portfolio[]>;
  create(data: Prisma.PortfolioCreateInput): Promise<Portfolio>;
}

export interface IRewardRepository {
  findMany(orderBy?: Prisma.RewardOrderByWithRelationInput): Promise<Reward[]>;
  findUnique(id: number): Promise<Reward | null>;
}

export interface IUserRepository {
  findUnique(id: number, include?: Prisma.UserInclude): Promise<User | null>;
  findFirst(where?: Prisma.UserWhereInput): Promise<User | null>;
  update(id: number, data: Prisma.UserUpdateInput): Promise<User>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  $transaction(arg: Prisma.PrismaPromise<unknown>[]): Promise<unknown[]>;
}

export interface IMechanicRepository {
  findMany(): Promise<Mechanic[]>;
  findFirst(orderBy?: Prisma.MechanicOrderByWithRelationInput): Promise<Mechanic | null>;
  create(data: Prisma.MechanicCreateInput): Promise<Mechanic>;
}

export interface IVisitorRepository {
  count(where?: Prisma.VisitorSessionWhereInput): Promise<number>;
  upsert(where: Prisma.VisitorSessionWhereUniqueInput, data: Prisma.VisitorSessionCreateInput): Promise<VisitorSession>;
  deleteMany(where: Prisma.VisitorSessionWhereInput): Promise<Prisma.BatchPayload>;
}

export interface IRedemptionRepository {
  create(data: Prisma.RedemptionCreateInput): Promise<Redemption>;
}

export interface ITransactionItemRepository {
  updateMany(where: Prisma.TransactionItemWhereInput, data: Prisma.TransactionItemUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
}

export interface IAccountRepository {
  findUnique(where: Prisma.AccountWhereUniqueInput, include?: Prisma.AccountInclude): Promise<Account | null>;
  create(data: Prisma.AccountCreateInput): Promise<Account>;
  upsert(where: Prisma.AccountWhereUniqueInput, data: Prisma.AccountCreateInput): Promise<Account>;
  createMany(data: Prisma.AccountCreateManyInput[]): Promise<Prisma.BatchPayload>;
}

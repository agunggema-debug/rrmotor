/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IBookingRepository {
  findMany(include?: any): Promise<any[]>;
  findUnique(id: number): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any>;
  delete(id: number): Promise<void>;
  findFirst(where?: any, orderBy?: any): Promise<any | null>;
}

export interface ISparepartRepository {
  findMany(where?: any, orderBy?: any): Promise<any[]>;
  findUnique(id: number): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any>;
  delete(id: number): Promise<void>;
  count(where?: any): Promise<number>;
}

export interface IFindingRepository {
  findMany(where?: any): Promise<any[]>;
  findUnique(id: number): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any>;
  delete(id: number): Promise<void>;
}

export interface ITransactionRepository {
  findMany(where?: any, orderBy?: any, take?: number, include?: any): Promise<any[]>;
  findUnique(id: number, include?: any): Promise<any | null>;
  create(data: any): Promise<any>;
  updateMany(where: any, data: any): Promise<{ count: number }>;
}

export interface IPortfolioRepository {
  findMany(orderBy?: any): Promise<any[]>;
  create(data: any): Promise<any>;
}

export interface IRewardRepository {
  findMany(orderBy?: any): Promise<any[]>;
  findUnique(id: number): Promise<any | null>;
}

export interface IUserRepository {
  findUnique(id: number, include?: any): Promise<any | null>;
  findFirst(where?: any): Promise<any | null>;
  update(id: number, data: any): Promise<any>;
  create(data: any): Promise<any>;
  $transaction(arg: any[]): Promise<any>;
}

export interface IMechanicRepository {
  findMany(): Promise<any[]>;
  findFirst(orderBy?: any): Promise<any | null>;
  create(data: any): Promise<any>;
}

export interface IVisitorRepository {
  count(where?: any): Promise<number>;
  upsert(where: any, data: any): Promise<any>;
  deleteMany(where: any): Promise<{ count: number }>;
}

export interface IRedemptionRepository {
  create(data: any): Promise<any>;
}

export interface ITransactionItemRepository {
  updateMany(where: any, data: any): Promise<{ count: number }>;
}

export interface IAccountRepository {
  findUnique(where: any, include?: any): Promise<any | null>;
  create(data: any): Promise<any>;
  upsert(where: any, data: any): Promise<any>;
  createMany(data: any[]): Promise<{ count: number }>;
}

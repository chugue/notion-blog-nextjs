import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { Result } from '@/shared/types/result';

export type GetVisitorInfoParams = {
  ipHash: string;
  todayKST: string;
  pathName: string;
  userAgent: string;
};

export interface VisitorInfoRepositoryPort {
  getVisitorInfoOrCreate: (
    { ipHash, todayKST, pathName, userAgent }: GetVisitorInfoParams,
    tx: Transaction
  ) => Promise<Result<VisitorInfo, Error>>;

  createVisitorInfo: (
    { ipHash, todayKST, pathName, userAgent }: GetVisitorInfoParams,
    tx: Transaction
  ) => Promise<Result<VisitorInfo, Error>>;

  updateVisitorPathname(
    data: VisitorInfo,
    pathName: string,
    todayKST: string,
    tx: Transaction
  ): Promise<Result<VisitorInfo, Error>>;
}

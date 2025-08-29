import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { Result } from '@/shared/types/result';

export type GetVisitorInfoParams = {
  ipHash: string;
  todayKST: string;
  pathname: string;
  userAgent: string;
};

export interface VisitorInfoRepositoryPort {
  getVisitorInfoOrCreate: (
    { ipHash, todayKST, pathname, userAgent }: GetVisitorInfoParams,
    tx: Transaction
  ) => Promise<Result<VisitorInfo, Error>>;

  createVisitorInfo: (
    { ipHash, todayKST, pathname, userAgent }: GetVisitorInfoParams,
    tx: Transaction
  ) => Promise<Result<VisitorInfo, Error>>;

  updateVisitorPathname(
    data: VisitorInfo,
    pathname: string,
    todayKST: string,
    tx: Transaction
  ): Promise<Result<VisitorInfo, Error>>;
}

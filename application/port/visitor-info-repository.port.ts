import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { Result } from '@/shared/types/result';

export interface VisitorInfoRepositoryPort {
  readonly getVisitorInfoOrCreate: (
    ipHash: string,
    date: string,
    pathname: string,
    userAgent: string
  ) => Promise<Result<VisitorInfo, Error>>;
}

import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { Result } from '@/shared/types/result';

export interface VisitorInfoRepositoryPort {
  readonly getVisitorInfo: (ipHash: string, date: string) => Promise<Result<VisitorInfo, Error>>;
}

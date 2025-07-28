import { TagInfoUseCase } from '@/application/ports/use-cases/tag-use-case';
import { TagInfoRepository } from '@/application/repositories/tag-repository';
import { createTagUseCaseImpl } from '@/application/use-cases/tag-use-case-impl';
import { createTagInfoRepositoryImpl } from '@/infrastructure/repositories/tag-info-repository-impl';
import { TagController } from '@/presentation/controllers/tag-controller';

export const createTagDependencies = () => {
  // 1. Infrastructure Layer (구체적 구현체)
  const tagRepository: TagInfoRepository = createTagInfoRepositoryImpl();

  // 2. Application Layer (비즈니스 로직)
  const tagUseCase: TagInfoUseCase = createTagUseCaseImpl(tagRepository);

  // 3. Presentation Layer (컨트롤러)
  const tagController = TagController(tagUseCase);

  return {
    tagController,
    tagUseCase,
    tagRepository,
  };
};

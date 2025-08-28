import { crawlingBotCheck } from '@/domain/utils/page-view.utils';
import { db } from '@/infrastructure/database/drizzle/drizzle';
import { PageViewUseCasePort } from '@/presentation/ports/page-view-usecase.port';
import { PageViewRepositoryPort } from '../port/page-view-repository.port';
import { SiteMetricsRepositoryPort } from '../port/site-metrics-repository.port';
import { VisitorInfoRepositoryPort } from '../port/visitor-info-repository.port';

export const createPageViewUseCaseAdapter = (
  pageViewRepo: PageViewRepositoryPort,
  visitorInfoRepo: VisitorInfoRepositoryPort,
  siteMetricRepo: SiteMetricsRepositoryPort
): PageViewUseCasePort => {
  return {
    addMainPageView: async (request: Promise<Headers>): Promise<void> => {
      const headers = await request;

      // 1. 사용자 정보 추출
      const ip = headers.get('x-forwarded-for') ?? 'unknown';
      const userAgent = headers.get('user-agent') ?? 'unknown';

      // 1-1. 크롤링 봇 검증
      const isCrawlingBot = crawlingBotCheck(userAgent);
      if (isCrawlingBot) return;

      // 1-2. IP 해시 생성
      const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
      const ipHash = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
        new Date()
      );

      const visitor = {
        ipHash: ipHash.toString(),
        todayKST: todayKST,
        pathName: 'main',
        userAgent: userAgent,
      };

      await db.transaction(async (tx) => {
        // 2. 사용자 정보 오늘 날짜 조회 - 없으면 생성
        const foundVisitor = await visitorInfoRepo.getVisitorInfoOrCreate(visitor, tx);
        if (!foundVisitor.success) {
          if (foundVisitor.error.message === 'Visitor already visited this page') return;
          throw foundVisitor.error;
        }

        const updatedVisitor = await visitorInfoRepo.updateVisitorPathname(
          foundVisitor.data,
          'main',
          todayKST,
          tx
        );
        if (!updatedVisitor.success) throw updatedVisitor.error;

        // 3. 오늘 날짜 현재 페이지 뷰 조회 - 없으면 생성
        const pageView = await pageViewRepo.getPageViewOrCreate(todayKST, 'main', 'main', tx);
        if (!pageView.success) throw pageView.error;

        // 4. 오늘 날짜 방문자 수 증가
        const updateResult = await pageViewRepo.updatePageView(pageView.data, tx);
        if (!updateResult.success) throw updateResult.error;

        // 5. VisitStats 업데이트
        const siteMetric = await siteMetricRepo.updateSiteMetric(todayKST, tx);
        if (!siteMetric.success) throw siteMetric.error;

        return;
      });
    },

    // TODO: 상세 페이지 뷰 추가
    addDetailPageView: async (pageId: string): Promise<void> => {
      const pageView = {
        notionPageId: 'main',
        pathname: '/',
        viewCount: 1,
      };
    },

    // TODO: 소개 페이지 뷰 추가
    addAboutPageView: async (pageId: string): Promise<void> => {},
  };
};

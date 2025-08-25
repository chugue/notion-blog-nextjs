import { crawlingBotCheck } from '@/domain/utils/page-view.utils';
import { PageViewUseCasePort } from '@/presentation/ports/page-view-usecase.port';
import { PageViewRepositoryPort } from '../port/page-view-repository.port';
import { VisitorInfoRepositoryPort } from '../port/visitor-info-repository.port';

export const createPageViewUseCaseAdapter = (
  pageViewRepo: PageViewRepositoryPort,
  visitorInfoRepo: VisitorInfoRepositoryPort
): PageViewUseCasePort => {
  return {
    // TODO: 메인 페이지 뷰 추가
    addMainPageView: async (request: Promise<Headers>): Promise<void> => {
      const headers = await request;

      // 1. 사용자 정보 추출
      const ip = headers.get('x-forwarded-for') ?? 'unknown';
      const userAgent = headers.get('user-agent') ?? 'unknown';
      const hashedIp = crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
      const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
        new Date()
      ); // "YYYY-MM-DD"

      // 1-1. 크롤링 봇 검증
      const isCrawlingBot = crawlingBotCheck(userAgent);

      if (isCrawlingBot) return;

      // 2. 사용자 정보 오늘 날짜 조회
      const visitorInfo = await visitorInfoRepo.getVisitorInfo(hashedIp.toString(), todayKST);

      // 2-1. 사용자 정보 없으면 오늘 날짜로 생성
      // 3. 오늘 날짜에 현재 방문 페이지 없으면 페이지 path 추가
      // 4. 오늘 날짜 현재 페이지 뷰 조회
      // 4-1. 현재 페이지 뷰가 없으면 오늘 날짜로 생성
      // 5. 오늘 날짜 방문자 수 증가

      const mainPageView = await pageViewRepo.getMainPageView();

      const pageView = {
        notionPageId: 'main',
        pathname: '/',
        viewCount: 1,
      };

      await pageViewRepository.addMainPageView(pageView);
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
    addAboutPageView: async (pageId: string): Promise<void> => {
      await pageViewRepository.addAboutPageView(pageId);
    },
  };
};

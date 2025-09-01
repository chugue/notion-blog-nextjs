import { hashIp } from '@/domain/utils/crypto.utils';
import { crawlingBotCheck } from '@/domain/utils/page-view.utils';
import { db } from '@/infrastructure/database/drizzle/drizzle';
import { PageViewUseCasePort } from '@/presentation/ports/page-view-usecase.port';
import { checkCookies } from '@/presentation/utils/cookie-utils';
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
      const ipHeader = headers.get('x-forwarded-for') ?? '';
      const ip = ipHeader.split(',')[0].trim() || 'unknown';
      const userAgent = headers.get('user-agent') ?? 'unknown';

      // 1-1. 크롤링 봇 검증
      const isCrawlingBot = crawlingBotCheck(userAgent);
      if (isCrawlingBot) return;

      // 1-2. IP 해시 생성
      const ipHash = await hashIp(ip);
      const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
        new Date()
      );

      const visitor = {
        ipHash: ipHash.toString(),
        todayKST: todayKST,
        pathname: '/',
        userAgent: userAgent,
      };

      await db.transaction(async (tx) => {
        // 2. 사용자 정보 오늘 날짜 조회 - 없으면 생성
        const foundVisitor = await visitorInfoRepo.getVisitorInfoOrCreate(visitor, tx);
        if (!foundVisitor.success) {
          if (foundVisitor.statusCode && foundVisitor.statusCode === 400) return;
          throw foundVisitor.error;
        }

        const updatedVisitor = await visitorInfoRepo.updateVisitorPathname(
          foundVisitor.data,
          '/',
          todayKST,
          tx
        );
        if (!updatedVisitor.success) throw updatedVisitor.error;

        // 3. 오늘 날짜 현재 페이지 뷰 조회 - 없으면 생성
        const pageView = await pageViewRepo.getPageViewOrCreate('main', '/', tx);
        if (!pageView.success) throw pageView.error;

        // 4. 오늘 날짜 방문자 수 증가
        const updateResult = await pageViewRepo.updatePageView(pageView.data, tx);
        if (!updateResult.success) throw updateResult.error;

        const isNewVisitor = await checkCookies();
        if (!isNewVisitor) return;

        // 5. VisitStats 업데이트
        const siteMetric = await siteMetricRepo.updateSiteMetric(todayKST, foundVisitor.data, tx);
        if (!siteMetric.success) throw siteMetric.error;
        return;
      });
    },

    addDetailPageView: async (request: Promise<Headers>, pageId: string): Promise<void> => {
      const headers = await request;

      // 1. 사용자 정보 추출
      const ipHeader = headers.get('x-forwarded-for') ?? '';
      const ip = ipHeader.split(',')[0].trim() || 'unknown';
      const userAgent = headers.get('user-agent') ?? 'unknown';
      const pathname = `blog/${pageId}`;

      // 1-1. 크롤링 봇 검증
      const isCrawlingBot = crawlingBotCheck(userAgent);
      if (isCrawlingBot) return;

      // 1-2. IP 해시 생성
      const ipHash = await hashIp(ip);
      const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
        new Date()
      );

      const visitor = {
        ipHash: ipHash.toString(),
        todayKST: todayKST,
        pathname,
        userAgent: userAgent,
      };

      await db.transaction(async (tx) => {
        // 2. 방문자 정보 확인 및 업데이트 - 중복 방문 검사
        const visitorInfo = await visitorInfoRepo.getVisitorInfoOrCreate(visitor, tx);
        if (!visitorInfo.success) {
          if (visitorInfo.statusCode === 400) return;
          throw visitorInfo.error;
        }

        // 3. 페이지 뷰 정보 확인 및 업데이트 (상세 페이지)
        const pageView = await pageViewRepo.getPageViewOrCreate(pageId, pathname, tx);
        if (!pageView.success) throw pageView.error;

        const updatedPageView = await pageViewRepo.updatePageView(pageView.data, tx);
        if (!updatedPageView.success) throw updatedPageView.error;

        // 4. 방문 기록 업데이트
        const updatedVisitorInfo = await visitorInfoRepo.updateVisitorPathname(
          visitorInfo.data,
          pathname,
          todayKST,
          tx
        );
        if (!updatedVisitorInfo.success) throw updatedVisitorInfo.error;

        const isNewVisitor = await checkCookies();
        if (!isNewVisitor) return;

        // 5. VisitStats 업데이트
        const siteMetric = await siteMetricRepo.updateSiteMetric(todayKST, visitorInfo.data, tx);
        if (!siteMetric.success) throw siteMetric.error;

        return;
      });
    },

    // TODO: 소개 페이지 뷰 추가 - 검증 하기
    addAboutPageView: async (
      request: Promise<Headers>,
      pageId: string = 'about'
    ): Promise<void> => {
      const headers = await request;

      // 1. 사용자 정보 추출
      const ipHeader = headers.get('x-forwarded-for') ?? '';
      const ip = ipHeader.split(',')[0].trim() || 'unknown';
      const userAgent = headers.get('user-agent') ?? 'unknown';
      const pathname = '/about';

      // 1-1. 크롤링 봇 검증
      const isCrawlingBot = crawlingBotCheck(userAgent);
      if (isCrawlingBot) return;

      // 1-2. IP 해시 생성
      const ipHash = await hashIp(ip);
      const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
        new Date()
      );

      const visitor = {
        ipHash: ipHash.toString(),
        todayKST: todayKST,
        pathname,
        userAgent: userAgent,
      };

      await db.transaction(async (tx) => {
        // 2. 방문자 정보 확인 및 업데이트 - 중복 방문 검사
        const visitorInfo = await visitorInfoRepo.getVisitorInfoOrCreate(visitor, tx);
        if (!visitorInfo.success) {
          if (visitorInfo.statusCode && visitorInfo.statusCode === 400) return;
          throw visitorInfo.error;
        }

        // 3. 페이지 뷰 정보 확인 및 업데이트 (소개 페이지)
        const pageView = await pageViewRepo.getPageViewOrCreate(pageId, pathname, tx);
        if (!pageView.success) throw pageView.error;

        const updatedPageView = await pageViewRepo.updatePageView(pageView.data, tx);
        if (!updatedPageView.success) throw updatedPageView.error;

        // 4. 방문 기록 업데이트
        const updatedVisitorInfo = await visitorInfoRepo.updateVisitorPathname(
          visitorInfo.data,
          pathname,
          todayKST,
          tx
        );
        if (!updatedVisitorInfo.success) throw updatedVisitorInfo.error;

        const isNewVisitor = await checkCookies();
        if (!isNewVisitor) return;

        // 5. VisitStats 업데이트
        const siteMetric = await siteMetricRepo.updateSiteMetric(todayKST, visitorInfo.data, tx);
        if (!siteMetric.success) throw siteMetric.error;

        return;
      });
    },
  };
};

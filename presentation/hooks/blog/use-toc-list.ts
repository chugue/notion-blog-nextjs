import { TocItem } from '@/app/(blog)/_components/TableOfContentsWrapper';
import { useEffect, useState } from 'react';

export const useTocList = () => {
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    const generateToc = () => {
      const notionContent = document.querySelector('.notion-page');
      if (!notionContent) return [];

      const headings = Array.from(
        notionContent.querySelectorAll('.notion-h1, .notion-h2, .notion-h3')
      );

      // 제목 요소를 TOC 항목으로 변환
      const tocItems: TocItem[] = [];
      const headingMap = new Map<number, TocItem[]>();

      headings.forEach((heading) => {
        const classList = Array.from(heading.classList);
        const headingClass = classList.find((cls) => cls.match(/^notion-h[1-3]$/));

        if (!headingClass) {
          return;
        }

        const level = parseInt(headingClass.replace('notion-h', ''));
        const linkElement = heading.querySelector('.notion-header-anchor');
        const titleElement = heading.querySelector('.notion-h-title');

        const headingText = linkElement?.getAttribute('title') || titleElement?.textContent || '';
        const headingId = linkElement?.getAttribute('id') || heading.getAttribute('data-id');

        if (!headingId || !headingText) {
          console.log('No valid id or text found, skipping');
          return;
        }

        const item: TocItem = {
          id: headingId,
          value: headingText,
          depth: level,
          children: [],
        };

        // 계층 구조 생성
        if (level === 1 || level === 2) {
          tocItems.push(item);
          headingMap.set(level, [item]);
        } else {
          // 상위 레벨 찾기
          for (let i = level - 1; i >= 1; i--) {
            const parentItems = headingMap.get(i);
            if (parentItems && parentItems.length > 0) {
              const parent = parentItems[parentItems.length - 1];
              parent.children.push(item);

              const currentLevelItems = headingMap.get(level) || [];
              headingMap.set(level, [...currentLevelItems, item]);
              break;
            }
          }
        }
      });

      return tocItems;
    };

    // DOM 변화를 감지하여 목차 업데이트
    const observer = new MutationObserver(() => {
      const tocItems = generateToc();
      if (tocItems.length > 0) {
        setToc(tocItems);
        observer.disconnect(); // 목차를 찾으면 감시 중단
      }
    });

    // 즉시 한 번 시도
    const initialToc = generateToc();
    if (initialToc.length > 0) {
      setToc(initialToc);
    } else {
      // NotionRenderer가 아직 렌더링되지 않았다면 감시 시작
      const target = document.querySelector('.notion-page') || document.body;
      if (target instanceof Node) {
        observer.observe(target, {
          childList: true,
          subtree: true,
        });
      }
    }

    // cleanup
    return () => observer.disconnect();
  }, []);

  return { toc };
};

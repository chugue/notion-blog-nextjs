export const toTagInfo = (tag: string): TagInfo => {
  tag = tag.toLowerCase();

  switch (tag) {
    case '전체':
      return {
        name: '전체',
        icon: `/icons/all.svg`,
        color: '#12d5b0',
        tagName: '전체',
      };

    case 'java':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#d3504a',
        tagName: 'Java',
      };

    case 'spring':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#6ab341',
        tagName: 'Spring',
      };

    case 'webapp':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#4695e9',
        tagName: 'WebApp',
      };

    case 'system':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#80b3e7',
        tagName: 'System',
      };

    case 'network':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#72d5eb',
        tagName: 'Network',
      };

    case 'docker':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#046abd',
        tagName: 'Docker',
      };

    case 'flutter':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#64c2ee',
        tagName: 'Flutter',
      };

    case 'javascript':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#f0db4f',
        tagName: 'JavaScript',
      };

    case 'http':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#6898db',
        tagName: 'HTTP',
      };

    case 'jquery':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#1d6ea6',
        tagName: 'jQuery',
      };

    case 'algorithm':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#f1ddd7',
        tagName: 'Algorithm',
      };

    case 'react':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#26c7e3',
        tagName: 'React',
      };

    case 'methodology':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#fadee3',
        tagName: 'Methodology',
      };

    case 'nestjs':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#de274b',
        tagName: 'NestJS',
      };

    case 'git':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#f4501f',
        tagName: 'Git',
      };

    case 'python':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#3b6c9b',
        tagName: 'Python',
      };

    case 'ajax':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#4597cf',
        tagName: 'AJAX',
      };

    case 'sql':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#aed730',
        tagName: 'SQL',
      };

    case 'css':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#1776b5',
        tagName: 'CSS',
      };

    case 'html':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#e44134',
        tagName: 'HTML',
      };

    case 'linux':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#fac706',
        tagName: 'Linux',
      };

    case 'nextjs':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#bfbfbf',
        tagName: 'NextJS',
      };

    case 'gsap':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#89c740',
        tagName: 'GSAP',
      };

    case 'codingtest':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#817dfe',
        tagName: 'CodingTest',
      };
    case 'portfolio':
      return {
        name: tag,
        icon: `/icons/${tag}.svg`,
        color: '#fc64b7',
        tagName: 'Portfolio',
      };
    case 'blockchain':
      return {
        name: tag,
        icon: `/icons/${tag}.png`,
        color: '#79d7bd',
        tagName: 'Blockchain',
      };

    default:
      return {
        name: 'unknown',
        icon: '/icons/default.svg',
        color: '#808080',
        tagName: 'unknown',
      };
  }
};

export type TagInfo = {
  name: string;
  icon: string;
  color: string;
  tagName: string;
};

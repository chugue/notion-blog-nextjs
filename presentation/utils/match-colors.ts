export const tagMatchColor = (tag: string): string => {
  switch (tag.toLowerCase()) {
    case '전체':
      return '#12d5b0';
    case 'java':
      return '#d3504a';

    case 'spring':
      return '#6ab341';

    case 'webapp':
      return '#4695e9';

    case 'system':
      return '#80b3e7';

    case 'network':
      return '#72d5eb';

    case 'docker':
      return '#046abd';

    case 'flutter':
      return '#64c2ee';

    case 'javascript':
      return '#f0db4f';

    case 'http':
      return '#6898db';

    case 'jquery':
      return '#1d6ea6';

    case 'algorithm':
      return '#f1ddd7';

    case 'react':
      return '#26c7e3';

    case 'methodology':
      return '#fadee3';

    case 'nestjs':
      return '#de274b';

    case 'git':
      return '#f4501f';

    case 'python':
      return '#3b6c9b';

    case 'ajax':
      return '#4597cf';

    case 'sql':
      return '#aed730';

    case 'css':
      return '#1776b5';

    case 'html':
      return '#e44134';

    case 'linux':
      return '#fac706';

    default:
      return '#808080';
  }
};

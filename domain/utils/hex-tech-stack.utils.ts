import { TechStackItem } from '../entities/hex-tech-stack';
import { TagFilterItem } from '../entities/post.entity';

export const toHexTechStackItem = (tagFilterItems: TagFilterItem[]): TechStackItem[] => {
  const techStackItems: TechStackItem[] = [];

  tagFilterItems.forEach((tagFilterItem) => {
    switch (tagFilterItem.name.toLowerCase()) {
      case '전체':
        techStackItems.push({
          name: '전체',
          icon: '/icons/all.svg',
          color: '#12d5b0',
          tagName: 'all',
        });
        break;
      case 'java':
        techStackItems.push({
          name: 'Java',
          icon: '/icons/java.svg',
          color: '#d3504a',
          tagName: 'java',
        });
        break;

      case 'spring':
        techStackItems.push({
          name: 'Spring',
          icon: '/icons/spring-boot.svg',
          color: '#6ab341',
          tagName: 'spring',
        });
        break;

      case 'webapp':
        techStackItems.push({
          name: 'WebApp',
          icon: '/icons/web-app.svg',
          color: '#4695e9',
          tagName: 'web-app',
        });
        break;

      case 'system':
        techStackItems.push({
          name: 'System',
          icon: '/icons/system.svg',
          color: '#80b3e7',
          tagName: 'system',
        });
        break;

      case 'network':
        techStackItems.push({
          name: 'Network',
          icon: '/icons/network.svg',
          color: '#72d5eb',
          tagName: 'network',
        });
        break;

      case 'docker':
        techStackItems.push({
          name: 'Docker',
          icon: '/icons/docker.svg',
          color: '#046abd',
          tagName: 'docker',
        });
        break;

      case 'flutter':
        techStackItems.push({
          name: 'Flutter',
          icon: '/icons/flutter.svg',
          color: '#64c2ee',
          tagName: 'flutter',
        });
        break;

      case 'javascript':
        techStackItems.push({
          name: 'JavaScript',
          icon: '/icons/javascript.svg',
          color: '#f0db4f',
          tagName: 'javascript',
        });
        break;

      case 'http':
        techStackItems.push({
          name: 'HTTP',
          icon: '/icons/http.svg',
          color: '#6898db',
          tagName: 'http',
        });
        break;

      case 'jquery':
        techStackItems.push({
          name: 'jQuery',
          icon: '/icons/j-query.svg',
          color: '#1d6ea6',
          tagName: 'jquery',
        });
        break;

      case 'algorithm':
        techStackItems.push({
          name: 'Algorithm',
          icon: '/icons/algorithm.svg',
          color: '#f1ddd7',
          tagName: 'algorithm',
        });
        break;

      case 'react':
        techStackItems.push({
          name: 'React',
          icon: '/icons/react.svg',
          color: '#26c7e3',
          tagName: 'react',
        });
        break;

      case 'methodology':
        techStackItems.push({
          name: 'Methodology',
          icon: '/icons/methodology.svg',
          color: '#fadee3',
          tagName: 'methodology',
        });
        break;

      case 'nestjs':
        techStackItems.push({
          name: 'NestJS',
          icon: '/icons/nestjs.svg',
          color: '#de274b',
          tagName: 'NestJS',
        });
        break;

      case 'git':
        techStackItems.push({
          name: 'Git',
          icon: '/icons/git.svg',
          color: '#f4501f',
          tagName: 'git',
        });
        break;

      case 'python':
        techStackItems.push({
          name: 'Python',
          icon: '/icons/python.svg',
          color: '#3b6c9b',
          tagName: 'python',
        });
        break;

      case 'ajax':
        techStackItems.push({
          name: 'AJAX',
          icon: '/icons/ajax.svg',
          color: '#4597cf',
          tagName: 'ajax',
        });
        break;

      case 'sql':
        techStackItems.push({
          name: 'SQL',
          icon: '/icons/sql.svg',
          color: '#aed730',
          tagName: 'sql',
        });
        break;

      case 'css':
        techStackItems.push({
          name: 'CSS',
          icon: '/icons/css.svg',
          color: '#1776b5',
          tagName: 'css',
        });
        break;

      case 'html':
        techStackItems.push({
          name: 'HTML',
          icon: '/icons/html.svg',
          color: '#e44134',
          tagName: 'html',
        });
        break;

      case 'linux':
        techStackItems.push({
          name: 'Linux',
          icon: '/icons/linux.svg',
          color: '#fac706',
          tagName: 'linux',
        });
        break;

      default:
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/default.svg',
          color: '#808080',
          tagName: tagFilterItem.name.toLowerCase(),
        });
        break;
    }
  });

  return techStackItems;
};

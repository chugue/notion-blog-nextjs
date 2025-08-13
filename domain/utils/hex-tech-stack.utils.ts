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
          name: tagFilterItem.name,
          icon: '/icons/java.svg',
          color: '#d3504a',
          tagName: 'java',
        });
        break;

      case 'spring':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/spring-boot.svg',
          color: '#6ab341',
          tagName: 'spring',
        });
        break;

      case 'webapp':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/web-app.svg',
          color: '#4695e9',
          tagName: 'web-app',
        });
        break;

      case 'system':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/system.svg',
          color: '#80b3e7',
          tagName: 'system',
        });
        break;

      case 'network':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/network.svg',
          color: '#72d5eb',
          tagName: 'network',
        });
        break;

      case 'docker':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/docker.svg',
          color: '#046abd',
          tagName: 'docker',
        });
        break;

      case 'flutter':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/flutter.svg',
          color: '#64c2ee',
          tagName: 'flutter',
        });
        break;

      case 'javascript':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/javascript.svg',
          color: '#f0db4f',
          tagName: 'javascript',
        });
        break;

      case 'http':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/http.svg',
          color: '#6898db',
          tagName: 'http',
        });
        break;

      case 'jquery':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/j-query.svg',
          color: '#1d6ea6',
          tagName: 'jquery',
        });
        break;

      case 'algorithm':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/algorithm.svg',
          color: '#f1ddd7',
          tagName: 'algorithm',
        });
        break;

      case 'react':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/react.svg',
          color: '#26c7e3',
          tagName: 'react',
        });
        break;

      case 'methodology':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/methodology.svg',
          color: '#fadee3',
          tagName: 'methodology',
        });
        break;

      case 'nestjs':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/nestjs.svg',
          color: '#de274b',
          tagName: 'NestJS',
        });
        break;

      case 'git':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/git.svg',
          color: '#f4501f',
          tagName: 'git',
        });
        break;

      case 'python':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/python.svg',
          color: '#3b6c9b',
          tagName: 'python',
        });
        break;

      case 'ajax':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/ajax.svg',
          color: '#4597cf',
          tagName: 'ajax',
        });
        break;

      case 'sql':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/sql.svg',
          color: '#aed730',
          tagName: 'sql',
        });
        break;

      case 'css':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/css.svg',
          color: '#1776b5',
          tagName: 'css',
        });
        break;

      case 'html':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/html.svg',
          color: '#e44134',
          tagName: 'html',
        });
        break;

      case 'linux':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/linux.svg',
          color: '#fac706',
          tagName: 'linux',
        });
        break;
      case 'nextjs':
        techStackItems.push({
          name: tagFilterItem.name,
          icon: '/icons/nextjs.svg',
          color: '#484647',
          tagName: 'nextjs',
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

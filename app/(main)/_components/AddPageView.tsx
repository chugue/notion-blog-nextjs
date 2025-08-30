'use client';

import { useEffect } from 'react';

const AddPageView = ({ pageId }: { pageId: string }) => {
  useEffect(() => {
    if (pageId) {
      switch (pageId) {
        case 'main':
          fetch(`/api/page-view/main`, { method: 'POST' });
          break;
        default:
          fetch(`/api/page-view/blog/${pageId}`, { method: 'POST' });
          break;
      }
    }
  }, []);

  return null;
};

export default AddPageView;

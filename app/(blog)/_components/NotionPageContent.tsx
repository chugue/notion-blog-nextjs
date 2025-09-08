'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import CustomCodeBlock from './CustomCodeBlock';

const NotionPageContent = ({ recordMap }: { recordMap: ExtendedRecordMap }) => {
  return (
    <div className="flex">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={true}
        disableHeader={true}
        previewImages={true}
        mapPageUrl={() => '#'}
        components={{
          nextImage: Image,
          nextLink: Link,
          Code: CustomCodeBlock,
        }}
      />
    </div>
  );
};

export default NotionPageContent;

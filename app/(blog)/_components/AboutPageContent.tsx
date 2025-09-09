'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';

const AboutPageContent = ({ recordMap }: { recordMap: ExtendedRecordMap }) => {
  return (
    <div className="flex">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={true}
        previewImages={true}
        mapPageUrl={() => '#'}
        components={{
          nextImage: Image,
          nextLink: Link,
        }}
      />
    </div>
  );
};

export default AboutPageContent;

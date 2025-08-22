'use client';

import React, { use } from 'react';
import * as notionType from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import Image from 'next/image';
import Link from 'next/link';
import CustomCodeBlock from './CustomCodeBlock';

const NotionPageContent = ({ recordMap }: { recordMap: notionType.ExtendedRecordMap }) => {
  return (
    <div className="flex">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={true}
        disableHeader={true}
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

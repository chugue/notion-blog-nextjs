'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import Image, { ImageProps } from 'next/image';
import { CSSProperties, useState } from 'react';

type NotionImageProps = Omit<ImageProps, 'onLoad' | 'onError'> & {
    style?: CSSProperties;
};

const NotionImage = ({ style, className, ...props }: NotionImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // wrapper 스타일 - 로딩 중에는 최소 높이 확보
    const wrapperStyle: CSSProperties = {
        ...style,
        position: 'relative',
        width: '100%',
        minHeight: isLoading ? '400px' : undefined,
    };

    if (hasError) {
        return (
            <div
                style={{ ...wrapperStyle, minHeight: '200px' }}
                className="bg-muted flex items-center justify-center rounded-lg"
            >
                <div className="text-muted-foreground text-center">
                    <svg
                        className="mx-auto h-8 w-8 opacity-50"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                        />
                    </svg>
                    <p className="mt-2 text-xs">이미지를 불러올 수 없습니다</p>
                </div>
            </div>
        );
    }

    return (
        <div style={wrapperStyle}>
            {/* 스켈레톤 */}
            {isLoading && <Skeleton className="absolute inset-0 z-10 min-h-[200px] rounded-lg" />}

            {/* 실제 이미지 */}
            <Image
                {...props}
                width={0}
                height={0}
                sizes="100vw"
                className={`${className || ''} rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                style={{ width: '100%', height: 'auto' }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
            />
        </div>
    );
};

export default NotionImage;

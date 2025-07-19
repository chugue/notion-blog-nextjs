import { getPostById } from '@/lib/services/notion';
import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OgImage({ params }: { params: { id: string } }) {
  const { post } = await getPostById(params.id);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: 'linear-gradient(to bottom, #000000, #333333)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          게시물을 찾을 수 없습니다
        </div>
      ),
      { ...size }
    );
  }

  const tagString = post.language?.join(', ') || '';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(to bottom, #000000, #333333)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: '#aaaaaa',
              marginBottom: 20,
            }}
          >
            Stephen&apos;s 기술블로그
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              marginBottom: 30,
              maxWidth: '80%',
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 24,
            color: '#aaaaaa',
          }}
        >
          <div>{post.date}</div>
          <div>{tagString}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

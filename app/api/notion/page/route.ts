import { notionAPI } from '@/infrastructure/database/external-api/notion-client';
import { Result } from '@/shared/types/result';
import { NextRequest, NextResponse } from 'next/server';
import { ExtendedRecordMap } from 'notion-types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const GET = async (
  request: NextRequest
): Promise<NextResponse<Result<ExtendedRecordMap>>> => {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get('pageId');

  if (!pageId) {
    return NextResponse.json(
      { success: false, error: new Error('Page ID is required') },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const result = await notionAPI.getPage(pageId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: new Error('Page not found') },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: new Error(String(err)) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
};

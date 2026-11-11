import { NextResponse } from 'next/server';

export const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

/** Logs the real cause server-side and answers with a generic 502. */
export function upstreamError(context: string, error: unknown) {
  console.error(`${context}:`, error);
  return jsonError('Upstream service unavailable', 502);
}

import { NextResponse } from 'next/server';
import { metricsRegistry } from '@/core/metrics';

export async function GET() {
  try {
    const metrics = await metricsRegistry.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': metricsRegistry.contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error while collecting metrics' },
      { status: 500 }
    );
  }
}

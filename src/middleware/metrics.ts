import { NextRequest, NextResponse } from 'next/server';
import { httpRequestsTotal, httpRequestDuration } from '~/lib/metrics';

export function metricsMiddleware(request: NextRequest) {
  const start = Date.now();
  const route = request.nextUrl.pathname;
  const method = request.method;

  return NextResponse.next().then((response) => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = response.status.toString();

    // Record metrics
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);

    return response;
  });
}

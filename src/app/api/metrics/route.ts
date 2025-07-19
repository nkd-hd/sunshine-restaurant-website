import { collectDefaultMetrics, register } from 'prom-client';
import { updateSystemMetrics } from '~/lib/metrics';

// Collect default metrics (Node.js process metrics)
collectDefaultMetrics({
  prefix: 'nodejs_',
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

export async function GET() {
  try {
    // Update system metrics before serving
    updateSystemMetrics();
    
    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: { 
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new Response('Error generating metrics', { status: 500 });
  }
}

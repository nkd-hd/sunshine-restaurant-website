import { Counter, Gauge, Histogram, register } from 'prom-client';

// HTTP Request metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Database metrics
export const databaseConnectionsActive = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

export const databaseQueriesTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
});

// Business metrics
export const eventBookingsTotal = new Counter({
  name: 'event_bookings_total',
  help: 'Total number of event bookings',
  labelNames: ['event_id', 'status'],
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
});

export const eventsCreatedTotal = new Counter({
  name: 'events_created_total',
  help: 'Total number of events created',
  labelNames: ['category'],
});

export const paymentTransactionsTotal = new Counter({
  name: 'payment_transactions_total',
  help: 'Total number of payment transactions',
  labelNames: ['provider', 'status'],
});

export const paymentAmountTotal = new Counter({
  name: 'payment_amount_total',
  help: 'Total payment amount processed',
  labelNames: ['provider', 'currency'],
});

// System metrics
export const memoryUsage = new Gauge({
  name: 'nodejs_memory_usage_bytes',
  help: 'Node.js memory usage in bytes',
  labelNames: ['type'],
});

export const cpuUsage = new Gauge({
  name: 'nodejs_cpu_usage_percent',
  help: 'Node.js CPU usage percentage',
});

// Register all metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(databaseConnectionsActive);
register.registerMetric(databaseQueriesTotal);
register.registerMetric(databaseQueryDuration);
register.registerMetric(eventBookingsTotal);
register.registerMetric(activeUsers);
register.registerMetric(eventsCreatedTotal);
register.registerMetric(paymentTransactionsTotal);
register.registerMetric(paymentAmountTotal);
register.registerMetric(memoryUsage);
register.registerMetric(cpuUsage);

// Function to update system metrics
export function updateSystemMetrics() {
  const memUsage = process.memoryUsage();
  memoryUsage.set({ type: 'rss' }, memUsage.rss);
  memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
  memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
  memoryUsage.set({ type: 'external' }, memUsage.external);
  
  // Get CPU usage (this is a simplified version)
  const startUsage = process.cpuUsage();
  setTimeout(() => {
    const currentUsage = process.cpuUsage(startUsage);
    const cpuPercent = (currentUsage.user + currentUsage.system) / 1000000 * 100;
    cpuUsage.set(cpuPercent);
  }, 100);
}

// Update system metrics every 30 seconds
setInterval(updateSystemMetrics, 30000);

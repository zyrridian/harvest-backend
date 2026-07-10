import * as client from 'prom-client';

// Collect default metrics (CPU, Memory, etc.)
client.collectDefaultMetrics();

// Define custom metrics
export const activeSocketConnections = new client.Gauge({
  name: 'active_socket_connections',
  help: 'Total number of active Socket.IO connections',
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  // Default buckets for request duration (in ms)
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
});

export const metricsRegistry = client.register;

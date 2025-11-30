import Redis from 'ioredis';
import 'dotenv/config';

export const redis = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Upstash Redis connected successfully');
});

redis.on('error', err => {
  console.error('❌ Redis connection error:', err);
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

process.on('SIGINT', async () => {
  await redis.quit();
  console.log('Redis connection closed');
  process.exit(0);
});

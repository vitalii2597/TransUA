import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class GpsService {
  private readonly logger = new Logger(GpsService.name);
  private redis: Redis | null = null;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new Redis(redisUrl, { lazyConnect: true });
      this.redis.connect().catch(() => {
        this.logger.warn('Redis not available — GPS positions will not be persisted');
        this.redis = null;
      });
    } else {
      this.logger.warn('REDIS_URL not set — GPS positions will not be persisted');
    }
  }

  async storePosition(tripId: string, lat: number, lng: number): Promise<void> {
    if (!this.redis) return;
    try {
      const key = `gps:trip:${tripId}`;
      const value = JSON.stringify({ lat, lng, updatedAt: new Date().toISOString() });
      await this.redis.set(key, value, 'EX', 3600); // expire after 1h
    } catch {
      this.logger.warn(`Failed to store GPS position for trip ${tripId}`);
    }
  }

  async getPosition(tripId: string): Promise<{ lat: number; lng: number; updatedAt: string } | null> {
    if (!this.redis) return null;
    try {
      const raw = await this.redis.get(`gps:trip:${tripId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

// lib/rate-limit.ts
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Redisクライアントの接続設定
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 翻訳用リミッター：1日10回まで（毎日0時にリセットされるFixed Window）
export const translationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "1 d"),
  analytics: true,
  prefix: "ratelimit:translation",
});

// 手紙送信用リミッター：1時間に5通まで（直近1時間のバースト送信を防ぐSliding Window）
export const letterRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:letter",
});
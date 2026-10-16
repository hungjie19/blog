/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'photoswipe-dynamic-caption-plugin';

interface Window {
  umami?: { track: (event: string, data?: Record<string, string>) => void };
}

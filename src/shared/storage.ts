import type { PolishStyle, StorageConfig } from './types';
import { STORAGE_KEYS, DEFAULT_STYLE, DEFAULT_API_ENDPOINT } from './constants';

/**
 * 获取 API Key
 */
export async function getApiKey(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.API_KEY);
  return result[STORAGE_KEYS.API_KEY] || '';
}

/**
 * 保存 API Key
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: apiKey });
}

/**
 * 获取 API 地址
 */
export async function getApiEndpoint(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.API_ENDPOINT);
  return result[STORAGE_KEYS.API_ENDPOINT] || DEFAULT_API_ENDPOINT;
}

/**
 * 保存 API 地址
 */
export async function saveApiEndpoint(apiEndpoint: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.API_ENDPOINT]: apiEndpoint });
}

/**
 * 获取默认风格
 */
export async function getDefaultStyle(): Promise<PolishStyle> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.DEFAULT_STYLE);
  return result[STORAGE_KEYS.DEFAULT_STYLE] || DEFAULT_STYLE;
}

/**
 * 保存默认风格
 */
export async function saveDefaultStyle(style: PolishStyle): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.DEFAULT_STYLE]: style });
}

/**
 * 获取完整配置
 */
export async function getStorageConfig(): Promise<StorageConfig> {
  const [apiKey, apiEndpoint, defaultStyle] = await Promise.all([
    getApiKey(),
    getApiEndpoint(),
    getDefaultStyle(),
  ]);
  return { apiKey, apiEndpoint, defaultStyle };
}

/**
 * 检查 API Key 是否已配置
 */
export async function hasApiKey(): Promise<boolean> {
  const apiKey = await getApiKey();
  return apiKey.trim().length > 0;
}

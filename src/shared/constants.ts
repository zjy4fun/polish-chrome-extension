import type { PolishStyle } from './types';

/**
 * OpenAI API 配置
 */
export const DEFAULT_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
export const OPENAI_MODEL = 'gpt-4.1';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 600;
export const REQUEST_TIMEOUT_MS = 15000;

/**
 * 风格配置
 */
export interface StyleConfig {
  id: PolishStyle;
  label: string;
  labelEn: string;
  systemPrompt: string;
}

export const POLISH_STYLES: Record<PolishStyle, StyleConfig> = {
  formal: {
    id: 'formal',
    label: '正式',
    labelEn: 'Formal',
    systemPrompt: '你是一个专业文本润色专家。请将用户提供的内容改写为正式、得体、逻辑清晰的表达，适合商务或学术场景。只返回润色后的文本，不要添加任何解释或说明。',
  },
  casual: {
    id: 'casual',
    label: '口语',
    labelEn: 'Casual',
    systemPrompt: '你是一个文案专家。请将用户提供的内容改写为轻松自然、通俗易懂的口语化表达，保持亲切感。只返回润色后的文本，不要添加任何解释或说明。',
  },
  concise: {
    id: 'concise',
    label: '简洁',
    labelEn: 'Concise',
    systemPrompt: '你是一个精简文案专家。请将用户提供的内容精简为更简洁有力的表达，去除冗余，保留核心意思。只返回润色后的文本，不要添加任何解释或说明。',
  },
};

/**
 * 默认配置
 */
export const DEFAULT_STYLE: PolishStyle = 'formal';

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  API_KEY: 'polish_api_key',
  API_ENDPOINT: 'polish_api_endpoint',
  DEFAULT_STYLE: 'polish_default_style',
} as const;

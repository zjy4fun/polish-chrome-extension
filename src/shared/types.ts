/**
 * 优化风格类型
 */
export type PolishStyle = 'formal' | 'concise' | 'commit';

/**
 * 消息类型定义
 */
export interface PolishRequest {
  type: 'POLISH_REQUEST';
  text: string;
  style: PolishStyle;
}

export interface PolishResponse {
  type: 'POLISH_RESPONSE';
  success: boolean;
  result?: string;
  error?: PolishError;
}

export interface TriggerPolishMessage {
  type: 'TRIGGER_POLISH';
}

export type MessageType = PolishRequest | PolishResponse | TriggerPolishMessage;

/**
 * 错误类型
 */
export interface PolishError {
  code: 'NO_API_KEY' | 'API_ERROR' | 'TIMEOUT' | 'EMPTY_TEXT' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  statusCode?: number;
}

/**
 * 浮窗状态
 */
export type FloatingPanelState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 存储配置
 */
export interface StorageConfig {
  apiKey: string;
  apiEndpoint: string;
  defaultStyle: PolishStyle;
}

/**
 * API 响应类型
 */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

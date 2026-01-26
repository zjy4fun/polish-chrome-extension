import type {
  PolishRequest,
  PolishResponse,
  PolishStyle,
  PolishError,
  ChatCompletionResponse,
} from '@src/shared/types';
import {
  OPENAI_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
  REQUEST_TIMEOUT_MS,
  POLISH_STYLES,
} from '@src/shared/constants';
import { getApiKey, getApiEndpoint } from '@src/shared/storage';

console.log('[Polish] Background script loaded');

/**
 * 调用 ChatGPT API 进行文本润色
 */
async function polishText(text: string, style: PolishStyle): Promise<string> {
  const [apiKey, apiEndpoint] = await Promise.all([
    getApiKey(),
    getApiEndpoint(),
  ]);

  if (!apiKey) {
    throw createPolishError('NO_API_KEY', '请先配置 API Key');
  }

  if (!text.trim()) {
    throw createPolishError('EMPTY_TEXT', '请先输入文本');
  }

  const styleConfig = POLISH_STYLES[style];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: styleConfig.systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      throw createPolishError(
        'API_ERROR',
        getApiErrorMessage(response.status, errorBody),
        response.status
      );
    }

    const data: ChatCompletionResponse = await response.json();
    const resultText = data.choices?.[0]?.message?.content?.trim();

    if (!resultText) {
      throw createPolishError('API_ERROR', 'API 返回结果为空');
    }

    return resultText;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw createPolishError('TIMEOUT', '请求超时，请重试');
    }

    if (isPolishError(error)) {
      throw error;
    }

    throw createPolishError(
      'NETWORK_ERROR',
      `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 创建错误对象
 */
function createPolishError(
  code: PolishError['code'],
  message: string,
  statusCode?: number
): PolishError {
  return { code, message, statusCode };
}

/**
 * 检查是否为 PolishError
 */
function isPolishError(error: unknown): error is PolishError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * 获取 API 错误消息
 */
function getApiErrorMessage(statusCode: number, errorBody: string): string {
  switch (statusCode) {
    case 401:
      return 'API Key 无效，请检查配置';
    case 429:
      return 'API 请求过于频繁，请稍后重试';
    case 500:
    case 502:
    case 503:
      return 'OpenAI 服务暂时不可用，请稍后重试';
    default:
      try {
        const parsed = JSON.parse(errorBody);
        return parsed.error?.message || `API 错误 (${statusCode})`;
      } catch {
        return `API 错误 (${statusCode})`;
      }
  }
}

/**
 * 消息监听器
 */
chrome.runtime.onMessage.addListener(
  (
    message: PolishRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: PolishResponse) => void
  ) => {
    if (message.type === 'POLISH_REQUEST') {
      handlePolishRequest(message, sendResponse);
      return true; // 保持消息通道打开，等待异步响应
    }
    return false;
  }
);

/**
 * 处理润色请求
 */
async function handlePolishRequest(
  request: PolishRequest,
  sendResponse: (response: PolishResponse) => void
): Promise<void> {
  try {
    const result = await polishText(request.text, request.style);
    sendResponse({
      type: 'POLISH_RESPONSE',
      success: true,
      result,
    });
  } catch (error) {
    const polishError = isPolishError(error)
      ? error
      : createPolishError('UNKNOWN', '未知错误');

    sendResponse({
      type: 'POLISH_RESPONSE',
      success: false,
      error: polishError,
    });
  }
}

/**
 * 初始化右键菜单
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'polish-selection',
    title: '润色选中文本',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'polish-editable',
    title: '润色输入框内容',
    contexts: ['editable'],
  });

  console.log('[Polish] Context menus created');
});

/**
 * 右键菜单点击处理
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'polish-selection' || info.menuItemId === 'polish-editable') {
    // 向 content script 发送触发消息
    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_POLISH' });
  }
});

/**
 * 快捷键监听
 */
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'trigger-polish') {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, { type: 'TRIGGER_POLISH' });
    }
  }
});

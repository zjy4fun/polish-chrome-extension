import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import type {
  FloatingPanelState,
  PolishStyle,
  PolishRequest,
  PolishResponse,
  PolishError,
  TriggerPolishMessage,
} from '@src/shared/types';
import { getDefaultStyle } from '@src/shared/storage';
import { FloatingPanel } from './components/FloatingPanel';
import { floatingPanelStyles } from './components/FloatingPanelStyles';
import {
  isSafeInput,
  getInputText,
  setInputText,
  getElementPosition,
} from './utils/inputFilter';

console.log('[Polish] Content script loaded');

/**
 * 全局状态
 */
let currentInputElement: HTMLElement | null = null;
let shadowHost: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let reactRoot: Root | null = null;

let panelState: FloatingPanelState = 'idle';
let originalText = '';
let polishedText = '';
let currentError: PolishError | null = null;
let currentStyle: PolishStyle = 'formal';

/**
 * 初始化 Shadow DOM 容器
 */
function initShadowContainer(): void {
  if (shadowHost) return;

  shadowHost = document.createElement('div');
  shadowHost.id = 'polish-shadow-host';
  shadowHost.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 2147483647;';
  document.body.appendChild(shadowHost);

  shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

  // 注入样式
  const styleElement = document.createElement('style');
  styleElement.textContent = floatingPanelStyles;
  shadowRoot.appendChild(styleElement);

  // 创建 React 挂载点
  const mountPoint = document.createElement('div');
  mountPoint.id = 'polish-mount';
  shadowRoot.appendChild(mountPoint);

  reactRoot = createRoot(mountPoint);
}

/**
 * 渲染浮窗
 */
function renderPanel(): void {
  if (!reactRoot || !currentInputElement) return;

  const position = getElementPosition(currentInputElement);
  const panelPosition = {
    top: position.top + position.height + 8,
    left: position.left,
  };

  reactRoot.render(
    <FloatingPanel
      state={panelState}
      originalText={originalText}
      polishedText={polishedText}
      error={currentError}
      currentStyle={currentStyle}
      position={panelPosition}
      onAccept={handleAccept}
      onClose={handleClose}
      onRetry={handleRetry}
      onStyleChange={handleStyleChange}
    />
  );
}

/**
 * 处理接受操作
 */
function handleAccept(): void {
  if (currentInputElement && polishedText) {
    setInputText(currentInputElement, polishedText);
  }
  handleClose();
}

/**
 * 处理关闭操作
 */
function handleClose(): void {
  panelState = 'idle';
  originalText = '';
  polishedText = '';
  currentError = null;
  renderPanel();
}

/**
 * 处理重试操作
 */
function handleRetry(): void {
  if (originalText) {
    triggerPolish();
  }
}

/**
 * 处理风格切换
 */
function handleStyleChange(style: PolishStyle): void {
  currentStyle = style;
  renderPanel();

  // 如果已有文本，自动重新润色
  if (originalText && panelState !== 'loading') {
    triggerPolish();
  }
}

/**
 * 触发润色
 */
async function triggerPolish(): Promise<void> {
  if (!currentInputElement) {
    console.log('[Polish] No active input element');
    return;
  }

  const text = getInputText(currentInputElement);
  if (!text.trim()) {
    panelState = 'error';
    currentError = { code: 'EMPTY_TEXT', message: '请先输入文本' };
    renderPanel();
    return;
  }

  originalText = text;
  panelState = 'loading';
  currentError = null;
  polishedText = '';
  renderPanel();

  try {
    const request: PolishRequest = {
      type: 'POLISH_REQUEST',
      text: originalText,
      style: currentStyle,
    };

    const response = await chrome.runtime.sendMessage<PolishRequest, PolishResponse>(request);

    if (response.success && response.result) {
      panelState = 'success';
      polishedText = response.result;
    } else {
      panelState = 'error';
      currentError = response.error || { code: 'UNKNOWN', message: '未知错误' };
    }
  } catch (error) {
    panelState = 'error';
    currentError = {
      code: 'NETWORK_ERROR',
      message: `通信错误: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }

  renderPanel();
}

/**
 * 跟踪当前焦点的输入元素
 */
function trackFocusedInput(): void {
  document.addEventListener('focusin', (event) => {
    const target = event.target as Element;
    if (isSafeInput(target)) {
      currentInputElement = target;
    }
  });

  document.addEventListener('focusout', (event) => {
    // 延迟清除，避免点击浮窗时丢失引用
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (!isSafeInput(activeElement)) {
        // 保留最后一个有效的输入元素引用
      }
    }, 100);
  });
}

/**
 * 监听来自 background 的消息
 */
function listenForMessages(): void {
  chrome.runtime.onMessage.addListener(
    (message: TriggerPolishMessage, _sender, sendResponse) => {
      if (message.type === 'TRIGGER_POLISH') {
        // 检查当前焦点元素
        const activeElement = document.activeElement;
        if (isSafeInput(activeElement)) {
          currentInputElement = activeElement;
        }

        if (currentInputElement) {
          // 加载默认风格
          getDefaultStyle().then((style) => {
            currentStyle = style;
            triggerPolish();
          });
        } else {
          console.log('[Polish] No valid input element focused');
        }

        sendResponse({ received: true });
      }
      return false;
    }
  );
}

/**
 * 初始化
 */
function init(): void {
  initShadowContainer();
  trackFocusedInput();
  listenForMessages();
  console.log('[Polish] Content script initialized');
}

// 启动
init();

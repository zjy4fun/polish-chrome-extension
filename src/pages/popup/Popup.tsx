import React, { useState, useEffect } from 'react';
import type { PolishStyle } from '@src/shared/types';
import { POLISH_STYLES } from '@src/shared/constants';
import {
  hasApiKey,
  getDefaultStyle,
  saveDefaultStyle,
} from '@src/shared/storage';

export default function Popup(): React.ReactElement {
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<PolishStyle>('formal');
  const [isLoading, setIsLoading] = useState(true);
  const [triggerStatus, setTriggerStatus] = useState<'idle' | 'sent'>('idle');

  useEffect(() => {
    loadState();
  }, []);

  async function loadState(): Promise<void> {
    try {
      const [hasKey, style] = await Promise.all([
        hasApiKey(),
        getDefaultStyle(),
      ]);
      setIsApiKeyConfigured(hasKey);
      setCurrentStyle(style);
    } catch (error) {
      console.error('Failed to load state:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStyleChange(style: PolishStyle): Promise<void> {
    setCurrentStyle(style);
    await saveDefaultStyle(style);
  }

  async function handleTriggerPolish(): Promise<void> {
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (activeTab?.id) {
        await chrome.tabs.sendMessage(activeTab.id, { type: 'TRIGGER_POLISH' });
        setTriggerStatus('sent');
        setTimeout(() => window.close(), 500);
      }
    } catch (error) {
      console.error('Failed to trigger polish:', error);
    }
  }

  function handleOpenOptions(): void {
    chrome.runtime.openOptionsPage();
  }

  const styleOptions = Object.values(POLISH_STYLES);

  if (isLoading) {
    return (
      <div className="popup-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* 头部 */}
      <header className="popup-header">
        <div className="popup-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">Polish</span>
        </div>
        <button
          className="settings-btn"
          onClick={handleOpenOptions}
          aria-label="设置"
        >
          ⚙️
        </button>
      </header>

      {/* API Key 状态 */}
      <div className={`api-status ${isApiKeyConfigured ? 'configured' : 'not-configured'}`}>
        {isApiKeyConfigured ? (
          <>
            <span className="status-icon">✓</span>
            <span>API Key 已配置</span>
          </>
        ) : (
          <>
            <span className="status-icon">!</span>
            <span>请先配置 API Key</span>
            <button className="configure-btn" onClick={handleOpenOptions}>
              去配置
            </button>
          </>
        )}
      </div>

      {/* 风格选择 */}
      <section className="style-section">
        <h3>润色风格</h3>
        <div className="style-buttons">
          {styleOptions.map((style) => (
            <button
              key={style.id}
              className={`style-btn ${currentStyle === style.id ? 'active' : ''}`}
              onClick={() => handleStyleChange(style.id)}
            >
              {style.label}
            </button>
          ))}
        </div>
      </section>

      {/* 触发按钮 */}
      <button
        className="trigger-btn"
        onClick={handleTriggerPolish}
        disabled={!isApiKeyConfigured || triggerStatus === 'sent'}
      >
        {triggerStatus === 'sent' ? '已触发 ✓' : '润色当前输入框'}
      </button>

      {/* 快捷键提示 */}
      <div className="shortcut-hint">
        快捷键: <kbd>Alt + O</kbd>
      </div>
    </div>
  );
}

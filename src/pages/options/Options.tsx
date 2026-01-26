import React, { useState, useEffect } from 'react';
import type { PolishStyle } from '@src/shared/types';
import { POLISH_STYLES } from '@src/shared/constants';
import {
  getApiKey,
  saveApiKey,
  getApiEndpoint,
  saveApiEndpoint,
  getDefaultStyle,
  saveDefaultStyle,
} from '@src/shared/storage';
import { DEFAULT_API_ENDPOINT } from '@src/shared/constants';

export default function Options(): React.ReactElement {
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [defaultStyle, setDefaultStyle] = useState<PolishStyle>('formal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings(): Promise<void> {
    try {
      const [savedApiKey, savedApiEndpoint, savedStyle] = await Promise.all([
        getApiKey(),
        getApiEndpoint(),
        getDefaultStyle(),
      ]);
      setApiKey(savedApiKey);
      setApiEndpoint(savedApiEndpoint);
      setDefaultStyle(savedStyle);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const endpointToSave = apiEndpoint.trim() || DEFAULT_API_ENDPOINT;
      await Promise.all([
        saveApiKey(apiKey.trim()),
        saveApiEndpoint(endpointToSave),
        saveDefaultStyle(defaultStyle),
      ]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  const styleOptions = Object.values(POLISH_STYLES);

  if (isLoading) {
    return (
      <div className="options-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>Polish 设置</h1>
        <p className="options-subtitle">配置你的文本润色助手</p>
      </header>

      <main className="options-main">
        {/* API Key 设置 */}
        <section className="options-section">
          <h2>API Key</h2>
          <p className="section-description">
            输入你的 OpenAI API Key，用于调用 ChatGPT 进行文本润色。
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              获取 API Key
            </a>
          </p>
          <div className="input-group">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="api-key-input"
              autoComplete="off"
            />
          </div>
          <p className="section-note">
            API Key 仅保存在本地浏览器中，不会上传到任何服务器。
          </p>
        </section>

        {/* API 地址设置 */}
        <section className="options-section">
          <h2>API 地址</h2>
          <p className="section-description">
            自定义 API 地址，支持 OpenAI 兼容的代理服务。留空则使用官方地址。
          </p>
          <div className="input-group">
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder={DEFAULT_API_ENDPOINT}
              className="api-key-input"
              autoComplete="off"
            />
          </div>
          <p className="section-note">
            默认地址: {DEFAULT_API_ENDPOINT}
          </p>
        </section>

        {/* 默认风格设置 */}
        <section className="options-section">
          <h2>默认润色风格</h2>
          <p className="section-description">
            选择触发润色时的默认风格，你也可以在浮窗中随时切换。
          </p>
          <div className="style-options">
            {styleOptions.map((style) => (
              <label
                key={style.id}
                className={`style-option ${defaultStyle === style.id ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="defaultStyle"
                  value={style.id}
                  checked={defaultStyle === style.id}
                  onChange={() => setDefaultStyle(style.id)}
                />
                <div className="style-option-content">
                  <span className="style-label">{style.label}</span>
                  <span className="style-label-en">{style.labelEn}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* 快捷键说明 */}
        <section className="options-section">
          <h2>使用方法</h2>
          <div className="usage-list">
            <div className="usage-item">
              <kbd>Alt + O</kbd>
              <span>快捷键触发润色</span>
            </div>
            <div className="usage-item">
              <span className="usage-icon">🖱️</span>
              <span>右键菜单 → 润色选中文本</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="options-footer">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="save-button"
        >
          {isSaving ? '保存中...' : '保存设置'}
        </button>
        {saveStatus === 'success' && (
          <span className="save-status success">✓ 已保存</span>
        )}
        {saveStatus === 'error' && (
          <span className="save-status error">保存失败</span>
        )}
      </footer>
    </div>
  );
}

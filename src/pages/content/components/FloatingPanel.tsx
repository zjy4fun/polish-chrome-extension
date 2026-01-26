import React, { useState, useEffect, useCallback } from 'react';
import type { FloatingPanelState, PolishStyle, PolishError } from '@src/shared/types';
import { POLISH_STYLES } from '@src/shared/constants';

interface FloatingPanelProps {
  state: FloatingPanelState;
  originalText: string;
  polishedText: string;
  error: PolishError | null;
  currentStyle: PolishStyle;
  position: { top: number; left: number };
  onAccept: () => void;
  onClose: () => void;
  onRetry: () => void;
  onStyleChange: (style: PolishStyle) => void;
}

export function FloatingPanel({
  state,
  originalText,
  polishedText,
  error,
  currentStyle,
  position,
  onAccept,
  onClose,
  onRetry,
  onStyleChange,
}: FloatingPanelProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 显示时添加动画
    if (state !== 'idle') {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [state]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 150);
  }, [onClose]);

  if (state === 'idle') {
    return null;
  }

  const styleOptions = Object.values(POLISH_STYLES);

  return (
    <div
      className={`polish-floating-panel ${isVisible ? 'polish-visible' : ''}`}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 2147483647,
      }}
    >
      {/* 头部 */}
      <div className="polish-header">
        <span className="polish-title">Polish 文本润色</span>
        <button
          className="polish-close-btn"
          onClick={handleClose}
          aria-label="关闭"
        >
          ×
        </button>
      </div>

      {/* 风格选择 */}
      <div className="polish-style-selector">
        {styleOptions.map((styleOption) => (
          <button
            key={styleOption.id}
            className={`polish-style-btn ${currentStyle === styleOption.id ? 'polish-style-active' : ''}`}
            onClick={() => onStyleChange(styleOption.id)}
            disabled={state === 'loading'}
          >
            {styleOption.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="polish-content">
        {state === 'loading' && (
          <div className="polish-loading">
            <div className="polish-spinner"></div>
            <span>正在润色中...</span>
          </div>
        )}

        {state === 'success' && (
          <div className="polish-result">
            <div className="polish-text-preview">{polishedText}</div>
          </div>
        )}

        {state === 'error' && error && (
          <div className="polish-error">
            <div className="polish-error-icon">⚠️</div>
            <div className="polish-error-message">{error.message}</div>
            {error.code === 'NO_API_KEY' && (
              <button
                className="polish-settings-btn"
                onClick={() => chrome.runtime.openOptionsPage()}
              >
                前往设置
              </button>
            )}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="polish-actions">
        {state === 'success' && (
          <button className="polish-accept-btn" onClick={onAccept}>
            接受
          </button>
        )}
        {state === 'error' && (
          <button className="polish-retry-btn" onClick={onRetry}>
            重试
          </button>
        )}
        <button className="polish-cancel-btn" onClick={handleClose}>
          关闭
        </button>
      </div>
    </div>
  );
}

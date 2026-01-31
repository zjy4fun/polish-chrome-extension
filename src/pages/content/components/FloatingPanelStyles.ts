/**
 * 浮窗样式（用于 Shadow DOM 注入）
 */
export const floatingPanelStyles = `
  .polish-floating-panel {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1f2937;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 320px;
    max-width: 480px;
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.15s ease-out, transform 0.15s ease-out;
    overflow: hidden;
  }

  .polish-floating-panel.polish-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .polish-floating-panel.polish-selection-prompt {
    min-width: auto;
    max-width: 220px;
    padding: 8px;
  }

  .polish-selection-btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid #667eea;
    background: #667eea;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
  }

  .polish-selection-btn:hover {
    background: #5a67d8;
  }

  .polish-selection-btn:active {
    transform: translateY(1px);
  }

  .polish-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .polish-title {
    font-weight: 600;
    font-size: 14px;
  }

  .polish-close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .polish-close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .polish-style-selector {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .polish-style-btn {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .polish-style-btn:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
  }

  .polish-style-btn.polish-style-active {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }

  .polish-style-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .polish-content {
    padding: 16px;
    min-height: 80px;
  }

  .polish-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
    color: #6b7280;
  }

  .polish-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: polish-spin 0.8s linear infinite;
  }

  @keyframes polish-spin {
    to { transform: rotate(360deg); }
  }

  .polish-result {
    max-height: 200px;
    overflow-y: auto;
  }

  .polish-text-preview {
    background: #f3f4f6;
    border-radius: 8px;
    padding: 12px;
    white-space: pre-wrap;
    word-break: break-word;
    color: #1f2937;
  }

  .polish-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    text-align: center;
  }

  .polish-error-icon {
    font-size: 24px;
  }

  .polish-error-message {
    color: #dc2626;
    font-size: 13px;
  }

  .polish-settings-btn {
    margin-top: 8px;
    padding: 6px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .polish-settings-btn:hover {
    background: #5a67d8;
  }

  .polish-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    justify-content: flex-end;
  }

  .polish-accept-btn,
  .polish-retry-btn,
  .polish-cancel-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .polish-accept-btn {
    background: #10b981;
    color: white;
    border: none;
  }

  .polish-accept-btn:hover {
    background: #059669;
  }

  .polish-retry-btn {
    background: #f59e0b;
    color: white;
    border: none;
  }

  .polish-retry-btn:hover {
    background: #d97706;
  }

  .polish-cancel-btn {
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
  }

  .polish-cancel-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

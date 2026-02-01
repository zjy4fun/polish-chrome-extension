/**
 * 不安全的 input 类型列表
 */
const UNSAFE_INPUT_TYPES = [
  'password',
  'hidden',
  'file',
  'submit',
  'button',
  'reset',
  'image',
];

/**
 * 敏感的 autocomplete 属性值
 */
const SENSITIVE_AUTOCOMPLETE_VALUES = [
  'cc-name',
  'cc-number',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-csc',
  'cc-type',
  'new-password',
  'current-password',
];

/**
 * 检查元素是否为安全的可编辑输入
 */
export function isSafeInput(element: Element | null): element is HTMLElement {
  if (!element) return false;

  // 检查 HTMLInputElement
  if (element instanceof HTMLInputElement) {
    // 排除不安全的 input 类型
    if (UNSAFE_INPUT_TYPES.includes(element.type)) {
      return false;
    }

    // 排除敏感的 autocomplete 属性
    const autocomplete = element.getAttribute('autocomplete');
    if (autocomplete && SENSITIVE_AUTOCOMPLETE_VALUES.includes(autocomplete)) {
      return false;
    }

    return true;
  }

  // 检查 HTMLTextAreaElement
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  // 检查 contenteditable 元素
  if (element instanceof HTMLElement && element.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * 获取输入元素的文本内容
 */
export function getInputText(element: HTMLElement): string {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  if (element.isContentEditable) {
    return element.innerText || element.textContent || '';
  }

  return '';
}

export type InputSelectionSnapshot = {
  kind: 'input';
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: 'forward' | 'backward' | 'none';
};

export type ContentEditableSelectionSnapshot = {
  kind: 'contenteditable';
  range: Range;
};

export type SelectionSnapshot = InputSelectionSnapshot | ContentEditableSelectionSnapshot;

export interface SelectionInfo {
  text: string;
  snapshot: SelectionSnapshot;
}

/**
 * 获取输入元素的选中文本与快照
 */
export function getSelectionInfo(element: HTMLElement): SelectionInfo | null {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const selectionStart = element.selectionStart;
    const selectionEnd = element.selectionEnd;
    if (selectionStart === null || selectionEnd === null || selectionStart === selectionEnd) {
      return null;
    }

    const selectedText = element.value.slice(selectionStart, selectionEnd);
    if (!selectedText.trim()) {
      return null;
    }

    return {
      text: selectedText,
      snapshot: {
        kind: 'input',
        selectionStart,
        selectionEnd,
        selectionDirection: element.selectionDirection ?? 'none',
      },
    };
  }

  if (element.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode || !element.contains(anchorNode) || !element.contains(focusNode)) {
      return null;
    }

    const selectedText = selection.toString();
    if (!selectedText.trim()) {
      return null;
    }

    return {
      text: selectedText,
      snapshot: {
        kind: 'contenteditable',
        range: selection.getRangeAt(0).cloneRange(),
      },
    };
  }

  return null;
}

/**
 * 设置输入元素的文本内容
 */
export function setInputText(element: HTMLElement, text: string): void {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    // 使用 execCommand 或直接设置 value 以支持撤销
    element.focus();
    element.select();
    
    // 尝试使用 execCommand 支持撤销
    const success = document.execCommand('insertText', false, text);
    if (!success) {
      // 降级方案：直接设置 value
      element.value = text;
      // 触发 input 事件
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } else if (element.isContentEditable) {
    element.focus();
    
    // 选中全部内容
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // 尝试使用 execCommand 支持撤销
    const success = document.execCommand('insertText', false, text);
    if (!success) {
      element.innerText = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

/**
 * 替换当前选中文本
 */
export function replaceSelectionText(
  element: HTMLElement,
  snapshot: SelectionSnapshot,
  text: string
): void {
  if (snapshot.kind === 'input') {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      return;
    }

    element.focus();
    element.setSelectionRange(
      snapshot.selectionStart,
      snapshot.selectionEnd,
      snapshot.selectionDirection
    );

    const success = document.execCommand('insertText', false, text);
    if (!success) {
      element.setRangeText(text, snapshot.selectionStart, snapshot.selectionEnd, 'end');
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return;
  }

  if (!element.isContentEditable) {
    return;
  }

  if (!element.contains(snapshot.range.commonAncestorContainer)) {
    setInputText(element, text);
    return;
  }

  element.focus();
  const selection = window.getSelection();
  if (!selection) {
    setInputText(element, text);
    return;
  }

  selection.removeAllRanges();
  selection.addRange(snapshot.range);

  const success = document.execCommand('insertText', false, text);
  if (!success) {
    snapshot.range.deleteContents();
    snapshot.range.insertNode(document.createTextNode(text));
    selection.removeAllRanges();
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * 获取元素的位置信息
 */
export function getElementPosition(element: HTMLElement): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

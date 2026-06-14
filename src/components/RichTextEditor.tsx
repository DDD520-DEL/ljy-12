import { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Quote,
  Undo,
  Redo,
  Type,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string, contentHtml: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  minHeight = '150px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (!editorRef.current) return;
    const targetHtml = value || `<span style="color: #9ca3af;">${placeholder}</span>`;
    if (lastHtmlRef.current !== targetHtml) {
      lastHtmlRef.current = targetHtml;
      editorRef.current.innerHTML = targetHtml;
    }
  }, [value, placeholder]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    syncContent();
    editorRef.current?.focus();
  };

  const syncContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      lastHtmlRef.current = html;
      onChange(text, html);
    }
  };

  const handleLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setIsLinkDialogOpen(false);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: '加粗' },
    { icon: Italic, command: 'italic', title: '斜体' },
    { icon: Underline, command: 'underline', title: '下划线' },
    { type: 'divider' },
    { icon: List, command: 'insertUnorderedList', title: '无序列表' },
    { icon: ListOrdered, command: 'insertOrderedList', title: '有序列表' },
    { type: 'divider' },
    { icon: Quote, command: 'formatBlock', value: 'BLOCKQUOTE', title: '引用' },
    { icon: Minus, command: 'insertHorizontalRule', title: '分割线' },
    { type: 'divider' },
    { icon: AlignLeft, command: 'justifyLeft', title: '左对齐' },
    { icon: AlignCenter, command: 'justifyCenter', title: '居中对齐' },
    { icon: AlignRight, command: 'justifyRight', title: '右对齐' },
    { type: 'divider' },
    { icon: Type, command: 'removeFormat', title: '清除格式' },
    { type: 'divider' },
    { icon: Undo, command: 'undo', title: '撤销' },
    { icon: Redo, command: 'redo', title: '重做' },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((btn, idx) =>
          btn.type === 'divider' ? (
            <div key={idx} className="w-px h-5 bg-gray-300 mx-1" />
          ) : (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (btn.command === 'createLink') {
                  setIsLinkDialogOpen(true);
                  return;
                }
                execCommand(btn.command || '', btn.value);
              }}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              title={btn.title}
            >
              {btn.icon && <btn.icon className="w-4 h-4" />}
            </button>
          )
        )}

        <div
          className="w-px h-5 bg-gray-300 mx-1"
        />
        <button
          type="button"
          onClick={() => setIsLinkDialogOpen(true)}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          title="插入链接"
        >
          <Link className="w-4 h-4" />
        </button>

        {isLinkDialogOpen && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="px-2 py-1 text-sm border border-gray-300 rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLink();
                if (e.key === 'Escape') {
                  setIsLinkDialogOpen(false);
                  setLinkUrl('');
                }
              }}
            />
            <button
              type="button"
              onClick={handleLink}
              className="px-2 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              确定
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLinkDialogOpen(false);
                setLinkUrl('');
              }}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={syncContent}
        onBlur={syncContent}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        className={cn(
          'p-4 focus:outline-none text-gray-800 text-sm leading-relaxed',
          'prose prose-sm max-w-none',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600',
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_a]:text-emerald-600 [&_a]:underline [&_a:hover]:text-emerald-700',
          '[&_strong]:font-bold [&_em]:italic',
          '[&_hr]:my-4 [&_hr]:border-gray-200'
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}

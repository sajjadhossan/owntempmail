'use client';

import React, { useState, useRef } from 'react';
import { ShieldCheck, Code, Eye, FileText } from 'lucide-react';

interface EmailRendererProps {
  htmlBody?: string | null;
  textBody?: string;
  className?: string;
}

export default function EmailRenderer({ htmlBody, textBody, className = '' }: EmailRendererProps) {
  const [viewMode, setViewMode] = useState<'html' | 'text' | 'raw'>('html');
  const [iframeHeight, setIframeHeight] = useState<number>(320);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hasHtml = Boolean(htmlBody && htmlBody.trim().length > 0);
  const currentMode = hasHtml ? viewMode : 'text';

  // Construct secure, styled HTML for the sandboxed iframe
  const sanitizedSrcDoc = React.useMemo(() => {
    if (!htmlBody) return '';

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base target="_blank" />
    <style>
      :root {
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #e2e8f0;
        background-color: transparent;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      a {
        color: #818cf8;
        text-decoration: underline;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 8px;
      }
      table {
        max-width: 100% !important;
        border-collapse: collapse;
      }
      blockquote {
        border-left: 3px solid #475569;
        padding-left: 12px;
        margin-left: 0;
        color: #94a3b8;
      }
      pre, code {
        background-color: #0f172a;
        color: #38bdf8;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      pre {
        padding: 12px;
        overflow-x: auto;
      }
    </style>
  </head>
  <body>
    ${htmlBody}
  </body>
</html>`;
  }, [htmlBody]);

  const handleIframeLoad = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const doc = iframeRef.current.contentDocument;
        const scrollHeight = doc.documentElement.scrollHeight || doc.body.scrollHeight;
        if (scrollHeight > 50) {
          setIframeHeight(Math.max(scrollHeight + 24, 220));
        }
      }
    } catch {
      setIframeHeight(450);
    }
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-950 overflow-hidden ${className}`}>
      {/* View switcher header if HTML is available */}
      {hasHtml && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Sandboxed Secure View</span>
          </div>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('html')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                currentMode === 'html'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rendered HTML"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('text')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                currentMode === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Plain Text Content"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                currentMode === 'raw'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Raw HTML Source"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Rendering based on mode */}
      <div className="p-2 sm:p-3">
        {currentMode === 'html' && (
          <iframe
            ref={iframeRef}
            srcDoc={sanitizedSrcDoc}
            title="Email Content"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            onLoad={handleIframeLoad}
            style={{ height: `${iframeHeight}px`, minHeight: '220px' }}
            className="w-full border-0 rounded-lg bg-transparent"
          />
        )}

        {currentMode === 'text' && (
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 overflow-x-auto leading-relaxed">
            {textBody || 'No text content available.'}
          </pre>
        )}

        {currentMode === 'raw' && (
          <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap p-3 rounded-lg bg-slate-900/80 border border-slate-800 overflow-x-auto max-h-96">
            {htmlBody}
          </pre>
        )}
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { EmailAttachment } from '@/lib/types';

interface AttachmentLightboxModalProps {
  attachment: EmailAttachment | null;
  onClose: () => void;
  lang: string;
}

export default function AttachmentLightboxModal({
  attachment,
  onClose,
  lang,
}: AttachmentLightboxModalProps) {
  if (!attachment) return null;

  const isImage =
    attachment.contentType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.filename);

  const isPdf =
    attachment.contentType === 'application/pdf' ||
    /\.pdf$/i.test(attachment.filename);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5 min-w-0 pr-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate">{attachment.filename}</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                {formatSize(attachment.sizeBytes)} • {attachment.contentType}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {attachment.downloadUrl && (
              <a
                href={attachment.downloadUrl}
                download={attachment.filename}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/40 min-h-[300px]">
          {isImage ? (
            <div className="flex flex-col items-center justify-center max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.downloadUrl || ''}
                alt={attachment.filename}
                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-lg border border-slate-800/80"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center space-y-3">
              <iframe
                src={attachment.downloadUrl || ''}
                title={attachment.filename}
                className="w-full h-full rounded-xl border border-slate-800"
              />
            </div>
          ) : (
            <div className="text-center p-8 space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-indigo-400 border border-slate-700">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-bold text-slate-200">{attachment.filename}</h5>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn'
                    ? 'এই ফাইলটির ইনলাইন প্রিভিউ সমর্থিত নয়। সরাসরি ডাউনলোড করে দেখতে পারেন।'
                    : 'Inline preview is not available for this binary format. You can download the file directly.'}
                </p>
              </div>
              {attachment.downloadUrl && (
                <a
                  href={attachment.downloadUrl}
                  download={attachment.filename}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ফাইল ডাউনলোড করুন' : 'Download Attachment'}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


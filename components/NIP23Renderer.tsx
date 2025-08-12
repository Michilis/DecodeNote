import React, { useState } from 'react';
import { Copy, Check, BookOpen, Calendar, Globe, Image as ImageIcon, Tag, ExternalLink, AlertTriangle, FileText, Eye, X } from 'lucide-react';
import { NostrEvent } from '../types/nostr';
import { formatTimestamp } from '../utils/nostr';

interface NIP23RendererProps {
  event: NostrEvent;
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
}

export default function NIP23Renderer({ event, onCopy, copiedField }: NIP23RendererProps) {
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  
  // Extract NIP-23 metadata from tags
  const getTagValue = (tagName: string): string | null => {
    const tag = event.tags.find(t => t[0] === tagName);
    return tag ? tag[1] : null;
  };

  const getAllTagValues = (tagName: string): string[] => {
    return event.tags.filter(t => t[0] === tagName).map(t => t[1]);
  };

  const title = getTagValue('title') || 'Untitled Article';
  const summary = getTagValue('summary');
  const publishedAt = getTagValue('published_at');
  const image = getTagValue('image');
  const lang = getTagValue('lang');
  const contentWarning = getTagValue('content-warning');
  const location = getTagValue('location');
  const pay = getTagValue('pay');
  const zap = getTagValue('zap');
  const topics = getAllTagValues('t');
  const hashtags = getAllTagValues('hashtags');
  const dTag = getTagValue('d');

  // Format published timestamp
  const publishedTimestamp = publishedAt ? formatTimestamp(parseInt(publishedAt)) : null;
  const createdTimestamp = formatTimestamp(event.created_at);

  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (content: string): string => {
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');
  };

  const renderedContent = `<p class="mb-4">${renderMarkdown(event.content)}</p>`;

  return (
    <div className="space-y-6">
      {/* Article Header */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden">
        {/* Cover Image */}
        {image && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="p-6 space-y-4">
          {/* Content Warning */}
          {contentWarning && (
            <div className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Content Warning: {contentWarning}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              {title}
            </h1>
            {event.kind === 30024 && (
              <div className="inline-flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium">
                <FileText className="h-3 w-3" />
                <span>Draft</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <p className="text-lg text-slate-600 leading-relaxed">
              {summary}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-2 border-t border-slate-100">
            {publishedTimestamp && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Published {publishedTimestamp.relative}</span>
              </div>
            )}
            
            {createdTimestamp && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {createdTimestamp.relative}</span>
              </div>
            )}

            {lang && (
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{lang.toUpperCase()}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}

            {dTag && (
              <div className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">{dTag}</code>
              </div>
            )}
          </div>

          {/* Topics and Payment */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  #{topic}
                </span>
              ))}
              {hashtags.map((hashtag, index) => (
                <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  {hashtag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {(pay || zap) && (
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                  <span>⚡</span>
                  <span>Zappable</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Article Content</span>
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMarkdownModal(true)}
              className="flex items-center space-x-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
            >
              <Eye className="h-4 w-4" />
              <span>View Markdown</span>
            </button>
            
            <button
              onClick={() => onCopy(event.content, 'content')}
              className="flex items-center space-x-2 px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors text-sm"
            >
              {copiedField === 'content' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Rendered Content */}
        <div className="prose prose-slate max-w-none">
          <div 
            className="text-slate-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>
      </div>

      {/* Payment Information */}
      {(pay || zap) && (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <span>⚡</span>
            <span>Support the Author</span>
          </h3>
          
          <div className="space-y-3">
            {pay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lightning Address</label>
                <div className="flex items-center space-x-2">
                  <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1">
                    {pay}
                  </code>
                  <button
                    onClick={() => onCopy(pay, 'pay')}
                    className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {copiedField === 'pay' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            
            {zap && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zap Target</label>
                <div className="flex items-center space-x-2">
                  <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                    {zap}
                  </code>
                  <button
                    onClick={() => onCopy(zap, 'zap')}
                    className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {copiedField === 'zap' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Markdown Modal */}
      {showMarkdownModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Raw Markdown</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onCopy(event.content, 'modal-markdown')}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {copiedField === 'modal-markdown' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>Copy Markdown</span>
                </button>
                <button
                  onClick={() => setShowMarkdownModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {event.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
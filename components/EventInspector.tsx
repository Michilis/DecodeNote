import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Shield, AlertTriangle, Clock, Hash, User, Tag, FileText, RefreshCw, Eye, X, BookOpen, Calendar, Globe, Image as ImageIcon } from 'lucide-react';
import { NostrEvent, KIND_NAMES, ValidationResult } from '../types/nostr';
import { validateEvent, formatTimestamp, copyToClipboard, truncateId } from '../utils/nostr';
import TagTable from './TagTable';
import NIP23Renderer from './NIP23Renderer';

interface EventInspectorProps {
  event: NostrEvent;
  onBack: () => void;
}

export default function EventInspector({ event, onBack }: EventInspectorProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  useEffect(() => {
    async function validate() {
      setIsValidating(true);
      const result = await validateEvent(event);
      setValidation(result);
      setIsValidating(false);
    }
    validate();
  }, [event]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const timestamp = formatTimestamp(event.created_at);
  const kindName = KIND_NAMES[event.kind] || `Kind ${event.kind}`;
  const isNIP23 = event.kind === 30023 || event.kind === 30024;
  const isProfile = event.kind === 0;
  const isFollowList = event.kind === 3;
  const isChannelMessage = [40, 41, 42].includes(event.kind);
  const isCalendarEvent = [31922, 31923, 31924, 31925].includes(event.kind);
  const isFileMetadata = event.kind === 1063;
  const isVideoEvent = [21, 22].includes(event.kind);
  const isReaction = event.kind === 7;
  const isZap = [9734, 9735].includes(event.kind);
  const isReporting = event.kind === 1984;
  const isLabel = event.kind === 1985;
  const isList = [10000, 10001, 10002, 10003, 10004, 10005, 10006, 10007, 10009, 10015, 10030].includes(event.kind);
  const isCommunity = event.kind === 34550;
  const isGroup = [39000, 39001, 39002].includes(event.kind);
  const isRepository = [32123, 1617, 1621, 1622].includes(event.kind);
  const isClassified = [30402, 30403].includes(event.kind);
  const isWiki = event.kind === 30818;
  const isPicture = event.kind === 20;
  const isChat = [9, 14, 15, 42, 1311].includes(event.kind);
  const isDeprecated = [2, 4, 10, 12].includes(event.kind);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Input</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowRawJsonModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View Raw JSON</span>
          </button>
          
          {isValidating ? (
            <div className="flex items-center space-x-2 text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Validating...</span>
            </div>
          ) : validation && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              validation.isValid 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {validation.isValid ? (
                <Shield className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span>{validation.isValid ? 'Valid Event' : 'Invalid Event'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Deprecation Warning */}
      {isDeprecated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Deprecated Event Type</span>
          </div>
          <p className="text-amber-600 text-sm mt-2">
            This event type is deprecated and should not be used in new applications. 
            Consider using newer alternatives for better compatibility.
          </p>
        </div>
      )}

      {/* Event Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
          <Hash className="h-6 w-6 text-blue-600" />
          <span>Event Summary</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Event ID</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {event.id}
                </code>
                <button
                  onClick={() => handleCopy(event.id, 'id')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'id' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {validation && (
                <div className={`text-xs mt-1 ${validation.idMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                  {validation.idMatch ? '✓ ID matches computed hash' : '✗ ID does not match computed hash'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Public Key</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {event.pubkey}
                </code>
                <button
                  onClick={() => handleCopy(event.pubkey, 'pubkey')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'pubkey' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Signature</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {event.sig}
                </code>
                <button
                  onClick={() => handleCopy(event.sig, 'sig')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'sig' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {validation && (
                <div className={`text-xs mt-1 ${validation.sigValid ? 'text-emerald-600' : 'text-red-600'}`}>
                  {validation.sigValid ? '✓ Signature is valid' : '✗ Invalid signature'}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Kind</label>
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium">
                  {event.kind} - {kindName} {isDeprecated && '(Deprecated)'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Created At</label>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-900">
                  <Clock className="h-4 w-4" />
                  <span>{timestamp.relative}</span>
                </div>
                <div className="text-sm text-slate-600 font-mono">
                  {timestamp.absolute} (Unix: {event.created_at})
                </div>
              </div>
            </div>

            {validation && validation.errors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-red-700 mb-2">Validation Errors</label>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Special Content Renderers */}
      {isProfile && (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <span>Profile Information</span>
          </h3>
          {event.content ? (
            <ProfileRenderer content={event.content} onCopy={handleCopy} copiedField={copiedField} />
          ) : (
            <div className="text-slate-500 italic">No profile data</div>
          )}
        </div>
      )}

      {isFollowList && (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Follow List ({event.tags.filter(t => t[0] === 'p').length} follows)</span>
          </h3>
          <FollowListRenderer tags={event.tags} />
        </div>
      )}

      {isFileMetadata && (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>File Metadata</span>
          </h3>
          <FileMetadataRenderer tags={event.tags} content={event.content} />
        </div>
      )}

      {isReaction && (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <span className="text-2xl">
              {event.content === '+' ? '👍' : event.content === '-' ? '👎' : event.content || '❤️'}
            </span>
            <span>Reaction</span>
          </h3>
          <ReactionRenderer tags={event.tags} content={event.content} />
        </div>
      )}

      {/* Content Section */}
      {isNIP23 ? (
        <NIP23Renderer 
          event={event} 
          onCopy={handleCopy}
          copiedField={copiedField}
        />
      ) : (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Content</span>
          </h3>
          
          {event.content ? (
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-slate-800 font-medium leading-relaxed">
                  {event.content}
                </pre>
              </div>
              <button
                onClick={() => handleCopy(event.content, 'content')}
                className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {copiedField === 'content' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>Copy content</span>
              </button>
            </div>
          ) : (
            <div className="text-slate-500 italic">No content</div>
          )}
        </div>
      )}

      {/* Tags Section */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
          <Tag className="h-5 w-5 text-blue-600" />
          <span>Tags ({event.tags.length})</span>
        </h3>
        <TagTable tags={event.tags} />
      </div>

      {/* Raw JSON Modal */}
      {showRawJsonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Raw JSON</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(event, null, 2), 'modal-json')}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {copiedField === 'modal-json' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={() => setShowRawJsonModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Profile renderer component
function ProfileRenderer({ content, onCopy, copiedField }: { content: string, onCopy: (text: string, field: string) => void, copiedField: string | null }) {
  try {
    const profile = JSON.parse(content);
    return (
      <div className="space-y-4">
        {profile.picture && (
          <div className="flex items-center space-x-4">
            <img 
              src={profile.picture} 
              alt={profile.name || 'Profile'} 
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{profile.name || 'Anonymous'}</h4>
              {profile.display_name && profile.display_name !== profile.name && (
                <p className="text-slate-600">@{profile.display_name}</p>
              )}
            </div>
          </div>
        )}
        
        {profile.about && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">About</label>
            <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{profile.about}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.website && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-800 underline break-all">
                {profile.website}
              </a>
            </div>
          )}
          
          {profile.nip05 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIP-05</label>
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">{profile.nip05}</code>
            </div>
          )}
          
          {profile.lud16 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lightning Address</label>
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">{profile.lud16}</code>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onCopy(content, 'profile-json')}
          className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          {copiedField === 'profile-json' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          <span>Copy raw JSON</span>
        </button>
      </div>
    );
  } catch {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">Invalid JSON in profile content</p>
        <pre className="text-red-600 text-xs mt-2 font-mono">{content}</pre>
      </div>
    );
  }
}

// Follow list renderer
function FollowListRenderer({ tags }: { tags: string[][] }) {
  const follows = tags.filter(t => t[0] === 'p');
  
  if (follows.length === 0) {
    return <div className="text-slate-500 italic">No follows found</div>;
  }
  
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {follows.slice(0, 50).map((follow, index) => (
        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
          <div className="flex-1 min-w-0">
            <code className="text-sm font-mono text-slate-700 break-all">
              {follow[1].slice(0, 16)}...{follow[1].slice(-8)}
            </code>
            {follow[3] && (
              <div className="text-sm text-slate-600 mt-1">"{follow[3]}"</div>
            )}
          </div>
          {follow[2] && (
            <div className="text-xs text-slate-500 ml-2 truncate max-w-32">
              {follow[2]}
            </div>
          )}
        </div>
      ))}
      {follows.length > 50 && (
        <div className="text-sm text-slate-500 text-center py-2">
          ... and {follows.length - 50} more
        </div>
      )}
    </div>
  );
}

// File metadata renderer
function FileMetadataRenderer({ tags, content }: { tags: string[][], content: string }) {
  const url = tags.find(t => t[0] === 'url')?.[1];
  const hash = tags.find(t => t[0] === 'x')?.[1];
  const size = tags.find(t => t[0] === 'size')?.[1];
  const mimeType = tags.find(t => t[0] === 'm')?.[1];
  const alt = tags.find(t => t[0] === 'alt')?.[1];
  const dim = tags.find(t => t[0] === 'dim')?.[1];
  
  return (
    <div className="space-y-4">
      {url && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">File URL</label>
          <a href={url} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline break-all">
            {url}
          </a>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mimeType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">MIME Type</label>
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">{mimeType}</code>
          </div>
        )}
        
        {size && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
            <span className="text-sm">{formatFileSize(parseInt(size))}</span>
          </div>
        )}
        
        {dim && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dimensions</label>
            <span className="text-sm">{dim}</span>
          </div>
        )}
        
        {hash && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SHA256</label>
            <code className="bg-slate-100 px-2 py-1 rounded text-xs break-all">{hash.slice(0, 16)}...</code>
          </div>
        )}
      </div>
      
      {alt && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Alt Text</label>
          <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{alt}</p>
        </div>
      )}
      
      {content && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">{content}</p>
        </div>
      )}
    </div>
  );
}

// Reaction renderer
function ReactionRenderer({ tags, content }: { tags: string[][], content: string }) {
  const targetEvent = tags.find(t => t[0] === 'e')?.[1];
  const targetAuthor = tags.find(t => t[0] === 'p')?.[1];
  const targetKind = tags.find(t => t[0] === 'k')?.[1];
  
  const getReactionType = () => {
    if (content === '+' || content === '') return 'Like';
    if (content === '-') return 'Dislike';
    return 'Custom Reaction';
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="text-lg font-semibold text-slate-900 mb-2">
          {getReactionType()}: {content || '👍'}
        </div>
        
        {targetEvent && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Event</label>
              <code className="bg-white px-2 py-1 rounded text-sm font-mono break-all">
                {targetEvent}
              </code>
            </div>
            
            {targetAuthor && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Author</label>
                <code className="bg-white px-2 py-1 rounded text-sm font-mono break-all">
                  {targetAuthor}
                </code>
              </div>
            )}
            
            {targetKind && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Kind</label>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  {targetKind} - {KIND_NAMES[parseInt(targetKind)] || 'Unknown'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility function for file size formatting
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
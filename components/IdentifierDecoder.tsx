import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Key, Hash, Users, FileText, ExternalLink, Eye, X } from 'lucide-react';
import { DecodedIdentifier } from '../types/nostr';
import { copyToClipboard } from '../utils/nostr';

interface IdentifierDecoderProps {
  identifier: DecodedIdentifier;
  onBack: () => void;
}

export default function IdentifierDecoder({ identifier, onBack }: IdentifierDecoderProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getTypeIcon = () => {
    switch (identifier.type) {
      case 'npub':
      case 'nsec':
        return Key;
      case 'note':
        return Hash;
      case 'nprofile':
        return Users;
      case 'nevent':
      case 'naddr':
        return FileText;
      default:
        return Hash;
    }
  };

  const getTypeColor = () => {
    switch (identifier.type) {
      case 'npub':
        return 'bg-blue-100 text-blue-700';
      case 'nsec':
        return 'bg-red-100 text-red-700';
      case 'note':
        return 'bg-green-100 text-green-700';
      case 'nprofile':
        return 'bg-purple-100 text-purple-700';
      case 'nevent':
        return 'bg-orange-100 text-orange-700';
      case 'naddr':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const TypeIcon = getTypeIcon();

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
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor()}`}>
            <TypeIcon className="h-4 w-4" />
            <span>{identifier.type.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Identifier Summary */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
          <TypeIcon className="h-6 w-6 text-blue-600" />
          <span>Identifier Details</span>
        </h2>

        <div className="space-y-4">
          {identifier.data.id && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Event ID</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {identifier.data.id}
                </code>
                <button
                  onClick={() => handleCopy(identifier.data.id!, 'id')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'id' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {identifier.data.pubkey && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {identifier.type === 'nsec' ? 'Private Key' : 'Public Key'}
              </label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {identifier.data.pubkey}
                </code>
                <button
                  onClick={() => handleCopy(identifier.data.pubkey!, 'pubkey')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'pubkey' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {identifier.type === 'nsec' && (
                <div className="text-red-600 text-xs mt-1 font-medium">
                  ⚠️ This is a private key - keep it secure!
                </div>
              )}
            </div>
          )}

          {identifier.data.author && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {identifier.data.author}
                </code>
                <button
                  onClick={() => handleCopy(identifier.data.author!, 'author')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'author' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {identifier.data.kind !== undefined && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kind</label>
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium w-fit">
                {identifier.data.kind}
              </div>
            </div>
          )}

          {identifier.data.dTag && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">D-Tag</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                  {identifier.data.dTag}
                </code>
                <button
                  onClick={() => handleCopy(identifier.data.dTag!, 'dTag')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === 'dTag' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {identifier.data.relays && identifier.data.relays.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Relays ({identifier.data.relays.length})
              </label>
              <div className="space-y-2">
                {identifier.data.relays.map((relay, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a
                      href={relay}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 px-3 py-2 rounded-lg text-sm flex-1 break-all hover:bg-slate-200 transition-colors flex items-center space-x-2"
                    >
                      <span>{relay}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <button
                      onClick={() => handleCopy(relay, `relay-${index}`)}
                      className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {copiedField === `relay-${index}` ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TLV Breakdown */}
      {identifier.tlv && identifier.tlv.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-3 mb-4">
            <Hash className="h-5 w-5 text-blue-600" />
            <span>TLV Breakdown</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Length
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {identifier.tlv.map((tlv, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                        {tlv.type}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                      {tlv.typeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {tlv.length} bytes
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono break-all">
                          {tlv.value}
                        </code>
                        <button
                          onClick={() => handleCopy(tlv.value, `tlv-${index}`)}
                          className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {copiedField === `tlv-${index}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  onClick={() => handleCopy(JSON.stringify(identifier, null, 2), 'modal-json')}
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
                  {JSON.stringify(identifier, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
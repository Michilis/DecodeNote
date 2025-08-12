import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TAG_MEANINGS } from '../types/nostr';
import { truncateId } from '../utils/nostr';

interface TagTableProps {
  tags: string[][];
}

export default function TagTable({ tags }: TagTableProps) {
  if (tags.length === 0) {
    return (
      <div className="text-slate-500 italic text-center py-8">
        No tags found in this event
      </div>
    );
  }

  const renderTagValue = (value: string, index: number) => {
    // Check if it looks like a hex ID
    if (value.match(/^[0-9a-f]{64}$/i)) {
      return (
        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
          {truncateId(value, 6)}
        </code>
      );
    }
    
    // Check if it looks like a URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
        >
          <span className="truncate max-w-xs">{value}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      );
    }
    
    return (
      <span className="text-slate-700 break-all">{value}</span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tag Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Values
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Meaning
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {tags.map((tag, index) => {
            const [tagType, ...values] = tag;
            const meaning = TAG_MEANINGS[tagType] || 'Unknown tag type';
            
            return (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                    {tagType}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {values.map((value, valueIndex) => (
                      <div key={valueIndex} className="text-sm">
                        {renderTagValue(value, valueIndex)}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {meaning}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
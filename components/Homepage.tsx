import React, { useState } from 'react';
import { Search, Sparkles, FileText, Key, Hash, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { parseInput } from '../utils/nostr';
import { ParsedResult } from '../types/nostr';

interface HomepageProps {
  onParsedResult: (result: ParsedResult) => void;
}

export default function Homepage({ onParsedResult }: HomepageProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!input.trim()) {
      setError('Please enter some data to decode');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = parseInput(input);
      if (result) {
        onParsedResult(result);
      } else {
        setError('Unable to parse input. Please check the format and try again.');
      }
    } catch (err) {
      setError('An error occurred while parsing the input.');
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    {
      type: 'Raw Event JSON',
      icon: FileText,
      description: 'Complete Nostr event with all fields',
      example: '{"id": "a1b2c3...", "pubkey": "...", ...}'
    },
    {
      type: 'npub/nsec',
      icon: Key,
      description: 'Public or private key identifiers',
      example: 'npub1abc123...'
    },
    {
      type: 'Event ID',
      icon: Hash,
      description: 'Raw hex or note1... format',
      example: 'note1abc123...'
    },
    {
      type: 'Profile/Event URI',
      icon: Users,
      description: 'nprofile, nevent, naddr with metadata',
      example: 'nprofile1abc123...'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Professional Nostr Event Inspector</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Decode, Validate & Explore
          <span className="block text-blue-600">Nostr Events</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Comprehensive analysis tool for Nostr protocol events. Parse any format, 
          validate signatures, and explore the decentralized social network.
        </p>
      </div>

      {/* Main Input Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your Nostr event JSON, npub, note ID, or any supported identifier..."
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white/80 backdrop-blur-sm"
              rows={6}
            />
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Decode & Analyze</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Supported Formats */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Supported Input Formats
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examples.map((example, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <example.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{example.type}</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">
                {example.description}
              </p>
              
              <code className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">
                {example.example}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Comprehensive Analysis Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Hash className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Event Validation</h3>
            <p className="text-slate-600">
              Verify event IDs, validate cryptographic signatures, and ensure protocol compliance
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Key className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Identifier Decoding</h3>
            <p className="text-slate-600">
              Parse bech32 identifiers with TLV breakdown and metadata extraction
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Content Analysis</h3>
            <p className="text-slate-600">
              Explore tags, content, and relationships with human-readable formatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Search, Zap, Shield, Code, Hash, Users } from 'lucide-react';
import Homepage from './components/Homepage';
import EventInspector from './components/EventInspector';
import IdentifierDecoder from './components/IdentifierDecoder';
import { ParsedResult } from './types/nostr';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'inspect' | 'decode'>('home');
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);

  const handleParsedResult = (result: ParsedResult) => {
    setParsedResult(result);
    if (result.type === 'event') {
      setCurrentView('inspect');
    } else {
      setCurrentView('decode');
    }
  };

  const goHome = () => {
    setCurrentView('home');
    setParsedResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={goHome}
              className="flex items-center space-x-3 group transition-all duration-200 hover:scale-105"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  DecodeNote
                </h1>
                <p className="text-xs text-slate-500 -mt-1">Nostr Event Inspector</p>
              </div>
            </button>
            
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Validate</span>
              </div>
              <div className="flex items-center space-x-1">
                <Code className="h-4 w-4" />
                <span>Decode</span>
              </div>
              <div className="flex items-center space-x-1">
                <Hash className="h-4 w-4" />
                <span>Explore</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <Homepage onParsedResult={handleParsedResult} />
        )}
        
        {currentView === 'inspect' && parsedResult?.type === 'event' && (
          <EventInspector 
            event={parsedResult.data} 
            onBack={goHome}
          />
        )}
        
        {currentView === 'decode' && parsedResult?.type === 'identifier' && (
          <IdentifierDecoder 
            identifier={parsedResult.data}
            onBack={goHome}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600">
            <p className="text-sm">
              Built for the Nostr ecosystem • Open source inspection tool
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>NIP-01, NIP-19, NIP-21 Compatible</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
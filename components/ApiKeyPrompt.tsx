
import React, { useState } from 'react';
import { Key, Info, ExternalLink } from 'lucide-react';

interface ApiKeyPromptProps {
  onKeySubmit: (key: string) => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto bg-red-600/10 p-3 rounded-full w-fit">
            <Key className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">CINEWAVE</h1>
          <p className="text-zinc-400">Introduce tu API Key de TMDB para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">API Key (v3)</label>
            <input
              type="password"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="e.g. abc123def456..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
          >
            Empezar a explorar
          </button>
        </form>

        <div className="pt-6 border-t border-zinc-800 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <p>Tu API Key se guardará localmente en tu navegador. No la compartiremos con nadie.</p>
          </div>
          
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
          >
            ¿No tienes una clave? Consíguela aquí <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;

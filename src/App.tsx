// ============================================================
// APP PRINCIPAL - Sistema de Gestão de Departamento Pessoal
// Layout Full Viewport - Compacto
// ============================================================

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Cadastro from './components/Cadastro';
import Lancamentos from './components/Lancamentos';
import Dashboard from './components/Dashboard';
import { Users, FileText, LayoutDashboard, Building2, Menu, X } from 'lucide-react';

type Page = 'dashboard' | 'cadastro' | 'lancamentos';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'cadastro' as Page, label: 'Cadastro', icon: <Users size={16} /> },
    { id: 'lancamentos' as Page, label: 'Lançamentos', icon: <FileText size={16} /> },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Header ultra-compacto */}
      <header className="bg-blue-950 text-white shadow-md flex-shrink-0 print:hidden">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center">
              <Building2 size={16} className="text-blue-200" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">Gestão DP</h1>
              <p className="text-[9px] text-blue-300 leading-none mt-0.5">Departamento Pessoal & Folha</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  currentPage === item.id
                    ? 'bg-white/15 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md hover:bg-white/10"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-3 py-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                  currentPage === item.id
                    ? 'bg-white/15 text-white'
                    : 'text-blue-200 hover:bg-white/10'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content - fills remaining space */}
      <main className="flex-1 overflow-hidden px-3 py-2">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'cadastro' && (
          <div className="h-full overflow-y-auto">
            <Cadastro />
          </div>
        )}
        {currentPage === 'lancamentos' && (
          <div className="h-full overflow-y-auto">
            <Lancamentos />
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

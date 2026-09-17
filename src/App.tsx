// ============================================================
// APP PRINCIPAL - Sistema de Gestão de Departamento Pessoal
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
    { id: 'dashboard' as Page, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'cadastro' as Page, label: 'Cadastro', icon: <Users size={18} /> },
    { id: 'lancamentos' as Page, label: 'Lançamentos', icon: <FileText size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-blue-950 text-white shadow-lg print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-blue-200" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Gestão DP</h1>
              <p className="text-[10px] text-blue-300 -mt-0.5">Departamento Pessoal & Folha de Pagamento</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  currentPage === item.id
                    ? 'bg-white/15 text-white shadow-inner'
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
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
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

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-4">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'cadastro' && <Cadastro />}
        {currentPage === 'lancamentos' && <Lancamentos />}
      </main>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-4 py-3 text-center print:hidden">
        <p className="text-xs text-slate-400">
          Sistema de Gestão de Departamento Pessoal • Conformidade CLT & eSocial • © 2024
        </p>
      </footer>
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

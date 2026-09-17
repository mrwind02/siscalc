// ============================================================
// CONTEXTO GLOBAL - Estado da Aplicação
// ============================================================

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Colaborador, Lancamento, Empresa } from '../types';
import { colaboradoresExemplo, lancamentosExemplo } from '../data/sampleData';

interface AppContextType {
  empresa: Empresa;
  colaboradores: Colaborador[];
  lancamentos: Lancamento[];
  selectedColaboradorId: string | null;
  mesReferencia: string;
  setSelectedColaboradorId: (id: string | null) => void;
  setMesReferencia: (mes: string) => void;
  addColaborador: (col: Colaborador) => void;
  updateColaborador: (col: Colaborador) => void;
  deleteColaborador: (id: string) => void;
  addLancamento: (lanc: Lancamento) => void;
  deleteLancamento: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [empresa] = useState<Empresa>({
    razaoSocial: 'EMPRESA EXEMPLO LTDA',
    cnpj: '12.345.678/0001-99',
    endereco: 'Rua das Flores, 123 - Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01001-000',
  });

  const [colaboradores, setColaboradores] = useState<Colaborador[]>(colaboradoresExemplo);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(lancamentosExemplo);
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<string | null>(null);
  const [mesReferencia, setMesReferencia] = useState('2024-12');

  const addColaborador = (col: Colaborador) => {
    setColaboradores(prev => [...prev, col]);
  };

  const updateColaborador = (col: Colaborador) => {
    setColaboradores(prev => prev.map(c => c.id === col.id ? col : c));
  };

  const deleteColaborador = (id: string) => {
    setColaboradores(prev => prev.filter(c => c.id !== id));
    setLancamentos(prev => prev.filter(l => l.colaboradorId !== id));
  };

  const addLancamento = (lanc: Lancamento) => {
    setLancamentos(prev => [...prev, lanc]);
  };

  const deleteLancamento = (id: string) => {
    setLancamentos(prev => prev.filter(l => l.id !== id));
  };

  return (
    <AppContext.Provider value={{
      empresa,
      colaboradores,
      lancamentos,
      selectedColaboradorId,
      mesReferencia,
      setSelectedColaboradorId,
      setMesReferencia,
      addColaborador,
      updateColaborador,
      deleteColaborador,
      addLancamento,
      deleteLancamento,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

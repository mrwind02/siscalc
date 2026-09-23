// ============================================================
// COMPONENTE: Lançamentos Variáveis Ultra-Compacto
// ============================================================

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lancamento } from '../types';
import { useAppContext } from '../context/AppContext';
import { FileText, Plus, Trash2, Calendar } from 'lucide-react';

const TIPOS_LANCAMENTO = [
  { value: 'horas_extras_50', label: 'HE 50%', category: 'provento' },
  { value: 'horas_extras_100', label: 'HE 100%', category: 'provento' },
  { value: 'adiantamento', label: 'Adiantamento', category: 'desconto' },
  { value: 'falta', label: 'Falta', category: 'desconto' },
  { value: 'atraso', label: 'Atraso', category: 'desconto' },
  { value: 'bonus', label: 'Bônus', category: 'provento' },
  { value: 'comissao', label: 'Comissão', category: 'provento' },
  { value: 'convenio', label: 'Convênio', category: 'desconto' },
  { value: 'outro_provento', label: 'Outro Prov.', category: 'provento' },
  { value: 'outro_desconto', label: 'Outro Desc.', category: 'desconto' },
];

export default function Lancamentos() {
  const { colaboradores, lancamentos, addLancamento, deleteLancamento, mesReferencia, setMesReferencia } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    colaboradorId: '',
    tipo: 'horas_extras_50' as Lancamento['tipo'],
    descricao: '',
    quantidade: 0,
    valorTotal: 0,
     today,
    data: today,
  });

  const lancamentosMes = lancamentos
    .filter(l => l.mesReferencia === mesReferencia)
    .sort((a, b) => b.data.localeCompare(a.data));

  const handleSubmit = () => {
    if (!form.colaboradorId || !form.tipo) {
      alert('Selecione colaborador e tipo');
      return;
    }
    const descricao = form.descricao || TIPOS_LANCAMENTO.find(t => t.value === form.tipo)?.label || '';
    const baseLancamento = {
      id: uuidv4(),
      colaboradorId: form.colaboradorId,
      mesReferencia: mesReferencia,
      tipo: form.tipo,
      descricao: descricao,
      quantidade: form.quantidade,
      valorTotal: form.valorTotal,
    };
    const novoLancamento: Lancamento = { ...baseLancamento, ['data']: form.data };
    addLancamento(novoLancamento);
    setForm({ colaboradorId: '', tipo: 'horas_extras_50', descricao: '', quantidade: 0, valorTotal: 0,  today, data: today });
    setShowForm(false);
  };

  const getColaboradorNome = (id: string) => colaboradores.find(c => c.id === id)?.nomeCompleto || 'N/A';
  const getTipoLabel = (tipo: string) => TIPOS_LANCAMENTO.find(t => t.value === tipo)?.label || tipo;
  const getTipoCategory = (tipo: string) => TIPOS_LANCAMENTO.find(t => t.value === tipo)?.category || 'provento';

  return (
    <div className="h-full flex flex-col gap-1.5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-1.5 flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <FileText size={16} className="text-blue-900" />
          Lançamentos Variáveis
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" />
            <input
              type="month"
              value={mesReferencia}
              onChange={e => setMesReferencia(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1 text-xs font-medium text-white bg-blue-900 rounded hover:bg-blue-800 flex items-center gap-1"
          >
            <Plus size={12} /> Novo
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-2 flex-shrink-0">
          <div className="grid grid-cols-6 gap-1.5">
            <div>
              <label className="block text-[9px] font-medium text-slate-600 mb-0.5">Colaborador *</label>
              <select
                value={form.colaboradorId}
                onChange={e => setForm(prev => ({ ...prev, colaboradorId: e.target.value }))}
                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {colaboradores.filter(c => c.ativo).map(c => (
                  <option key={c.id} value={c.id}>{c.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-medium text-slate-600 mb-0.5">Tipo *</label>
              <select
                value={form.tipo}
                onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value as Lancamento['tipo'] }))}
                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {TIPOS_LANCAMENTO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-medium text-slate-600 mb-0.5">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Opcional"
                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-slate-600 mb-0.5">Qtd.</label>
              <input
                type="number"
                value={form.quantidade}
                onChange={e => setForm(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-slate-600 mb-0.5">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.valorTotal}
                onChange={e => setForm(prev => ({ ...prev, valorTotal: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button onClick={handleSubmit} className="w-full px-3 py-1 text-[11px] font-medium text-white bg-blue-900 rounded hover:bg-blue-800">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600">Colaborador</th>
                <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600">Tipo</th>
                <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-600">Descrição</th>
                <th className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-600">Qtd.</th>
                <th className="px-2 py-1.5 text-right text-[9px] font-semibold text-slate-600">Valor</th>
                <th className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-600">Cat.</th>
                <th className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-600">Data</th>
                <th className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-600 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lancamentosMes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-8 text-center text-slate-400">
                    Nenhum lançamento para este mês
                  </td>
                </tr>
              ) : (
                lancamentosMes.map(lanc => (
                  <tr key={lanc.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-1 font-medium text-slate-700 truncate max-w-[150px]">{getColaboradorNome(lanc.colaboradorId)}</td>
                    <td className="px-2 py-1 text-slate-600">{getTipoLabel(lanc.tipo)}</td>
                    <td className="px-2 py-1 text-slate-500 truncate max-w-[120px]">{lanc.descricao}</td>
                    <td className="px-2 py-1 text-center text-slate-600">{lanc.quantidade}</td>
                    <td className="px-2 py-1 text-right font-mono text-slate-700">
                      {lanc.valorTotal > 0 ? `R$ ${lanc.valorTotal.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getTipoCategory(lanc.tipo) === 'provento' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {getTipoCategory(lanc.tipo) === 'provento' ? 'Prov' : 'Desc'}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-center text-slate-500 text-[10px]">{lanc.data.split('-').reverse().join('/')}</td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => deleteLancamento(lanc.id)}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Resumo */}
        {lancamentosMes.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 p-2 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <div className="bg-white rounded border border-slate-200 px-2 py-1">
              <p className="text-[9px] text-slate-500">Total</p>
              <p className="text-sm font-bold text-slate-800">{lancamentosMes.length}</p>
            </div>
            <div className="bg-white rounded border border-slate-200 px-2 py-1">
              <p className="text-[9px] text-slate-500">Proventos</p>
              <p className="text-sm font-bold text-green-600">
                {lancamentosMes.filter(l => getTipoCategory(l.tipo) === 'provento').length}
              </p>
            </div>
            <div className="bg-white rounded border border-slate-200 px-2 py-1">
              <p className="text-[9px] text-slate-500">Descontos</p>
              <p className="text-sm font-bold text-red-600">
                {lancamentosMes.filter(l => getTipoCategory(l.tipo) === 'desconto').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

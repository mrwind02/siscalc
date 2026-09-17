// ============================================================
// COMPONENTE: Lançamentos Variáveis
// ============================================================

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lancamento } from '../types';
import { useAppContext } from '../context/AppContext';
import { FileText, Plus, Trash2, Calendar } from 'lucide-react';

const TIPOS_LANCAMENTO = [
  { value: 'horas_extras_50', label: 'Hora Extra 50%', category: 'provento' },
  { value: 'horas_extras_100', label: 'Hora Extra 100%', category: 'provento' },
  { value: 'adiantamento', label: 'Adiantamento Salarial', category: 'desconto' },
  { value: 'falta', label: 'Falta', category: 'desconto' },
  { value: 'atraso', label: 'Atraso', category: 'desconto' },
  { value: 'bonus', label: 'Bônus', category: 'provento' },
  { value: 'comissao', label: 'Comissão', category: 'provento' },
  { value: 'convenio', label: 'Convênio', category: 'desconto' },
  { value: 'outro_provento', label: 'Outro Provento', category: 'provento' },
  { value: 'outro_desconto', label: 'Outro Desconto', category: 'desconto' },
];

export default function Lancamentos() {
  const { colaboradores, lancamentos, addLancamento, deleteLancamento, mesReferencia, setMesReferencia } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    colaboradorId: '',
    tipo: 'horas_extras_50' as Lancamento['tipo'],
    descricao: '',
    quantidade: 0,
    valorTotal: 0,
    data: new Date().toISOString().split('T')[0],
  });

  const lancamentosMes = lancamentos
    .filter(l => l.mesReferencia === mesReferencia)
    .sort((a, b) => b.data.localeCompare(a.data));

  const handleSubmit = () => {
    if (!form.colaboradorId || !form.tipo) {
      alert('Selecione um colaborador e o tipo de lançamento');
      return;
    }

    const col = colaboradores.find(c => c.id === form.colaboradorId);
    const descricao = form.descricao || TIPOS_LANCAMENTO.find(t => t.value === form.tipo)?.label || '';

    addLancamento({
      id: uuidv4(),
      colaboradorId: form.colaboradorId,
      mesReferencia,
      tipo: form.tipo,
      descricao,
      quantidade: form.quantidade,
      valorTotal: form.valorTotal,
      data: form.data,
    });

    setForm({ colaboradorId: '', tipo: 'horas_extras_50', descricao: '', quantidade: 0, valorTotal: 0, data: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  const getColaboradorNome = (id: string) => {
    return colaboradores.find(c => c.id === id)?.nomeCompleto || 'N/A';
  };

  const getTipoLabel = (tipo: string) => {
    return TIPOS_LANCAMENTO.find(t => t.value === tipo)?.label || tipo;
  };

  const getTipoCategory = (tipo: string) => {
    return TIPOS_LANCAMENTO.find(t => t.value === tipo)?.category || 'provento';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText size={22} className="text-blue-900" />
          Lançamentos Variáveis
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="month"
              value={mesReferencia}
              onChange={e => setMesReferencia(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 flex items-center gap-2"
          >
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Novo Lançamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Colaborador *</label>
              <select
                value={form.colaboradorId}
                onChange={e => setForm(prev => ({ ...prev, colaboradorId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {colaboradores.filter(c => c.ativo).map(c => (
                  <option key={c.id} value={c.id}>{c.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value as Lancamento['tipo'] }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIPOS_LANCAMENTO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição opcional"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {['horas_extras_50', 'horas_extras_100', 'atraso'].includes(form.tipo) ? 'Quantidade (horas)' :
                  form.tipo === 'falta' ? 'Quantidade (dias)' : 'Quantidade'}
              </label>
              <input
                type="number"
                value={form.quantidade}
                onChange={e => setForm(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.valorTotal}
                onChange={e => setForm(prev => ({ ...prev, valorTotal: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={e => setForm(prev => ({ ...prev, data: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 mr-2 hover:text-slate-800">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800">
              Adicionar Lançamento
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Colaborador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Descrição</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Qtd.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Categoria</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Data</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lancamentosMes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">
                    Nenhum lançamento para este mês referência.
                  </td>
                </tr>
              ) : (
                lancamentosMes.map(lanc => (
                  <tr key={lanc.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{getColaboradorNome(lanc.colaboradorId)}</td>
                    <td className="px-4 py-3 text-slate-600">{getTipoLabel(lanc.tipo)}</td>
                    <td className="px-4 py-3 text-slate-500">{lanc.descricao}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{lanc.quantidade}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {lanc.valorTotal > 0 ? `R$ ${lanc.valorTotal.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoCategory(lanc.tipo) === 'provento' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {getTipoCategory(lanc.tipo) === 'provento' ? 'Provento' : 'Desconto'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">{lanc.data.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteLancamento(lanc.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo */}
      {lancamentosMes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Total de Lançamentos</p>
            <p className="text-2xl font-bold text-slate-800">{lancamentosMes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Proventos Variáveis</p>
            <p className="text-2xl font-bold text-green-600">
              {lancamentosMes.filter(l => getTipoCategory(l.tipo) === 'provento').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Descontos Variáveis</p>
            <p className="text-2xl font-bold text-red-600">
              {lancamentosMes.filter(l => getTipoCategory(l.tipo) === 'desconto').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

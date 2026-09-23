// ============================================================
// COMPONENTE: Cadastro Ultra-Compacto
// ============================================================

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Colaborador } from '../types';
import { useAppContext } from '../context/AppContext';
import { Save, X, Search, User } from 'lucide-react';

const emptyColaborador: Colaborador = {
  id: '', nomeCompleto: '', cpf: '', pisPasep: '', rg: '', dataNascimento: '',
  estadoCivil: 'Solteiro', nacionalidade: 'Brasileiro', nomePai: '', nomeMae: '',
  endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: 'SP', cep: '' },
  dadosBancarios: { banco: '', agencia: '', conta: '', tipoConta: 'corrente', chavePix: '' },
  cargo: '', departamento: '', tipoContrato: 'CLT', dataAdmissao: '', salarioBase: 0,
  cargaHorariaMensal: 220, numDependentes: 0, percentualVT: 6,
  adicionalPericulosidade: false, adicionalInsalubridade: false, grauInsalubridade: 'minimo',
  optanteAdiantamento: false, ativo: true,
};

export default function Cadastro() {
  const { colaboradores, addColaborador, updateColaborador } = useAppContext();
  const [form, setForm] = useState<Colaborador>({ ...emptyColaborador });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'pessoal' | 'contratual' | 'variaveis'>('pessoal');

  const filteredCols = colaboradores.filter(c =>
    c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm) || c.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nomeCompleto || !form.cpf || !form.cargo || !form.salarioBase) {
      alert('Preencha: Nome, CPF, Cargo e Salário');
      return;
    }
    if (editingId) {
      updateColaborador({ ...form, id: editingId });
    } else {
      addColaborador({ ...form, id: uuidv4() });
    }
    setForm({ ...emptyColaborador });
    setEditingId(null);
  };

  const handleEdit = (col: Colaborador) => {
    setForm({ ...col });
    setEditingId(col.id);
  };

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const updateEndereco = (field: string, value: string) => setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
  const updateBancario = (field: string, value: string) => setForm(prev => ({ ...prev, dadosBancarios: { ...prev.dadosBancarios, [field]: value } }));

  return (
    <div className="h-full flex flex-col gap-1.5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-1.5 flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <User size={16} className="text-blue-900" />
          Cadastro de Colaboradores
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1 text-xs border border-slate-200 rounded w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSave} className="px-3 py-1 text-xs font-medium text-white bg-blue-900 rounded hover:bg-blue-800 flex items-center gap-1">
            <Save size={12} /> Salvar
          </button>
        </div>
      </div>

      {/* Grid principal */}
      <div className="flex-1 grid grid-cols-12 gap-1.5 min-h-0">
        {/* Lista */}
        <div className="col-span-3 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-2 py-1 bg-slate-50 border-b border-slate-200">
            <span className="text-[10px] font-semibold text-slate-600">{filteredCols.length} colaboradores</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCols.map(col => (
              <div
                key={col.id}
                onClick={() => handleEdit(col)}
                className={`px-2 py-1.5 border-b border-slate-100 cursor-pointer hover:bg-blue-50 ${editingId === col.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}
              >
                <p className="text-[11px] font-medium text-slate-800 truncate">{col.nomeCompleto}</p>
                <p className="text-[9px] text-slate-500 truncate">{col.cargo} • {col.departamento}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div className="col-span-9 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 flex-shrink-0">
            <button
              onClick={() => setActiveSection('pessoal')}
              className={`px-3 py-1.5 text-[10px] font-medium border-b-2 ${activeSection === 'pessoal' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => setActiveSection('contratual')}
              className={`px-3 py-1.5 text-[10px] font-medium border-b-2 ${activeSection === 'contratual' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Dados Contratuais
            </button>
            <button
              onClick={() => setActiveSection('variaveis')}
              className={`px-3 py-1.5 text-[10px] font-medium border-b-2 ${activeSection === 'variaveis' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Variáveis
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-2">
            {activeSection === 'pessoal' && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  <CompactInput label="Nome Completo *" value={form.nomeCompleto} onChange={v => updateField('nomeCompleto', v)} colSpan={3} />
                  <CompactInput label="CPF *" value={form.cpf} onChange={v => updateField('cpf', v)} />
                  <CompactInput label="PIS/PASEP" value={form.pisPasep} onChange={v => updateField('pisPasep', v)} />
                  <CompactInput label="RG" value={form.rg} onChange={v => updateField('rg', v)} />
                  <CompactInput label="Nascimento" type="date" value={form.dataNascimento} onChange={v => updateField('dataNascimento', v)} />
                  <CompactSelect label="Estado Civil" value={form.estadoCivil} onChange={v => updateField('estadoCivil', v)} options={['Solteiro', 'Casado', 'Divorciado', 'Viúvo']} />
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase mb-1">Endereço</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    <CompactInput label="Logradouro" value={form.endereco.logradouro} onChange={v => updateEndereco('logradouro', v)} colSpan={3} />
                    <CompactInput label="Número" value={form.endereco.numero} onChange={v => updateEndereco('numero', v)} />
                    <CompactInput label="Complemento" value={form.endereco.complemento} onChange={v => updateEndereco('complemento', v)} />
                    <CompactInput label="Bairro" value={form.endereco.bairro} onChange={v => updateEndereco('bairro', v)} />
                    <CompactInput label="Cidade" value={form.endereco.cidade} onChange={v => updateEndereco('cidade', v)} />
                    <CompactInput label="UF" value={form.endereco.uf} onChange={v => updateEndereco('uf', v)} />
                    <CompactInput label="CEP" value={form.endereco.cep} onChange={v => updateEndereco('cep', v)} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase mb-1">Dados Bancários</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    <CompactInput label="Banco" value={form.dadosBancarios.banco} onChange={v => updateBancario('banco', v)} />
                    <CompactInput label="Agência" value={form.dadosBancarios.agencia} onChange={v => updateBancario('agencia', v)} />
                    <CompactInput label="Conta" value={form.dadosBancarios.conta} onChange={v => updateBancario('conta', v)} />
                    <CompactSelect label="Tipo" value={form.dadosBancarios.tipoConta} onChange={v => updateBancario('tipoConta', v)} options={['corrente', 'poupanca']} />
                    <CompactInput label="Chave Pix" value={form.dadosBancarios.chavePix} onChange={v => updateBancario('chavePix', v)} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'contratual' && (
              <div className="grid grid-cols-4 gap-1.5">
                <CompactInput label="Cargo *" value={form.cargo} onChange={v => updateField('cargo', v)} />
                <CompactInput label="Departamento" value={form.departamento} onChange={v => updateField('departamento', v)} />
                <CompactSelect label="Tipo Contrato" value={form.tipoContrato} onChange={v => updateField('tipoContrato', v)} options={['CLT', 'Aprendiz', 'Estagiario']} />
                <CompactInput label="Data Admissão" type="date" value={form.dataAdmissao} onChange={v => updateField('dataAdmissao', v)} />
                <CompactInput label="Salário Base *" type="number" value={form.salarioBase.toString()} onChange={v => updateField('salarioBase', parseFloat(v) || 0)} />
                <CompactInput label="Carga Horária" type="number" value={form.cargaHorariaMensal.toString()} onChange={v => updateField('cargaHorariaMensal', parseInt(v) || 220)} />
              </div>
            )}

            {activeSection === 'variaveis' && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  <CompactInput label="Dependentes" type="number" value={form.numDependentes.toString()} onChange={v => updateField('numDependentes', parseInt(v) || 0)} />
                  <CompactInput label="% Vale Transporte" type="number" value={form.percentualVT.toString()} onChange={v => updateField('percentualVT', parseFloat(v) || 0)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <CompactCheckbox label="Periculosidade (30%)" checked={form.adicionalPericulosidade} onChange={v => updateField('adicionalPericulosidade', v)} />
                  <CompactCheckbox label="Insalubridade" checked={form.adicionalInsalubridade} onChange={v => updateField('adicionalInsalubridade', v)} />
                  <CompactCheckbox label="Adiantamento Salarial" checked={form.optanteAdiantamento} onChange={v => updateField('optanteAdiantamento', v)} />
                </div>
                {form.adicionalInsalubridade && (
                  <CompactSelect label="Grau Insalubridade" value={form.grauInsalubridade} onChange={v => updateField('grauInsalubridade', v)} options={['minimo', 'medio', 'maximo']} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes compactos reutilizáveis
function CompactInput({ label, value, onChange, type = 'text', colSpan = 1 }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; colSpan?: number;
}) {
  return (
    <div className={colSpan > 1 ? `col-span-${colSpan}` : ''}>
      <label className="block text-[9px] font-medium text-slate-600 mb-0.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function CompactSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-[9px] font-medium text-slate-600 mb-0.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function CompactCheckbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded" />
      {label}
    </label>
  );
}

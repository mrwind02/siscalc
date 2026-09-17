// ============================================================
// COMPONENTE: Cadastro Completo de Colaborador
// ============================================================

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Colaborador, TipoContrato } from '../types';
import { useAppContext } from '../context/AppContext';
import { User, Building2, Calculator, Save, X, Search } from 'lucide-react';

const emptyColaborador: Colaborador = {
  id: '',
  nomeCompleto: '',
  cpf: '',
  pisPasep: '',
  rg: '',
  dataNascimento: '',
  estadoCivil: 'Solteiro',
  nacionalidade: 'Brasileiro',
  nomePai: '',
  nomeMae: '',
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    cep: '',
  },
  dadosBancarios: {
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: 'corrente',
    chavePix: '',
  },
  cargo: '',
  departamento: '',
  tipoContrato: 'CLT',
  dataAdmissao: '',
  salarioBase: 0,
  cargaHorariaMensal: 220,
  numDependentes: 0,
  percentualVT: 6,
  adicionalPericulosidade: false,
  adicionalInsalubridade: false,
  grauInsalubridade: 'minimo',
  optanteAdiantamento: false,
  ativo: true,
};

export default function Cadastro() {
  const { colaboradores, addColaborador, updateColaborador, deleteColaborador } = useAppContext();
  const [form, setForm] = useState<Colaborador>({ ...emptyColaborador });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'pessoal' | 'contratual' | 'variaveis'>('pessoal');

  const filteredCols = colaboradores.filter(c =>
    c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm) ||
    c.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nomeCompleto || !form.cpf || !form.cargo || !form.salarioBase) {
      alert('Preencha os campos obrigatórios: Nome, CPF, Cargo e Salário Base');
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

  const handleCancel = () => {
    setForm({ ...emptyColaborador });
    setEditingId(null);
  };

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateEndereco = (field: string, value: string) => {
    setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
  };

  const updateBancario = (field: string, value: string) => {
    setForm(prev => ({ ...prev, dadosBancarios: { ...prev.dadosBancarios, [field]: value } }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <User size={22} className="text-blue-900" />
          Cadastro de Colaboradores
        </h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou cargo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de Colaboradores */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">
              Colaboradores ({filteredCols.length})
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredCols.map(col => (
              <div
                key={col.id}
                className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors ${editingId === col.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                onClick={() => handleEdit(col)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{col.nomeCompleto}</p>
                    <p className="text-xs text-slate-500">{col.cargo} • {col.departamento}</p>
                    <p className="text-xs text-slate-400">CPF: {col.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${col.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {col.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
            </h3>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1">
                <X size={14} /> Cancelar
              </button>
              <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 flex items-center gap-1">
                <Save size={14} /> Salvar
              </button>
            </div>
          </div>

          {/* Seções do formulário */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveSection('pessoal')}
              className={`px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${activeSection === 'pessoal' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <User size={14} /> Dados Pessoais
            </button>
            <button
              onClick={() => setActiveSection('contratual')}
              className={`px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${activeSection === 'contratual' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 size={14} /> Dados Contratuais
            </button>
            <button
              onClick={() => setActiveSection('variaveis')}
              className={`px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${activeSection === 'variaveis' ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Calculator size={14} /> Variáveis de Cálculo
            </button>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto">
            {activeSection === 'pessoal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Nome Completo *" value={form.nomeCompleto} onChange={v => updateField('nomeCompleto', v)} colSpan={2} />
                  <InputField label="CPF *" value={form.cpf} onChange={v => updateField('cpf', v)} placeholder="000.000.000-00" />
                  <InputField label="PIS/PASEP" value={form.pisPasep} onChange={v => updateField('pisPasep', v)} />
                  <InputField label="RG" value={form.rg} onChange={v => updateField('rg', v)} />
                  <InputField label="Data Nascimento" type="date" value={form.dataNascimento} onChange={v => updateField('dataNascimento', v)} />
                  <SelectField label="Estado Civil" value={form.estadoCivil} onChange={v => updateField('estadoCivil', v)} options={['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']} />
                  <InputField label="Nacionalidade" value={form.nacionalidade} onChange={v => updateField('nacionalidade', v)} />
                  <InputField label="Nome do Pai" value={form.nomePai} onChange={v => updateField('nomePai', v)} />
                  <InputField label="Nome da Mãe" value={form.nomeMae} onChange={v => updateField('nomeMae', v)} />
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h4 className="text-xs font-semibold text-slate-600 mb-2">Endereço</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <InputField label="Logradouro" value={form.endereco.logradouro} onChange={v => updateEndereco('logradouro', v)} colSpan={2} />
                    <InputField label="Número" value={form.endereco.numero} onChange={v => updateEndereco('numero', v)} />
                    <InputField label="Complemento" value={form.endereco.complemento} onChange={v => updateEndereco('complemento', v)} />
                    <InputField label="Bairro" value={form.endereco.bairro} onChange={v => updateEndereco('bairro', v)} />
                    <InputField label="Cidade" value={form.endereco.cidade} onChange={v => updateEndereco('cidade', v)} />
                    <InputField label="UF" value={form.endereco.uf} onChange={v => updateEndereco('uf', v)} />
                    <InputField label="CEP" value={form.endereco.cep} onChange={v => updateEndereco('cep', v)} />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h4 className="text-xs font-semibold text-slate-600 mb-2">Dados Bancários</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Banco" value={form.dadosBancarios.banco} onChange={v => updateBancario('banco', v)} />
                    <InputField label="Agência" value={form.dadosBancarios.agencia} onChange={v => updateBancario('agencia', v)} />
                    <InputField label="Conta" value={form.dadosBancarios.conta} onChange={v => updateBancario('conta', v)} />
                    <SelectField label="Tipo Conta" value={form.dadosBancarios.tipoConta} onChange={v => updateBancario('tipoConta', v)} options={['corrente', 'poupanca']} />
                    <InputField label="Chave Pix" value={form.dadosBancarios.chavePix} onChange={v => updateBancario('chavePix', v)} colSpan={2} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'contratual' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Cargo *" value={form.cargo} onChange={v => updateField('cargo', v)} />
                  <InputField label="Departamento" value={form.departamento} onChange={v => updateField('departamento', v)} />
                  <SelectField label="Tipo de Contrato" value={form.tipoContrato} onChange={v => updateField('tipoContrato', v)} options={['CLT', 'Aprendiz', 'Estagiario']} />
                  <InputField label="Data Admissão" type="date" value={form.dataAdmissao} onChange={v => updateField('dataAdmissao', v)} />
                  <InputField label="Salário Base *" type="number" value={form.salarioBase.toString()} onChange={v => updateField('salarioBase', parseFloat(v) || 0)} />
                  <InputField label="Carga Horária Mensal" type="number" value={form.cargaHorariaMensal.toString()} onChange={v => updateField('cargaHorariaMensal', parseInt(v) || 220)} />
                </div>
              </div>
            )}

            {activeSection === 'variaveis' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Nº Dependentes (IRRF)" type="number" value={form.numDependentes.toString()} onChange={v => updateField('numDependentes', parseInt(v) || 0)} />
                  <InputField label="% Vale Transporte" type="number" value={form.percentualVT.toString()} onChange={v => updateField('percentualVT', parseFloat(v) || 0)} />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.adicionalPericulosidade} onChange={e => updateField('adicionalPericulosidade', e.target.checked)} className="rounded" />
                    <span className="text-slate-700">Adicional de Periculosidade (30%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.adicionalInsalubridade} onChange={e => updateField('adicionalInsalubridade', e.target.checked)} className="rounded" />
                    <span className="text-slate-700">Adicional de Insalubridade</span>
                  </label>
                  {form.adicionalInsalubridade && (
                    <SelectField label="Grau Insalubridade" value={form.grauInsalubridade} onChange={v => updateField('grauInsalubridade', v)} options={['minimo', 'medio', 'maximo']} />
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.optanteAdiantamento} onChange={e => updateField('optanteAdiantamento', e.target.checked)} className="rounded" />
                    <span className="text-slate-700">Optante por Adiantamento Salarial</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTES DE FORMULÁRIO
// ============================================================

function InputField({ label, value, onChange, type = 'text', placeholder, colSpan = 1 }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; colSpan?: number;
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

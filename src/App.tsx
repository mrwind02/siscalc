import { useState } from 'react';
import { Colaborador, FolhaPagamento, ReciboFerias, TermoRescisao } from './types';
import { gerarPDFHolerite, gerarPDFFerias, generatePDFRescisao } from './utils/pdfGenerator';
import { formatarMoeda, formatarCPF, formatarData } from './utils/taxEngine';

// Dados de exemplo
const colaboradoresExemplo: Colaborador[] = [
  {
    id: '1',
    nomeCompleto: 'João da Silva Santos',
    cpf: '12345678901',
    cargo: 'Analista de Sistemas',
    departamento: 'TI',
    dataAdmissao: '2020-03-15',
    salarioBase: 8500,
  },
  {
    id: '2',
    nomeCompleto: 'Maria Oliveira Costa',
    cpf: '98765432100',
    cargo: 'Gerente de Projetos',
    departamento: 'Operações',
    dataAdmissao: '2018-07-10',
    salarioBase: 12000,
  },
];

// Folha de pagamento exemplo
const folhaExemplo: FolhaPagamento = {
  mesReferencia: '2024-12',
  proventos: [
    { codigo: '001', descricao: 'Salário Base', provento: 8500 },
    { codigo: '002', descricao: 'Horas Extras 50%', provento: 425 },
    { codigo: '003', descricao: 'Adicional Noturno', provento: 255 },
  ],
  descontos: [
    { codigo: '101', descricao: 'INSS', desconto: 893.26 },
    { codigo: '102', descricao: 'IRRF', desconto: 1247.85 },
    { codigo: '103', descricao: 'Vale Transporte', desconto: 510 },
  ],
  totalProventos: 9180,
  totalDescontos: 2651.11,
  valorINSS: 893.26,
  valorIRRF: 1247.85,
  valorFGTS: 734.40,
  salarioLiquido: 6528.89,
};

const feriasExemplo: ReciboFerias = {
  valorFerias: 2833.33,
  valorTerco: 944.44,
  valorLiquido: 3200.00,
};

const rescisaoExemplo: TermoRescisao = {
  saldoSalario: 2833.33,
  feriasProporcionais: 1416.67,
  valorLiquido: 4250.00,
};

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'cadastro' | 'lancamentos'>('dashboard');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(colaboradoresExemplo[0]);

  const handleGerarHolerite = () => {
    if (colaboradorSelecionado) {
      gerarPDFHolerite(colaboradorSelecionado, folhaExemplo);
    }
  };

  const handleGerarFerias = () => {
    if (colaboradorSelecionado) {
      gerarPDFFerias(colaboradorSelecionado, feriasExemplo);
    }
  };

  const handleGerarRescisao = () => {
    if (colaboradorSelecionado) {
      generatePDFRescisao(colaboradorSelecionado, rescisaoExemplo);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Sistema de Gestão de Departamento Pessoal</h1>
          <p className="text-blue-200 text-sm">Folha de Pagamento • Férias • Rescisão</p>
        </div>
      </header>

      {/* Navegação */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setAbaAtiva('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                abaAtiva === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setAbaAtiva('cadastro')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                abaAtiva === 'cadastro'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Cadastro
            </button>
            <button
              onClick={() => setAbaAtiva('lancamentos')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                abaAtiva === 'lancamentos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lançamentos
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {abaAtiva === 'dashboard' && (
          <div className="space-y-6">
            {/* Seletor de Colaborador */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Selecionar Colaborador</h2>
              <select
                value={colaboradorSelecionado?.id || ''}
                onChange={(e) => {
                  const col = colaboradoresExemplo.find(c => c.id === e.target.value);
                  setColaboradorSelecionado(col || null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um colaborador...</option>
                {colaboradoresExemplo.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.nomeCompleto} - {col.cargo}
                  </option>
                ))}
              </select>
            </div>

            {colaboradorSelecionado && (
              <>
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Salário Base</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatarMoeda(colaboradorSelecionado.salarioBase)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Salário Líquido</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatarMoeda(folhaExemplo.salarioLiquido)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Descontos</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatarMoeda(folhaExemplo.totalDescontos)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">FGTS</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatarMoeda(folhaExemplo.valorFGTS)}
                    </div>
                  </div>
                </div>

                {/* Informações do Colaborador */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Dados do Colaborador</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Nome Completo</div>
                      <div className="font-medium">{colaboradorSelecionado.nomeCompleto}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">CPF</div>
                      <div className="font-medium">{formatarCPF(colaboradorSelecionado.cpf)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Cargo</div>
                      <div className="font-medium">{colaboradorSelecionado.cargo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Departamento</div>
                      <div className="font-medium">{colaboradorSelecionado.departamento}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Data de Admissão</div>
                      <div className="font-medium">{formatarData(colaboradorSelecionado.dataAdmissao)}</div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Gerar Documentos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleGerarHolerite}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      📄 Gerar Holerite (PDF)
                    </button>
                    <button
                      onClick={handleGerarFerias}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      🏖️ Gerar Férias (PDF)
                    </button>
                    <button
                      onClick={handleGerarRescisao}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      📋 Gerar Rescisão (PDF)
                    </button>
                  </div>
                </div>

                {/* Resumo da Folha */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Resumo da Folha - {folhaExemplo.mesReferencia}</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-green-700 mb-2">Proventos</h3>
                      <div className="space-y-2">
                        {folhaExemplo.proventos.map((p, i) => (
                          <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                            <span>{p.descricao}</span>
                            <span className="font-medium text-green-600">{formatarMoeda(p.provento)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300">
                          <span>Total Proventos</span>
                          <span className="text-green-600">{formatarMoeda(folhaExemplo.totalProventos)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-red-700 mb-2">Descontos</h3>
                      <div className="space-y-2">
                        {folhaExemplo.descontos.map((d, i) => (
                          <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                            <span>{d.descricao}</span>
                            <span className="font-medium text-red-600">{formatarMoeda(d.desconto)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300">
                          <span>Total Descontos</span>
                          <span className="text-red-600">{formatarMoeda(folhaExemplo.totalDescontos)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Salário Líquido</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatarMoeda(folhaExemplo.salarioLiquido)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {abaAtiva === 'cadastro' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Cadastro de Colaboradores</h2>
            <p className="text-gray-600">Funcionalidade de cadastro em desenvolvimento...</p>
            <div className="mt-4 space-y-3">
              {colaboradoresExemplo.map(col => (
                <div key={col.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium">{col.nomeCompleto}</div>
                  <div className="text-sm text-gray-600">{col.cargo} - {col.departamento}</div>
                  <div className="text-sm text-gray-500">CPF: {formatarCPF(col.cpf)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'lancamentos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Lançamentos Variáveis</h2>
            <p className="text-gray-600">Funcionalidade de lançamentos em desenvolvimento...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm">Sistema de Gestão de Departamento Pessoal © 2024</p>
          <p className="text-xs text-gray-400 mt-2">Conformidade CLT • eSocial • Legislação Brasileira</p>
        </div>
      </footer>
    </div>
  );
}

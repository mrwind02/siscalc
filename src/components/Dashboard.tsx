// ============================================================
// COMPONENTE: Dashboard Unificado do Colaborador
// ============================================================

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { processarFolha } from '../utils/payrollEngine';
import { formatarMoeda, formatarCPF, formatarData, calcularFerias, calcularRescisao } from '../utils/taxEngine';
import { gerarPDFHolerite, gerarPDFFerias, generatePDFRescisao } from '../utils/pdfGenerator';
import { LayoutDashboard, FileText, Palmtree, LogOut, History, Search, Printer, Download, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TipoRescisao } from '../types';

type TabType = 'folha' | 'ferias' | 'rescisao' | 'historico';

export default function Dashboard() {
  const { colaboradores, lancamentos, mesReferencia, setMesReferencia, selectedColaboradorId, setSelectedColaboradorId, empresa } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('folha');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCols = colaboradores.filter(c =>
    c.ativo && (
      c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm)
    )
  );

  const selectedColaborador = colaboradores.find(c => c.id === selectedColaboradorId);

  const folha = useMemo(() => {
    if (!selectedColaborador) return null;
    const colLancamentos = lancamentos.filter(l => l.colaboradorId === selectedColaborador.id);
    return processarFolha(selectedColaborador, colLancamentos, mesReferencia);
  }, [selectedColaborador, lancamentos, mesReferencia]);

  const historicoData = useMemo(() => {
    if (!selectedColaborador) return [];
    const meses = ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];
    return meses.map(mes => {
      const colLancamentos = lancamentos.filter(l => l.colaboradorId === selectedColaborador.id && l.mesReferencia === mes);
      const folhaMes = processarFolha(selectedColaborador, colLancamentos, mes);
      const [ano, m] = mes.split('-');
      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return {
        mes: `${mesesNomes[parseInt(m) - 1]}/${ano.slice(2)}`,
        salarioBruto: folhaMes.totalProventos,
        salarioLiquido: folhaMes.salarioLiquido,
        descontos: folhaMes.totalDescontos,
      };
    });
  }, [selectedColaborador, lancamentos]);

  const handleSelectColaborador = (id: string) => {
    setSelectedColaboradorId(id);
    setShowDropdown(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      {/* Header com seleção de colaborador */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <LayoutDashboard size={22} className="text-blue-900" />
          Dashboard do Colaborador
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={mesReferencia}
            onChange={e => setMesReferencia(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Dropdown de seleção */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 min-w-[200px]"
            >
              <Search size={14} className="text-slate-400" />
              <span className="text-slate-700 truncate">
                {selectedColaborador ? selectedColaborador.nomeCompleto : 'Selecionar colaborador...'}
              </span>
              <ChevronDown size={14} className="text-slate-400 ml-auto" />
            </button>
            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                {filteredCols.map(col => (
                  <button
                    key={col.id}
                    onClick={() => handleSelectColaborador(col.id)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-900">
                      {col.nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{col.nomeCompleto}</p>
                      <p className="text-xs text-slate-500">{col.cargo} • {formatarCPF(col.cpf)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedColaborador ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <LayoutDashboard size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Selecione um Colaborador</h3>
          <p className="text-sm text-slate-400 mt-1">Escolha um colaborador para visualizar seu dashboard completo.</p>
        </div>
      ) : (
        <>
          {/* Card do Colaborador + Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Card Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-lg">
                  {selectedColaborador.nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{selectedColaborador.nomeCompleto}</h3>
                  <p className="text-xs text-slate-500">{selectedColaborador.cargo}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">CPF:</span><span className="text-slate-700 font-mono">{formatarCPF(selectedColaborador.cpf)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Admissão:</span><span className="text-slate-700">{formatarData(selectedColaborador.dataAdmissao)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Departamento:</span><span className="text-slate-700">{selectedColaborador.departamento}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Salário Base:</span><span className="text-slate-700 font-semibold">{formatarMoeda(selectedColaborador.salarioBase)}</span></div>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
              <p className="text-xs font-medium text-green-700 mb-1">Total Proventos</p>
              <p className="text-2xl font-bold text-green-800">{folha ? formatarMoeda(folha.totalProventos) : 'R$ 0,00'}</p>
              <p className="text-xs text-green-600 mt-1">{folha?.proventos.length || 0} rubricas</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
              <p className="text-xs font-medium text-red-700 mb-1">Total Descontos</p>
              <p className="text-2xl font-bold text-red-800">{folha ? formatarMoeda(folha.totalDescontos) : 'R$ 0,00'}</p>
              <p className="text-xs text-red-600 mt-1">{folha?.descontos.length || 0} rubricas</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
              <p className="text-xs font-medium text-blue-700 mb-1">Salário Líquido</p>
              <p className="text-2xl font-bold text-blue-900">{folha ? formatarMoeda(folha.salarioLiquido) : 'R$ 0,00'}</p>
              <p className="text-xs text-blue-600 mt-1">Referência: {mesReferencia.split('-').reverse().join('/')}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200">
              <TabButton active={activeTab === 'folha'} onClick={() => setActiveTab('folha')} icon={<FileText size={14} />} label="Folha de Pagamento" />
              <TabButton active={activeTab === 'ferias'} onClick={() => setActiveTab('ferias')} icon={<Palmtree size={14} />} label="Férias" />
              <TabButton active={activeTab === 'rescisao'} onClick={() => setActiveTab('rescisao')} icon={<LogOut size={14} />} label="Rescisão" />
              <TabButton active={activeTab === 'historico'} onClick={() => setActiveTab('historico')} icon={<History size={14} />} label="Histórico" />
            </div>

            <div className="p-4">
              {activeTab === 'folha' && folha && <FolhaTab folha={folha} colaborador={selectedColaborador} mesReferencia={mesReferencia} />}
              {activeTab === 'ferias' && <FeriasTab colaborador={selectedColaborador} />}
              {activeTab === 'rescisao' && <RescisaoTab colaborador={selectedColaborador} />}
              {activeTab === 'historico' && <HistoricoTab data={historicoData} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// TAB: Folha de Pagamento
// ============================================================
function FolhaTab({ folha, colaborador, mesReferencia }: { folha: any; colaborador: any; mesReferencia: string }) {
  const handlePrintPDF = () => {
    gerarPDFHolerite(colaborador, folha);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Holerite / Recibo de Pagamento - {mesReferencia.split('-').reverse().join('/')}</h3>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1 print:hidden">
            <Printer size={12} /> Imprimir
          </button>
          <button onClick={handlePrintPDF} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 flex items-center gap-1">
            <Download size={12} /> Gerar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proventos */}
        <div>
          <h4 className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Proventos</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-1.5 text-left text-xs text-slate-500">Cód</th>
                <th className="py-1.5 text-left text-xs text-slate-500">Descrição</th>
                <th className="py-1.5 text-right text-xs text-slate-500">Valor</th>
              </tr>
            </thead>
            <tbody>
              {folha.proventos.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-1.5 text-xs text-slate-400 font-mono">{item.codigo}</td>
                  <td className="py-1.5 text-slate-700">{item.descricao}</td>
                  <td className="py-1.5 text-right font-mono text-green-700">{formatarMoeda(item.provento)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td></td>
                <td className="py-2 text-slate-700">Total Proventos</td>
                <td className="py-2 text-right font-mono text-green-700">{formatarMoeda(folha.totalProventos)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Descontos */}
        <div>
          <h4 className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">Descontos</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-1.5 text-left text-xs text-slate-500">Cód</th>
                <th className="py-1.5 text-left text-xs text-slate-500">Descrição</th>
                <th className="py-1.5 text-right text-xs text-slate-500">Valor</th>
              </tr>
            </thead>
            <tbody>
              {folha.descontos.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-1.5 text-xs text-slate-400 font-mono">{item.codigo}</td>
                  <td className="py-1.5 text-slate-700">{item.descricao}</td>
                  <td className="py-1.5 text-right font-mono text-red-700">{formatarMoeda(item.desconto)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td></td>
                <td className="py-2 text-slate-700">Total Descontos</td>
                <td className="py-2 text-right font-mono text-red-700">{formatarMoeda(folha.totalDescontos)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bases de Cálculo */}
      <div className="border-t border-slate-200 pt-3">
        <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Bases de Cálculo</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Base INSS</p>
            <p className="text-sm font-semibold text-slate-700">{formatarMoeda(folha.baseINSS)}</p>
            <p className="text-xs text-slate-500">INSS: <span className="text-red-600 font-medium">{formatarMoeda(folha.valorINSS)}</span></p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Base IRRF</p>
            <p className="text-sm font-semibold text-slate-700">{formatarMoeda(folha.baseIRRF)}</p>
            <p className="text-xs text-slate-500">IRRF: <span className="text-red-600 font-medium">{formatarMoeda(folha.valorIRRF)}</span></p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Base FGTS</p>
            <p className="text-sm font-semibold text-slate-700">{formatarMoeda(folha.baseFGTS)}</p>
            <p className="text-xs text-slate-500">FGTS: <span className="text-blue-600 font-medium">{formatarMoeda(folha.valorFGTS)}</span></p>
          </div>
        </div>
      </div>

      {/* Líquido */}
      <div className="bg-blue-900 text-white rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-blue-200">Salário Líquido</p>
          <p className="text-3xl font-bold">{formatarMoeda(folha.salarioLiquido)}</p>
        </div>
        <div className="text-right text-sm text-blue-200">
          <p>Proventos: {formatarMoeda(folha.totalProventos)}</p>
          <p>Descontos: {formatarMoeda(folha.totalDescontos)}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: Férias
// ============================================================
function FeriasTab({ colaborador }: { colaborador: any }) {
  const [diasGozo, setDiasGozo] = useState(30);
  const [diasAbono, setDiasAbono] = useState(0);

  const ferias = calcularFerias(colaborador.salarioBase, diasGozo, diasAbono);
  const baseFerias = ferias.totalBruto;
  const inssFerias = Math.min(baseFerias * 0.11, 893.26); // Teto INSS
  const irrfFerias = Math.max(0, (baseFerias - inssFerias - 189.59 * colaborador.numDependentes) * 0.275 - 896);

  const handlePDF = () => {
    const recibo = {
      colaboradorId: colaborador.id,
      periodoAquisitivo: {
        inicio: '2023-12-01',
        fim: '2024-11-30',
        diasGozados: 0,
        diasVendidos: diasAbono,
        status: 'disponivel' as const,
        valorDireito: ferias.totalBruto,
      },
      dataInicio: '2025-01-02',
      dataFim: `2025-01-${String(1 + diasGozo).padStart(2, '0')}`,
      diasGozo,
      abonoPecuniario: diasAbono,
      valorFerias: ferias.valorFerias,
      valorTerco: ferias.valorTerco,
      valorAbono: ferias.valorAbono,
      descontoINSS: Math.round(inssFerias * 100) / 100,
      descontoIRRF: Math.round(irrfFerias * 100) / 100,
      valorLiquido: Math.round((ferias.totalBruto - inssFerias - irrfFerias) * 100) / 100,
      dataPagamento: new Date().toISOString().split('T')[0],
    };
    gerarPDFFerias(colaborador, recibo);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Gestão de Férias</h3>
        <button onClick={handlePDF} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 flex items-center gap-1">
          <Download size={12} /> Gerar Recibo PDF
        </button>
      </div>

      {/* Status do Período Aquisitivo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600">Período Atual</p>
          <p className="text-sm font-semibold text-green-800">01/12/2023 a 30/11/2024</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">Disponível</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-600">Próximo Período</p>
          <p className="text-sm font-semibold text-blue-800">01/12/2024 a 30/11/2025</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full">Em Andamento</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Dias Disponíveis</p>
          <p className="text-2xl font-bold text-slate-800">30</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">Sem pendências</span>
        </div>
      </div>

      {/* Simulador */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Simulador de Férias</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Dias de Gozo</label>
            <input type="number" min={10} max={30} value={diasGozo} onChange={e => setDiasGozo(Math.min(30, Math.max(10, parseInt(e.target.value) || 10)))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Abono Pecuniário (dias)</label>
            <input type="number" min={0} max={Math.min(10, 30 - diasGozo)} value={diasAbono} onChange={e => setDiasAbono(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-2 text-slate-600">Férias ({diasGozo} dias)</td>
              <td className="py-2 text-right font-mono text-green-700">{formatarMoeda(ferias.valorFerias)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 text-slate-600">1/3 Constitucional</td>
              <td className="py-2 text-right font-mono text-green-700">{formatarMoeda(ferias.valorTerco)}</td>
            </tr>
            {diasAbono > 0 && (
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">Abono Pecuniário ({diasAbono} dias)</td>
                <td className="py-2 text-right font-mono text-green-700">{formatarMoeda(ferias.valorAbono)}</td>
              </tr>
            )}
            <tr className="border-b border-slate-200">
              <td className="py-2 text-slate-600">(-) INSS</td>
              <td className="py-2 text-right font-mono text-red-700">{formatarMoeda(Math.round(inssFerias * 100) / 100)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 text-slate-600">(-) IRRF</td>
              <td className="py-2 text-right font-mono text-red-700">{formatarMoeda(Math.round(Math.max(0, irrfFerias) * 100) / 100)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 text-slate-800">VALOR LÍQUIDO</td>
              <td className="py-2 text-right font-mono text-blue-900 text-lg">{formatarMoeda(Math.round((ferias.totalBruto - inssFerias - Math.max(0, irrfFerias)) * 100) / 100)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// TAB: Rescisão
// ============================================================
function RescisaoTab({ colaborador }: { colaborador: any }) {
  const [tipoRescisao, setTipoRescisao] = useState<TipoRescisao>('sem_justa_causa');
  const [dataDemissao, setDataDemissao] = useState('2024-12-31');
  const [avisoPrevio, setAvisoPrevio] = useState<'trabalhado' | 'indenizado' | 'nao_aplicavel'>('indenizado');

  const saldoFGTS = colaborador.salarioBase * 0.08 * 48; // Simulação: 48 meses

  const rescisao = calcularRescisao({
    salarioBase: colaborador.salarioBase,
    dataAdmissao: colaborador.dataAdmissao,
    dataDemissao,
    tipoRescisao,
    avisoPrevio,
    saldoFGTS,
    numDependentes: colaborador.numDependentes,
  });

  const handlePDF = () => {
    const termo = {
      colaboradorId: colaborador.id,
      tipoRescisao,
      dataAdmissao: colaborador.dataAdmissao,
      dataDemissao,
      avisoPrevio,
      diasAvisoPrevio: avisoPrevio === 'indenizado' ? 30 : 0,
      saldoSalario: rescisao.saldoSalario,
      feriasProporcionais: rescisao.feriasProporcionais,
      tercoFerias: rescisao.tercoFerias,
      decimoTerceiroProporcional: rescisao.decimoTerceiro,
      multaFGTS: rescisao.multaFGTS,
      valorFGTS: saldoFGTS,
      totalProventos: rescisao.totalProventos,
      totalDescontos: rescisao.totalDescontos,
      valorLiquido: rescisao.valorLiquido,
      dataProcessamento: new Date().toISOString().split('T')[0],
    };
    generatePDFRescisao(colaborador, termo);
  };

  const tipoLabels: Record<TipoRescisao, string> = {
    'sem_justa_causa': 'Dispensa sem Justa Causa',
    'com_justa_causa': 'Dispensa com Justa Causa',
    'pedido_demissao': 'Pedido de Demissão',
    'acordo': 'Acordo Mútuo',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Simulador de Rescisão (TRCT)</h3>
        <button onClick={handlePDF} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 flex items-center gap-1">
          <Download size={12} /> Gerar TRCT PDF
        </button>
      </div>

      {/* Configuração */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Tipo de Rescisão</label>
            <select value={tipoRescisao} onChange={e => setTipoRescisao(e.target.value as TipoRescisao)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg">
              {Object.entries(tipoLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Data de Demissão</label>
            <input type="date" value={dataDemissao} onChange={e => setDataDemissao(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Aviso Prévio</label>
            <select value={avisoPrevio} onChange={e => setAvisoPrevio(e.target.value as any)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg">
              <option value="indenizado">Indenizado</option>
              <option value="trabalhado">Trabalhado</option>
              <option value="nao_aplicavel">Não Aplicável</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verbas Rescisórias */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-2 px-3 text-left text-xs font-semibold text-slate-600">Verba</th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-2 px-3 text-slate-700">Saldo de Salário ({rescisao.diasFeriasProporcional > 0 ? '' : ''})</td>
            <td className="py-2 px-3 text-right font-mono text-green-700">{formatarMoeda(rescisao.saldoSalario)}</td>
          </tr>
          {rescisao.avisoPrevioValor > 0 && (
            <tr className="border-b border-slate-100">
              <td className="py-2 px-3 text-slate-700">Aviso Prévio Indenizado</td>
              <td className="py-2 px-3 text-right font-mono text-green-700">{formatarMoeda(rescisao.avisoPrevioValor)}</td>
            </tr>
          )}
          <tr className="border-b border-slate-100">
            <td className="py-2 px-3 text-slate-700">Férias Proporcionais ({rescisao.diasFeriasProporcional} dias)</td>
            <td className="py-2 px-3 text-right font-mono text-green-700">{formatarMoeda(rescisao.feriasProporcionais)}</td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 px-3 text-slate-700">1/3 de Férias</td>
            <td className="py-2 px-3 text-right font-mono text-green-700">{formatarMoeda(rescisao.tercoFerias)}</td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 px-3 text-slate-700">13º Proporcional ({rescisao.mesesDecimoTerceiro}/12 avos)</td>
            <td className="py-2 px-3 text-right font-mono text-green-700">{formatarMoeda(rescisao.decimoTerceiro)}</td>
          </tr>
          {rescisao.multaFGTS > 0 && (
            <tr className="border-b border-slate-100">
              <td className="py-2 px-3 text-slate-700">Multa Rescisória FGTS ({tipoRescisao === 'acordo' ? '20%' : '40%'})</td>
              <td className="py-2 px-3 text-right font-mono text-green-700">{formatarMoeda(rescisao.multaFGTS)}</td>
            </tr>
          )}
          <tr className="border-b border-slate-200 bg-red-50">
            <td className="py-2 px-3 text-slate-700 font-semibold">Total Descontos (INSS/IRRF)</td>
            <td className="py-2 px-3 text-right font-mono text-red-700 font-semibold">{formatarMoeda(rescisao.totalDescontos)}</td>
          </tr>
          <tr className="bg-blue-900 text-white">
            <td className="py-3 px-3 font-bold">VALOR LÍQUIDO DA RESCISÃO</td>
            <td className="py-3 px-3 text-right font-mono font-bold text-lg">{formatarMoeda(rescisao.valorLiquido)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// TAB: Histórico
// ============================================================
function HistoricoTab({ data }: { data: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Evolução da Remuneração</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatarMoeda(value)} />
            <Legend />
            <Bar dataKey="salarioBruto" name="Salário Bruto" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salarioLiquido" name="Salário Líquido" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="descontos" name="Descontos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-2 px-3 text-left text-xs font-semibold text-slate-600">Mês</th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600">Bruto</th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600">Descontos</th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600">Líquido</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2 px-3 text-slate-700 font-medium">{row.mes}</td>
              <td className="py-2 px-3 text-right font-mono text-slate-700">{formatarMoeda(row.salarioBruto)}</td>
              <td className="py-2 px-3 text-right font-mono text-red-600">{formatarMoeda(row.descontos)}</td>
              <td className="py-2 px-3 text-right font-mono text-green-700 font-semibold">{formatarMoeda(row.salarioLiquido)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTE: Tab Button
// ============================================================
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
    >
      {icon} {label}
    </button>
  );
}

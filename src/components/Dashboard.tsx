// ============================================================
// DASHBOARD ULTRA-COMPACTO - Todas as informações em uma tela
// ============================================================

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { processarFolha } from '../utils/payrollEngine';
import { formatarMoeda, formatarCPF, formatarData, calcularFerias, calcularRescisao } from '../utils/taxEngine';
import { gerarPDFHolerite, gerarPDFFerias, generatePDFRescisao } from '../utils/pdfGenerator';
import { FileText, Palmtree, LogOut, History, Search, Download, ChevronDown, TrendingUp, TrendingDown, Wallet, Calculator, Calendar, User, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TipoRescisao } from '../types';

type TabType = 'folha' | 'ferias' | 'rescisao' | 'historico';

export default function Dashboard() {
  const { colaboradores, lancamentos, mesReferencia, setMesReferencia, selectedColaboradorId, setSelectedColaboradorId } = useAppContext();
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
        mes: mesesNomes[parseInt(m) - 1],
        bruto: folhaMes.totalProventos,
        liquido: folhaMes.salarioLiquido,
      };
    });
  }, [selectedColaborador, lancamentos]);

  const handleSelectColaborador = (id: string) => {
    setSelectedColaboradorId(id);
    setShowDropdown(false);
    setSearchTerm('');
  };

  if (!selectedColaborador) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-blue-900" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">Selecione um Colaborador</h3>
          <p className="text-xs text-slate-400 mt-1">Use o seletor acima para visualizar o dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1.5 overflow-hidden">
      {/* Barra superior compacta */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
            {selectedColaborador.nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">{selectedColaborador.nomeCompleto}</h3>
            <p className="text-[10px] text-slate-500">{selectedColaborador.cargo} • {selectedColaborador.departamento} • {formatarCPF(selectedColaborador.cpf)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50">
              <Search size={12} className="text-slate-400" />
              <span className="max-w-[120px] truncate">Trocar</span>
              <ChevronDown size={10} />
            </button>
            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                <div className="p-1.5 border-b border-slate-100">
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-2 py-1 text-xs border border-slate-200 rounded" autoFocus />
                </div>
                {filteredCols.map(col => (
                  <button key={col.id} onClick={() => handleSelectColaborador(col.id)} className="w-full px-2 py-1.5 text-left hover:bg-blue-50 text-xs">
                    <span className="font-medium">{col.nomeCompleto}</span>
                    <span className="text-slate-400 ml-1">• {col.cargo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input type="month" value={mesReferencia} onChange={e => setMesReferencia(e.target.value)} className="px-2 py-1 text-xs border border-slate-200 rounded" />
        </div>
      </div>

      {/* Grid principal ultra-compacto */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* Coluna esquerda: Info + Cards + Gráfico */}
        <div className="col-span-3 flex flex-col gap-2 min-h-0">
          {/* Mini cards de resumo */}
          <div className="grid grid-cols-2 gap-1.5">
            <MiniCard icon={<TrendingUp size={12} />} label="Bruto" value={folha ? formatarMoeda(folha.totalProventos) : 'R$ 0'} color="green" />
            <MiniCard icon={<TrendingDown size={12} />} label="Descontos" value={folha ? formatarMoeda(folha.totalDescontos) : 'R$ 0'} color="red" />
            <MiniCard icon={<Wallet size={12} />} label="Líquido" value={folha ? formatarMoeda(folha.salarioLiquido) : 'R$ 0'} color="blue" />
            <MiniCard icon={<Calculator size={12} />} label="FGTS" value={folha ? formatarMoeda(folha.valorFGTS) : 'R$ 0'} color="purple" />
          </div>

          {/* Dados do contrato */}
          <div className="bg-white rounded-lg border border-slate-200 p-2 flex-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contrato</h4>
            <div className="space-y-1 text-[11px]">
              <InfoRow label="Admissão" value={formatarData(selectedColaborador.dataAdmissao)} />
              <InfoRow label="Salário" value={formatarMoeda(selectedColaborador.salarioBase)} />
              <InfoRow label="Carga Hor." value={`${selectedColaborador.cargaHorariaMensal}h/mês`} />
              <InfoRow label="Contrato" value={selectedColaborador.tipoContrato} />
              <InfoRow label="Dependentes" value={`${selectedColaborador.numDependentes}`} />
              {selectedColaborador.adicionalPericulosidade && <InfoRow label="Periculos." value="30%" highlight />}
              {selectedColaborador.adicionalInsalubridade && <InfoRow label="Insalubr." value={selectedColaborador.grauInsalubridade} highlight />}
            </div>
          </div>

          {/* Mini gráfico */}
          <div className="bg-white rounded-lg border border-slate-200 p-2 h-[110px] flex-shrink-0">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Evolução 6 meses</h4>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicoData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="colorLiq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="liquido" stroke="#1e40af" strokeWidth={1.5} fill="url(#colorLiq)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Coluna central: Folha de Pagamento */}
        <div className="col-span-5 flex flex-col gap-2 min-h-0">
          {/* Tabs compactas */}
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
            <TabBtn active={activeTab === 'folha'} onClick={() => setActiveTab('folha')} icon={<FileText size={11} />} label="Holerite" />
            <TabBtn active={activeTab === 'ferias'} onClick={() => setActiveTab('ferias')} icon={<Palmtree size={11} />} label="Férias" />
            <TabBtn active={activeTab === 'rescisao'} onClick={() => setActiveTab('rescisao')} icon={<LogOut size={11} />} label="Rescisão" />
            <TabBtn active={activeTab === 'historico'} onClick={() => setActiveTab('historico')} icon={<History size={11} />} label="Histórico" />
          </div>

          {/* Conteúdo da tab */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0 flex flex-col">
            {activeTab === 'folha' && folha && <FolhaCompacta folha={folha} colaborador={selectedColaborador} />}
            {activeTab === 'ferias' && <FeriasCompacta colaborador={selectedColaborador} />}
            {activeTab === 'rescisao' && <RescisaoCompacta colaborador={selectedColaborador} />}
            {activeTab === 'historico' && <HistoricoCompacto data={historicoData} />}
          </div>
        </div>

        {/* Coluna direita: Bases + Ações */}
        <div className="col-span-4 flex flex-col gap-2 min-h-0">
          {/* Bases de cálculo */}
          <div className="bg-white rounded-lg border border-slate-200 p-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bases de Cálculo</h4>
            <div className="grid grid-cols-3 gap-1.5">
              <BaseCard label="INSS" base={folha?.baseINSS || 0} valor={folha?.valorINSS || 0} color="amber" />
              <BaseCard label="IRRF" base={folha?.baseIRRF || 0} valor={folha?.valorIRRF || 0} color="rose" />
              <BaseCard label="FGTS" base={folha?.baseFGTS || 0} valor={folha?.valorFGTS || 0} color="sky" />
            </div>
          </div>

          {/* Proventos e Descontos lado a lado */}
          {folha && (
            <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
              {/* Proventos */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-2 py-1 bg-green-50 border-b border-green-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-green-700 uppercase">Proventos</span>
                  <span className="text-[10px] font-bold text-green-800">{formatarMoeda(folha.totalProventos)}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                  {folha.proventos.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-50 last:border-0">
                      <span className="text-[10px] text-slate-600 truncate flex-1">{item.descricao}</span>
                      <span className="text-[10px] font-mono text-green-700 ml-1 whitespace-nowrap">{formatarMoeda(item.provento)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descontos */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-2 py-1 bg-red-50 border-b border-red-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-red-700 uppercase">Descontos</span>
                  <span className="text-[10px] font-bold text-red-800">{formatarMoeda(folha.totalDescontos)}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                  {folha.descontos.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-50 last:border-0">
                      <span className="text-[10px] text-slate-600 truncate flex-1">{item.descricao}</span>
                      <span className="text-[10px] font-mono text-red-700 ml-1 whitespace-nowrap">{formatarMoeda(item.desconto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ações rápidas */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => window.print()} className="flex-1 py-1.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-1">
              <Printer size={10} /> Imprimir
            </button>
            <button onClick={() => folha && gerarPDFHolerite(selectedColaborador, folha)} className="flex-1 py-1.5 text-[10px] font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-800 flex items-center justify-center gap-1">
              <Download size={10} /> PDF Holerite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTES COMPACTOS
// ============================================================

function MiniCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div className={`rounded-lg border p-2 ${colors[color]}`}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-[9px] font-medium uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="text-sm font-bold leading-tight">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${highlight ? 'text-amber-600' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

function BaseCard({ label, base, valor, color }: { label: string; base: number; valor: number; color: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
  };
  const c = colors[color];
  return (
    <div className={`rounded-md border ${c.border} ${c.bg} p-1.5`}>
      <p className={`text-[9px] font-bold ${c.text} uppercase`}>{label}</p>
      <p className="text-[11px] font-bold text-slate-800">{formatarMoeda(valor)}</p>
      <p className="text-[8px] text-slate-400">Base: {formatarMoeda(base)}</p>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md flex items-center justify-center gap-1 transition-all ${active ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      {icon} {label}
    </button>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg">
        <p className="font-bold">{label}/24</p>
        <p>Líquido: {formatarMoeda(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

// ============================================================
// TAB: Folha Compacta
// ============================================================
function FolhaCompacta({ folha, colaborador }: { folha: any; colaborador: any }) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold text-slate-700">Recibo de Pagamento Detalhado</h4>
        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{folha.dataProcessamento}</span>
      </div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-1 text-left text-slate-400 font-medium">Cód</th>
            <th className="py-1 text-left text-slate-400 font-medium">Descrição</th>
            <th className="py-1 text-right text-slate-400 font-medium">Ref.</th>
            <th className="py-1 text-right text-green-600 font-medium">Provento</th>
            <th className="py-1 text-right text-red-600 font-medium">Desconto</th>
          </tr>
        </thead>
        <tbody>
          {folha.proventos.map((p: any, i: number) => (
            <tr key={`p${i}`} className="border-b border-slate-50">
              <td className="py-0.5 font-mono text-slate-400">{p.codigo}</td>
              <td className="py-0.5 text-slate-700">{p.descricao}</td>
              <td className="py-0.5 text-right text-slate-400">{p.referencia}</td>
              <td className="py-0.5 text-right font-mono text-green-700">{formatarMoeda(p.provento)}</td>
              <td className="py-0.5"></td>
            </tr>
          ))}
          {folha.descontos.map((d: any, i: number) => (
            <tr key={`d${i}`} className="border-b border-slate-50">
              <td className="py-0.5 font-mono text-slate-400">{d.codigo}</td>
              <td className="py-0.5 text-slate-700">{d.descricao}</td>
              <td className="py-0.5 text-right text-slate-400">{d.referencia}</td>
              <td className="py-0.5"></td>
              <td className="py-0.5 text-right font-mono text-red-700">{formatarMoeda(d.desconto)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 font-bold">
            <td colSpan={3} className="py-1 text-slate-700">TOTAIS</td>
            <td className="py-1 text-right font-mono text-green-700">{formatarMoeda(folha.totalProventos)}</td>
            <td className="py-1 text-right font-mono text-red-700">{formatarMoeda(folha.totalDescontos)}</td>
          </tr>
          <tr className="bg-blue-900 text-white">
            <td colSpan={3} className="py-1.5 font-bold text-xs">LÍQUIDO</td>
            <td colSpan={2} className="py-1.5 text-right font-mono font-bold text-sm">{formatarMoeda(folha.salarioLiquido)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ============================================================
// TAB: Férias Compacta
// ============================================================
function FeriasCompacta({ colaborador }: { colaborador: any }) {
  const [diasGozo, setDiasGozo] = useState(30);
  const [diasAbono, setDiasAbono] = useState(0);

  const ferias = calcularFerias(colaborador.salarioBase, diasGozo, diasAbono);
  const inssFerias = Math.min(ferias.totalBruto * 0.11, 893.26);
  const irrfFerias = Math.max(0, (ferias.totalBruto - inssFerias) * 0.275 - 896);
  const liquido = ferias.totalBruto - inssFerias - irrfFerias;

  const handlePDF = () => {
    const recibo = {
      colaboradorId: colaborador.id,
      periodoAquisitivo: { inicio: '2023-12-01', fim: '2024-11-30', diasGozados: 0, diasVendidos: diasAbono, status: 'disponivel' as const, valorDireito: ferias.totalBruto },
      dataInicio: '2025-01-02', dataFim: `2025-01-${String(1 + diasGozo).padStart(2, '0')}`,
      diasGozo, abonoPecuniario: diasAbono,
      valorFerias: ferias.valorFerias, valorTerco: ferias.valorTerco, valorAbono: ferias.valorAbono,
      descontoINSS: Math.round(inssFerias * 100) / 100, descontoIRRF: Math.round(irrfFerias * 100) / 100,
      valorLiquido: Math.round(liquido * 100) / 100, dataPagamento: new Date().toISOString().split('T')[0],
    };
    gerarPDFFerias(colaborador, recibo);
  };

  return (
    <div className="flex-1 p-2 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold text-slate-700">Simulador de Férias</h4>
        <button onClick={handlePDF} className="px-2 py-1 text-[10px] font-medium bg-blue-900 text-white rounded hover:bg-blue-800 flex items-center gap-1">
          <Download size={9} /> PDF
        </button>
      </div>

      {/* Status períodos */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="bg-green-50 border border-green-200 rounded p-1.5">
          <p className="text-[8px] text-green-600 font-medium">PERÍODO ATUAL</p>
          <p className="text-[10px] font-bold text-green-800">01/12/23 - 30/11/24</p>
          <span className="text-[8px] px-1 py-0.5 bg-green-200 text-green-800 rounded-full">Disponível</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-1.5">
          <p className="text-[8px] text-blue-600 font-medium">PRÓXIMO</p>
          <p className="text-[10px] font-bold text-blue-800">01/12/24 - 30/11/25</p>
          <span className="text-[8px] px-1 py-0.5 bg-blue-200 text-blue-800 rounded-full">Em andamento</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded p-1.5">
          <p className="text-[8px] text-slate-500 font-medium">DIAS DISPONÍVEIS</p>
          <p className="text-xl font-bold text-slate-800">30</p>
        </div>
      </div>

      {/* Simulador */}
      <div className="bg-slate-50 rounded-lg p-2">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[9px] text-slate-500 font-medium">Dias de Gozo</label>
            <input type="number" min={10} max={30} value={diasGozo} onChange={e => setDiasGozo(Math.min(30, Math.max(10, parseInt(e.target.value) || 10)))} className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 font-medium">Abono (dias)</label>
            <input type="number" min={0} max={10} value={diasAbono} onChange={e => setDiasAbono(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
          </div>
        </div>
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between"><span className="text-slate-600">Férias ({diasGozo}d)</span><span className="font-mono text-green-700">{formatarMoeda(ferias.valorFerias)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">1/3 Constitucional</span><span className="font-mono text-green-700">{formatarMoeda(ferias.valorTerco)}</span></div>
          {diasAbono > 0 && <div className="flex justify-between"><span className="text-slate-600">Abono ({diasAbono}d)</span><span className="font-mono text-green-700">{formatarMoeda(ferias.valorAbono)}</span></div>}
          <div className="flex justify-between border-t border-slate-200 pt-0.5"><span className="text-slate-600">(-) INSS</span><span className="font-mono text-red-700">{formatarMoeda(Math.round(inssFerias * 100) / 100)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">(-) IRRF</span><span className="font-mono text-red-700">{formatarMoeda(Math.round(Math.max(0, irrfFerias) * 100) / 100)}</span></div>
          <div className="flex justify-between bg-blue-900 text-white rounded px-2 py-1 mt-1 font-bold">
            <span>LÍQUIDO</span><span className="font-mono">{formatarMoeda(Math.round(liquido * 100) / 100)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: Rescisão Compacta
// ============================================================
function RescisaoCompacta({ colaborador }: { colaborador: any }) {
  const [tipoRescisao, setTipoRescisao] = useState<TipoRescisao>('sem_justa_causa');
  const [dataDemissao, setDataDemissao] = useState('2024-12-31');
  const [avisoPrevio, setAvisoPrevio] = useState<'trabalhado' | 'indenizado' | 'nao_aplicavel'>('indenizado');

  const saldoFGTS = colaborador.salarioBase * 0.08 * 48;
  const rescisao = calcularRescisao({
    salarioBase: colaborador.salarioBase, dataAdmissao: colaborador.dataAdmissao, dataDemissao,
    tipoRescisao, avisoPrevio, saldoFGTS, numDependentes: colaborador.numDependentes,
  });

  const handlePDF = () => {
    const termo = {
      colaboradorId: colaborador.id, tipoRescisao, dataAdmissao: colaborador.dataAdmissao, dataDemissao,
      avisoPrevio, diasAvisoPrevio: avisoPrevio === 'indenizado' ? 30 : 0,
      saldoSalario: rescisao.saldoSalario, feriasProporcionais: rescisao.feriasProporcionais,
      tercoFerias: rescisao.tercoFerias, decimoTerceiroProporcional: rescisao.decimoTerceiro,
      multaFGTS: rescisao.multaFGTS, valorFGTS: saldoFGTS,
      totalProventos: rescisao.totalProventos, totalDescontos: rescisao.totalDescontos,
      valorLiquido: rescisao.valorLiquido, dataProcessamento: new Date().toISOString().split('T')[0],
    };
    generatePDFRescisao(colaborador, termo);
  };

  return (
    <div className="flex-1 p-2 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold text-slate-700">Simulador de Rescisão (TRCT)</h4>
        <button onClick={handlePDF} className="px-2 py-1 text-[10px] font-medium bg-blue-900 text-white rounded hover:bg-blue-800 flex items-center gap-1">
          <Download size={9} /> PDF
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div>
          <label className="text-[9px] text-slate-500 font-medium">Tipo</label>
          <select value={tipoRescisao} onChange={e => setTipoRescisao(e.target.value as TipoRescisao)} className="w-full px-1.5 py-1 text-[10px] border border-slate-200 rounded">
            <option value="sem_justa_causa">Sem Justa Causa</option>
            <option value="com_justa_causa">Com Justa Causa</option>
            <option value="pedido_demissao">Pedido Demissão</option>
            <option value="acordo">Acordo Mútuo</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] text-slate-500 font-medium">Data Demissão</label>
          <input type="date" value={dataDemissao} onChange={e => setDataDemissao(e.target.value)} className="w-full px-1.5 py-1 text-[10px] border border-slate-200 rounded" />
        </div>
        <div>
          <label className="text-[9px] text-slate-500 font-medium">Aviso Prévio</label>
          <select value={avisoPrevio} onChange={e => setAvisoPrevio(e.target.value as any)} className="w-full px-1.5 py-1 text-[10px] border border-slate-200 rounded">
            <option value="indenizado">Indenizado</option>
            <option value="trabalhado">Trabalhado</option>
            <option value="nao_aplicavel">N/A</option>
          </select>
        </div>
      </div>

      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between py-0.5 border-b border-slate-50"><span className="text-slate-600">Saldo de Salário</span><span className="font-mono text-green-700">{formatarMoeda(rescisao.saldoSalario)}</span></div>
        {rescisao.avisoPrevioValor > 0 && <div className="flex justify-between py-0.5 border-b border-slate-50"><span className="text-slate-600">Aviso Prévio</span><span className="font-mono text-green-700">{formatarMoeda(rescisao.avisoPrevioValor)}</span></div>}
        <div className="flex justify-between py-0.5 border-b border-slate-50"><span className="text-slate-600">Férias Proporcionais ({rescisao.diasFeriasProporcional}d)</span><span className="font-mono text-green-700">{formatarMoeda(rescisao.feriasProporcionais)}</span></div>
        <div className="flex justify-between py-0.5 border-b border-slate-50"><span className="text-slate-600">1/3 Férias</span><span className="font-mono text-green-700">{formatarMoeda(rescisao.tercoFerias)}</span></div>
        <div className="flex justify-between py-0.5 border-b border-slate-50"><span className="text-slate-600">13º Proporcional ({rescisao.mesesDecimoTerceiro}/12)</span><span className="font-mono text-green-700">{formatarMoeda(rescisao.decimoTerceiro)}</span></div>
        {rescisao.multaFGTS > 0 && <div className="flex justify-between py-0.5 border-b border-slate-50"><span className="text-slate-600">Multa FGTS</span><span className="font-mono text-green-700">{formatarMoeda(rescisao.multaFGTS)}</span></div>}
        <div className="flex justify-between py-0.5 border-b border-slate-200"><span className="text-slate-600">(-) Descontos</span><span className="font-mono text-red-700">{formatarMoeda(rescisao.totalDescontos)}</span></div>
        <div className="flex justify-between bg-blue-900 text-white rounded px-2 py-1.5 mt-1 font-bold">
          <span className="text-xs">LÍQUIDO RESCISÃO</span><span className="font-mono text-sm">{formatarMoeda(rescisao.valorLiquido)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: Histórico Compacto
// ============================================================
function HistoricoCompacto({ data }: { data: any[] }) {
  return (
    <div className="flex-1 p-2 overflow-y-auto">
      <h4 className="text-[11px] font-bold text-slate-700 mb-2">Evolução Remuneração (6 meses)</h4>
      <div className="h-[140px] mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorBruto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLiquido2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="bruto" stroke="#1e3a5f" strokeWidth={1.5} fill="url(#colorBruto)" name="Bruto" />
            <Area type="monotone" dataKey="liquido" stroke="#10b981" strokeWidth={1.5} fill="url(#colorLiquido2)" name="Líquido" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-1 text-left text-slate-400 font-medium">Mês</th>
            <th className="py-1 text-right text-slate-400 font-medium">Bruto</th>
            <th className="py-1 text-right text-slate-400 font-medium">Líquido</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-50">
              <td className="py-0.5 font-medium text-slate-700">{row.mes}/24</td>
              <td className="py-0.5 text-right font-mono text-slate-600">{formatarMoeda(row.bruto)}</td>
              <td className="py-0.5 text-right font-mono text-green-700 font-medium">{formatarMoeda(row.liquido)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

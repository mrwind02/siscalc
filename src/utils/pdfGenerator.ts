// ============================================================
// GERADOR DE PDF - Holerite, Férias e Rescisão
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Colaborador, FolhaPagamento, ReciboFerias, TermoRescisao, Empresa } from '../types';
import { formatarMoeda, formatarCPF, formatarData } from './taxEngine';

const EMPRESA_PADRAO: Empresa = {
  razaoSocial: 'EMPRESA EXEMPLO LTDA',
  cnpj: '12.345.678/0001-99',
  endereco: 'Rua das Flores, 123 - Centro',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '01001-000',
};

function addHeader(doc: jsPDF, empresa: Empresa = EMPRESA_PADRAO) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.razaoSocial, 105, 15, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${empresa.cnpj}`, 105, 21, { align: 'center' });
  doc.text(`${empresa.endereco} - ${empresa.cidade}/${empresa.uf} - CEP: ${empresa.cep}`, 105, 26, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);
}

export function gerarPDFHolerite(colaborador: Colaborador, folha: FolhaPagamento, empresa?: Empresa) {
  const doc = new jsPDF();
  addHeader(doc, empresa);

  // Dados do colaborador
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO COLABORADOR', 14, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nome: ${colaborador.nomeCompleto}`, 14, 44);
  doc.text(`CPF: ${formatarCPF(colaborador.cpf)}`, 14, 50);
  doc.text(`Cargo: ${colaborador.cargo}`, 14, 56);
  doc.text(`Departamento: ${colaborador.departamento}`, 14, 62);
  doc.text(`Admissão: ${formatarData(colaborador.dataAdmissao)}`, 110, 44);
  doc.text(`Mês Referência: ${folha.mesReferencia.split('-').reverse().join('/')}`, 110, 50);
  doc.text(`Data Processamento: ${formatarData(folha.dataProcessamento)}`, 110, 56);

  // Tabela de proventos e descontos
  const tableData: string[][] = [];
  const maxRows = Math.max(folha.proventos.length, folha.descontos.length);
  
  for (let i = 0; i < maxRows; i++) {
    const prov = folha.proventos[i];
    const desc = folha.descontos[i];
    tableData.push([
      prov?.codigo || '',
      prov?.descricao || '',
      prov?.referencia || '',
      prov ? formatarMoeda(prov.provento) : '',
      desc?.codigo || '',
      desc?.descricao || '',
      desc?.referencia || '',
      desc ? formatarMoeda(desc.desconto) : '',
    ]);
  }

  // Totais row
  tableData.push([
    '', 'TOTAIS', '', formatarMoeda(folha.totalProventos),
    '', 'TOTAIS', '', formatarMoeda(folha.totalDescontos),
  ]);

  autoTable(doc, {
    startY: 68,
    head: [['Cód', 'Proventos', 'Ref.', 'Valor', 'Cód', 'Descontos', 'Ref.', 'Valor']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [26, 54, 93], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 12 },
      5: { cellWidth: 45 },
      6: { cellWidth: 15 },
      7: { cellWidth: 25, halign: 'right' },
    },
  });

  // Bases de cálculo
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BASES DE CÁLCULO', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Base INSS: ${formatarMoeda(folha.baseINSS)}`, 14, finalY + 6);
  doc.text(`INSS: ${formatarMoeda(folha.valorINSS)}`, 14, finalY + 12);
  doc.text(`Base IRRF: ${formatarMoeda(folha.baseIRRF)}`, 14, finalY + 18);
  doc.text(`IRRF: ${formatarMoeda(folha.valorIRRF)}`, 14, finalY + 24);
  doc.text(`Base FGTS: ${formatarMoeda(folha.baseFGTS)}`, 14, finalY + 30);
  doc.text(`FGTS: ${formatarMoeda(folha.valorFGTS)}`, 14, finalY + 36);

  // Líquido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`SALÁRIO LÍQUIDO: ${formatarMoeda(folha.salarioLiquido)}`, 120, finalY + 20);

  // Assinatura
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const sigY = finalY + 55;
  doc.line(50, sigY, 160, sigY);
  doc.text('Assinatura do Colaborador', 105, sigY + 5, { align: 'center' });

  doc.save(`holerite_${colaborador.nomeCompleto.replace(/\s/g, '_')}_${folha.mesReferencia}.pdf`);
}

export function gerarPDFFerias(colaborador: Colaborador, recibo: ReciboFerias, empresa?: Empresa) {
  const doc = new jsPDF();
  addHeader(doc, empresa);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE FÉRIAS', 105, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Colaborador: ${colaborador.nomeCompleto}`, 14, 50);
  doc.text(`CPF: ${formatarCPF(colaborador.cpf)}`, 14, 56);
  doc.text(`Período Aquisitivo: ${formatarData(recibo.periodoAquisitivo.inicio)} a ${formatarData(recibo.periodoAquisitivo.fim)}`, 14, 62);
  doc.text(`Período de Gozo: ${formatarData(recibo.dataInicio)} a ${formatarData(recibo.dataFim)}`, 14, 68);
  doc.text(`Dias de Gozo: ${recibo.diasGozo}`, 14, 74);
  doc.text(`Abono Pecuniário: ${recibo.abonoPecuniario} dias`, 14, 80);

  const tableData = [
    ['Férias', formatarMoeda(recibo.valorFerias)],
    ['1/3 Constitucional', formatarMoeda(recibo.valorTerco)],
    ['Abono Pecuniário', formatarMoeda(recibo.valorAbono)],
    ['(-) INSS', formatarMoeda(recibo.descontoINSS)],
    ['(-) IRRF', formatarMoeda(recibo.descontoIRRF)],
    ['VALOR LÍQUIDO', formatarMoeda(recibo.valorLiquido)],
  ];

  autoTable(doc, {
    startY: 88,
    head: [['Descrição', 'Valor']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [26, 54, 93] },
    columnStyles: { 1: { halign: 'right' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.line(50, finalY, 160, finalY);
  doc.text('Assinatura do Colaborador', 105, finalY + 5, { align: 'center' });

  doc.save(`ferias_${colaborador.nomeCompleto.replace(/\s/g, '_')}.pdf`);
}

export function generatePDFRescisao(colaborador: Colaborador, termo: TermoRescisao, empresa?: Empresa) {
  const doc = new jsPDF();
  addHeader(doc, empresa);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESCISÃO DO CONTRATO DE TRABALHO (TRCT)', 105, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Colaborador: ${colaborador.nomeCompleto}`, 14, 50);
  doc.text(`CPF: ${formatarCPF(colaborador.cpf)}`, 14, 56);
  doc.text(`Cargo: ${colaborador.cargo}`, 14, 62);
  doc.text(`Data Admissão: ${formatarData(termo.dataAdmissao)}`, 14, 68);
  doc.text(`Data Demissão: ${formatarData(termo.dataDemissao)}`, 14, 74);
  doc.text(`Tipo de Rescisão: ${getTipoRescisaoLabel(termo.tipoRescisao)}`, 14, 80);
  doc.text(`Aviso Prévio: ${termo.avisoPrevio === 'trabalhado' ? 'Trabalhado' : termo.avisoPrevio === 'indenizado' ? 'Indenizado' : 'N/A'}`, 14, 86);

  const tableData = [
    ['Saldo de Salário', formatarMoeda(termo.saldoSalario)],
    ['Aviso Prévio', formatarMoeda(0)],
    ['Férias Proporcionais', formatarMoeda(termo.feriasProporcionais)],
    ['1/3 Férias', formatarMoeda(termo.tercoFerias)],
    ['13º Proporcional', formatarMoeda(termo.decimoTerceiroProporcional)],
    ['Multa FGTS', formatarMoeda(termo.multaFGTS)],
    ['', ''],
    ['TOTAL PROVENTOS', formatarMoeda(termo.totalProventos)],
    ['TOTAL DESCONTOS', formatarMoeda(termo.totalDescontos)],
    ['VALOR LÍQUIDO', formatarMoeda(termo.valorLiquido)],
  ];

  autoTable(doc, {
    startY: 94,
    head: [['Verbas Rescisórias', 'Valor']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [26, 54, 93] },
    columnStyles: { 1: { halign: 'right' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.line(30, finalY, 90, finalY);
  doc.text('Empregador', 60, finalY + 5, { align: 'center' });
  doc.line(120, finalY, 180, finalY);
  doc.text('Empregado', 150, finalY + 5, { align: 'center' });

  doc.save(`rescisao_${colaborador.nomeCompleto.replace(/\s/g, '_')}.pdf`);
}

function getTipoRescisaoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'sem_justa_causa': 'Dispensa sem Justa Causa',
    'com_justa_causa': 'Dispensa com Justa Causa',
    'pedido_demissao': 'Pedido de Demissão',
    'acordo': 'Acordo Mútuo (Reforma Trabalhista)',
  };
  return labels[tipo] || tipo;
}

// ============================================================
// GERADOR DE PDF - Holerite, Férias e Rescisão
// ============================================================

import { jsPDF } from 'jspdf';
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
  try {
    console.log('=== INÍCIO GERAÇÃO PDF ===');
    console.log('Colaborador:', colaborador.nomeCompleto);
    console.log('Folha:', folha);
    
    const doc = new jsPDF();
    console.log('jsPDF criado com sucesso');
    console.log('doc.autoTable existe?', typeof (doc as any).autoTable);
    
    addHeader(doc, empresa);
    console.log('Header adicionado');

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

    console.log('Chamando autoTable...');
    console.log('tableData:', tableData);
    
    // Usa a função autoTable com o documento
    autoTable(doc, {
      startY: 68,
      head: [['Cód', 'Proventos', 'Ref.', 'Valor', 'Cód', 'Descontos', 'Ref.', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [26, 54, 93], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 12 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 10 },
        5: { cellWidth: 38 },
        6: { cellWidth: 12 },
        7: { cellWidth: 22, halign: 'right' },
      },
    });
    console.log('autoTable concluído com sucesso');

    // Bases de cálculo
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const yBase = finalY + 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BASES DE CÁLCULO', 14, yBase);
    doc.setFont('helvetica', 'normal');
    doc.text(`Base INSS: ${formatarMoeda(folha.baseINSS)}`, 14, yBase + 6);
    doc.text(`INSS: ${formatarMoeda(folha.valorINSS)}`, 14, yBase + 12);
    doc.text(`Base IRRF: ${formatarMoeda(folha.baseIRRF)}`, 14, yBase + 18);
    doc.text(`IRRF: ${formatarMoeda(folha.valorIRRF)}`, 14, yBase + 24);
    doc.text(`Base FGTS: ${formatarMoeda(folha.baseFGTS)}`, 14, yBase + 30);
    doc.text(`FGTS: ${formatarMoeda(folha.valorFGTS)}`, 14, yBase + 36);

    // Líquido
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`SALÁRIO LÍQUIDO: ${formatarMoeda(folha.salarioLiquido)}`, 120, yBase + 20);

    // Assinatura
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const sigY = yBase + 55;
    doc.line(50, sigY, 160, sigY);
    doc.text('Assinatura do Colaborador', 105, sigY + 5, { align: 'center' });

    console.log('Gerando PDF...');
    const filename = `holerite_${colaborador.nomeCompleto.replace(/\s/g, '_')}_${folha.mesReferencia}.pdf`;
    
    // Gera o PDF como Blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Cria modal para exibir o PDF
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      width: 100%;
      max-width: 900px;
      height: 90vh;
      border-radius: 10px;
      position: relative;
      display: flex;
      flex-direction: column;
    `;
    
    // Header do modal
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `Holerite - ${filename}`;
    title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px;';
    
    // Botão de download
    const downloadBtn = document.createElement('a');
    downloadBtn.href = pdfUrl;
    downloadBtn.download = filename;
    downloadBtn.textContent = '⬇ Download';
    downloadBtn.style.cssText = `
      padding: 8px 16px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    `;
    
    // Botão de fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Fechar';
    closeBtn.style.cssText = `
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
      URL.revokeObjectURL(pdfUrl);
    };
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(buttonContainer);
    
    // Iframe para exibir o PDF com permissões adequadas
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
      border-radius: 0 0 10px 10px;
    `;
    
    container.appendChild(header);
    container.appendChild(iframe);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    console.log('PDF exibido em modal com Blob URL');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export function gerarPDFFerias(colaborador: Colaborador, recibo: ReciboFerias, empresa?: Empresa) {
  try {
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

    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const sigY = finalY + 15;
    doc.line(50, sigY, 160, sigY);
    doc.text('Assinatura do Colaborador', 105, sigY + 5, { align: 'center' });

    const filename = `ferias_${colaborador.nomeCompleto.replace(/\s/g, '_')}.pdf`;
    
    // Gera o PDF como Blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Cria modal para exibir o PDF
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      width: 100%;
      max-width: 900px;
      height: 90vh;
      border-radius: 10px;
      position: relative;
      display: flex;
      flex-direction: column;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `Recibo de Férias - ${filename}`;
    title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px;';
    
    const downloadBtn = document.createElement('a');
    downloadBtn.href = pdfUrl;
    downloadBtn.download = filename;
    downloadBtn.textContent = '⬇ Download';
    downloadBtn.style.cssText = `
      padding: 8px 16px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Fechar';
    closeBtn.style.cssText = `
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
      URL.revokeObjectURL(pdfUrl);
    };
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(buttonContainer);
    
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
      border-radius: 0 0 10px 10px;
    `;
    
    container.appendChild(header);
    container.appendChild(iframe);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    console.log('PDF de férias exibido em modal com Blob URL');
  } catch (error) {
    console.error('Erro ao gerar PDF de férias:', error);
    alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export function generatePDFRescisao(colaborador: Colaborador, termo: TermoRescisao, empresa?: Empresa) {
  try {
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

    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    const sigY = finalY + 15;
    doc.line(30, sigY, 90, sigY);
    doc.text('Empregador', 60, sigY + 5, { align: 'center' });
    doc.line(120, sigY, 180, sigY);
    doc.text('Empregado', 150, sigY + 5, { align: 'center' });

    const filename = `rescisao_${colaborador.nomeCompleto.replace(/\s/g, '_')}.pdf`;
    
    // Gera o PDF como Blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Cria modal para exibir o PDF
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      width: 100%;
      max-width: 900px;
      height: 90vh;
      border-radius: 10px;
      position: relative;
      display: flex;
      flex-direction: column;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `Termo de Rescisão - ${filename}`;
    title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px;';
    
    const downloadBtn = document.createElement('a');
    downloadBtn.href = pdfUrl;
    downloadBtn.download = filename;
    downloadBtn.textContent = '⬇ Download';
    downloadBtn.style.cssText = `
      padding: 8px 16px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Fechar';
    closeBtn.style.cssText = `
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
      URL.revokeObjectURL(pdfUrl);
    };
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(buttonContainer);
    
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
      border-radius: 0 0 10px 10px;
    `;
    
    container.appendChild(header);
    container.appendChild(iframe);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    console.log('PDF de rescisão exibido em modal com Blob URL');
  } catch (error) {
    console.error('Erro ao gerar PDF de rescisão:', error);
    alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
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

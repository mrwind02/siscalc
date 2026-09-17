// ============================================================
// GERADOR DE PDF - Solução Definitiva sem Iframe/Object
// Usa preview HTML + download direto
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

// ============================================================
// FUNÇÃO HELPER: Modal com Preview HTML + Download
// ============================================================
function exibirPDFComPreview(doc: jsPDF, titulo: string, filename: string, previewHTML: string) {
  // Converte PDF para Data URL
  const pdfDataUri = doc.output('datauristring');
  
  // Cria modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
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
    max-height: 90vh;
    border-radius: 10px;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 15px 20px;
    border-bottom: 2px solid #1e40af;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
  `;
  
  const title = document.createElement('h3');
  title.textContent = titulo;
  title.style.cssText = 'margin: 0; font-size: 18px; font-weight: 600; color: #1e3a5f;';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 10px;';
  
  // Botão Download - método direto
  const downloadBtn = document.createElement('a');
  downloadBtn.href = pdfDataUri;
  downloadBtn.download = filename;
  downloadBtn.textContent = '⬇ Baixar PDF';
  downloadBtn.style.cssText = `
    padding: 10px 20px;
    background: #1e40af;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
  `;
  
  // Botão Fechar
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Fechar';
  closeBtn.style.cssText = `
    padding: 10px 20px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  closeBtn.onclick = () => {
    document.body.removeChild(modal);
  };
  
  buttonContainer.appendChild(downloadBtn);
  buttonContainer.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(buttonContainer);
  
  // Conteúdo - Preview HTML
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow: auto;
    padding: 30px;
    background: white;
  `;
  content.innerHTML = previewHTML;
  
  container.appendChild(header);
  container.appendChild(content);
  modal.appendChild(container);
  document.body.appendChild(modal);
  
  console.log('PDF gerado com preview HTML:', filename);
}

// ============================================================
// GERAR PREVIEW HTML DO HOLERITE
// ============================================================
function gerarPreviewHolerite(colaborador: Colaborador, folha: FolhaPagamento): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #1e3a5f; font-size: 20px;">${EMPRESA_PADRAO.razaoSocial}</h1>
        <p style="margin: 5px 0 0; color: #666; font-size: 12px;">CNPJ: ${EMPRESA_PADRAO.cnpj}</p>
        <p style="margin: 2px 0 0; color: #666; font-size: 11px;">${EMPRESA_PADRAO.endereco} - ${EMPRESA_PADRAO.cidade}/${EMPRESA_PADRAO.uf}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e3a5f; font-size: 14px; margin: 0 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">DADOS DO COLABORADOR</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div><strong>Nome:</strong> ${colaborador.nomeCompleto}</div>
          <div><strong>Admissão:</strong> ${formatarData(colaborador.dataAdmissao)}</div>
          <div><strong>CPF:</strong> ${formatarCPF(colaborador.cpf)}</div>
          <div><strong>Mês Referência:</strong> ${folha.mesReferencia.split('-').reverse().join('/')}</div>
          <div><strong>Cargo:</strong> ${colaborador.cargo}</div>
          <div><strong>Departamento:</strong> ${colaborador.departamento}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e3a5f; font-size: 14px; margin: 0 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">PROVENTOS E DESCONTOS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #1e3a5f; color: white;">
              <th style="padding: 8px; text-align: left;">Cód</th>
              <th style="padding: 8px; text-align: left;">Proventos</th>
              <th style="padding: 8px; text-align: right;">Valor</th>
              <th style="padding: 8px; text-align: left;">Cód</th>
              <th style="padding: 8px; text-align: left;">Descontos</th>
              <th style="padding: 8px; text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${folha.proventos.map((p, i) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px;">${p.codigo}</td>
                <td style="padding: 6px;">${p.descricao}</td>
                <td style="padding: 6px; text-align: right; color: #059669;">${formatarMoeda(p.provento)}</td>
                <td style="padding: 6px;">${folha.descontos[i]?.codigo || ''}</td>
                <td style="padding: 6px;">${folha.descontos[i]?.descricao || ''}</td>
                <td style="padding: 6px; text-align: right; color: #dc2626;">${folha.descontos[i] ? formatarMoeda(folha.descontos[i].desconto) : ''}</td>
              </tr>
            `).join('')}
            <tr style="background: #f5f5f5; font-weight: bold;">
              <td colspan="2" style="padding: 8px;">TOTAIS</td>
              <td style="padding: 8px; text-align: right; color: #059669;">${formatarMoeda(folha.totalProventos)}</td>
              <td colspan="2" style="padding: 8px;">TOTAIS</td>
              <td style="padding: 8px; text-align: right; color: #dc2626;">${formatarMoeda(folha.totalDescontos)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e3a5f; font-size: 14px; margin: 0 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">BASES DE CÁLCULO</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 12px;">
          <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
            <div style="color: #666; font-size: 10px; text-transform: uppercase;">INSS</div>
            <div style="font-size: 16px; font-weight: bold; color: #1e3a5f;">${formatarMoeda(folha.valorINSS)}</div>
            <div style="font-size: 10px; color: #999;">Base: ${formatarMoeda(folha.baseINSS)}</div>
          </div>
          <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
            <div style="color: #666; font-size: 10px; text-transform: uppercase;">IRRF</div>
            <div style="font-size: 16px; font-weight: bold; color: #1e3a5f;">${formatarMoeda(folha.valorIRRF)}</div>
            <div style="font-size: 10px; color: #999;">Base: ${formatarMoeda(folha.baseIRRF)}</div>
          </div>
          <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
            <div style="color: #666; font-size: 10px; text-transform: uppercase;">FGTS</div>
            <div style="font-size: 16px; font-weight: bold; color: #1e3a5f;">${formatarMoeda(folha.valorFGTS)}</div>
            <div style="font-size: 10px; color: #999;">Base: ${formatarMoeda(folha.baseFGTS)}</div>
          </div>
        </div>
      </div>
      
      <div style="background: #1e3a5f; color: white; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 14px; font-weight: bold;">SALÁRIO LÍQUIDO</div>
        <div style="font-size: 24px; font-weight: bold;">${formatarMoeda(folha.salarioLiquido)}</div>
      </div>
    </div>
  `;
}

// ============================================================
// GERAR PDF HOLERITE
// ============================================================
export function gerarPDFHolerite(colaborador: Colaborador, folha: FolhaPagamento, empresa?: Empresa) {
  try {
    console.log('=== GERANDO PDF HOLERITE ===');
    
    const doc = new jsPDF();
    addHeader(doc, empresa);

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

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`SALÁRIO LÍQUIDO: ${formatarMoeda(folha.salarioLiquido)}`, 120, yBase + 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const sigY = yBase + 55;
    doc.line(50, sigY, 160, sigY);
    doc.text('Assinatura do Colaborador', 105, sigY + 5, { align: 'center' });

    const filename = `holerite_${colaborador.nomeCompleto.replace(/\s/g, '_')}_${folha.mesReferencia}.pdf`;
    const previewHTML = gerarPreviewHolerite(colaborador, folha);
    exibirPDFComPreview(doc, `Holerite - ${colaborador.nomeCompleto}`, filename, previewHTML);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// ============================================================
// GERAR PDF FÉRIAS (simplificado)
// ============================================================
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

    const tableData = [
      ['Férias', formatarMoeda(recibo.valorFerias)],
      ['1/3 Constitucional', formatarMoeda(recibo.valorTerco)],
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

    const filename = `ferias_${colaborador.nomeCompleto.replace(/\s/g, '_')}.pdf`;
    const previewHTML = `<div style="text-align: center; padding: 40px;">
      <h2>Recibo de Férias</h2>
      <p><strong>${colaborador.nomeCompleto}</strong></p>
      <p>Valor Líquido: <strong>${formatarMoeda(recibo.valorLiquido)}</strong></p>
    </div>`;
    exibirPDFComPreview(doc, `Férias - ${colaborador.nomeCompleto}`, filename, previewHTML);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// ============================================================
// GERAR PDF RESCISÃO (simplificado)
// ============================================================
export function generatePDFRescisao(colaborador: Colaborador, termo: TermoRescisao, empresa?: Empresa) {
  try {
    const doc = new jsPDF();
    addHeader(doc, empresa);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE RESCISÃO', 105, 38, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Colaborador: ${colaborador.nomeCompleto}`, 14, 50);
    doc.text(`CPF: ${formatarCPF(colaborador.cpf)}`, 14, 56);

    const tableData = [
      ['Saldo de Salário', formatarMoeda(termo.saldoSalario)],
      ['Férias Proporcionais', formatarMoeda(termo.feriasProporcionais)],
      ['VALOR LÍQUIDO', formatarMoeda(termo.valorLiquido)],
    ];

    autoTable(doc, {
      startY: 88,
      head: [['Verba', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [26, 54, 93] },
      columnStyles: { 1: { halign: 'right' } },
    });

    const filename = `rescisao_${colaborador.nomeCompleto.replace(/\s/g, '_')}.pdf`;
    const previewHTML = `<div style="text-align: center; padding: 40px;">
      <h2>Termo de Rescisão</h2>
      <p><strong>${colaborador.nomeCompleto}</strong></p>
      <p>Valor Líquido: <strong>${formatarMoeda(termo.valorLiquido)}</strong></p>
    </div>`;
    exibirPDFComPreview(doc, `Rescisão - ${colaborador.nomeCompleto}`, filename, previewHTML);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

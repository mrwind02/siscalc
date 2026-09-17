// ============================================================
// FUNÇÃO DE IMPRESSÃO - Contorna restrições de sandbox
// ============================================================

import { Colaborador, FolhaPagamento } from '../types';
import { formatarMoeda, formatarCPF, formatarData } from './taxEngine';

export function imprimirHolerite(colaborador: Colaborador, folha: FolhaPagamento) {
  console.log('Iniciando impressão...');
  
  // Cria o conteúdo HTML formatado para impressão
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Holerite - ${colaborador.nomeCompleto}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1e3a5f;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 14pt;
          color: #1e3a5f;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 9pt;
          color: #666;
        }
        .section {
          margin-bottom: 15px;
        }
        .section-title {
          font-size: 10pt;
          font-weight: bold;
          color: #1e3a5f;
          margin-bottom: 8px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          font-size: 9pt;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
        }
        .info-label {
          color: #666;
        }
        .info-value {
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
          margin-top: 5px;
        }
        th {
          background-color: #1e3a5f;
          color: white;
          padding: 6px 4px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 4px;
          border-bottom: 1px solid #eee;
        }
        .text-right {
          text-align: right;
        }
        .total-row {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        .bases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          font-size: 9pt;
          margin-top: 10px;
        }
        .base-item {
          border: 1px solid #ddd;
          padding: 8px;
          border-radius: 4px;
        }
        .base-label {
          font-size: 8pt;
          color: #666;
          text-transform: uppercase;
        }
        .base-value {
          font-size: 11pt;
          font-weight: bold;
          color: #1e3a5f;
        }
        .liquido-box {
          background-color: #1e3a5f;
          color: white;
          padding: 15px;
          border-radius: 5px;
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .liquido-label {
          font-size: 11pt;
          font-weight: bold;
        }
        .liquido-value {
          font-size: 16pt;
          font-weight: bold;
        }
        .signature {
          margin-top: 40px;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #333;
          width: 300px;
          margin: 0 auto 5px;
        }
        .signature-text {
          font-size: 9pt;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>EMPRESA EXEMPLO LTDA</h1>
        <p>CNPJ: 12.345.678/0001-99</p>
        <p>Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01001-000</p>
      </div>

      <div class="section">
        <div class="section-title">DADOS DO COLABORADOR</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nome:</span>
            <span class="info-value">${colaborador.nomeCompleto}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Admissão:</span>
            <span class="info-value">${formatarData(colaborador.dataAdmissao)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">CPF:</span>
            <span class="info-value">${formatarCPF(colaborador.cpf)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Mês Referência:</span>
            <span class="info-value">${folha.mesReferencia.split('-').reverse().join('/')}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Cargo:</span>
            <span class="info-value">${colaborador.cargo}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data Processamento:</span>
            <span class="info-value">${formatarData(folha.dataProcessamento)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Departamento:</span>
            <span class="info-value">${colaborador.departamento}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PROVENTOS E DESCONTOS</div>
        <table>
          <thead>
            <tr>
              <th>Cód</th>
              <th>Proventos</th>
              <th>Ref.</th>
              <th class="text-right">Valor</th>
              <th>Cód</th>
              <th>Descontos</th>
              <th>Ref.</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${generateTableRows(folha)}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3"></td>
              <td class="text-right">${formatarMoeda(folha.totalProventos)}</td>
              <td colspan="3"></td>
              <td class="text-right">${formatarMoeda(folha.totalDescontos)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="section">
        <div class="section-title">BASES DE CÁLCULO</div>
        <div class="bases-grid">
          <div class="base-item">
            <div class="base-label">INSS</div>
            <div class="base-value">${formatarMoeda(folha.valorINSS)}</div>
            <div style="font-size:8pt;color:#666;">Base: ${formatarMoeda(folha.baseINSS)}</div>
          </div>
          <div class="base-item">
            <div class="base-label">IRRF</div>
            <div class="base-value">${formatarMoeda(folha.valorIRRF)}</div>
            <div style="font-size:8pt;color:#666;">Base: ${formatarMoeda(folha.baseIRRF)}</div>
          </div>
          <div class="base-item">
            <div class="base-label">FGTS</div>
            <div class="base-value">${formatarMoeda(folha.valorFGTS)}</div>
            <div style="font-size:8pt;color:#666;">Base: ${formatarMoeda(folha.baseFGTS)}</div>
          </div>
        </div>
      </div>

      <div class="liquido-box">
        <div class="liquido-label">SALÁRIO LÍQUIDO</div>
        <div class="liquido-value">${formatarMoeda(folha.salarioLiquido)}</div>
      </div>

      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-text">Assinatura do Colaborador</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  // Tenta abrir em nova janela
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      console.log('Janela de impressão aberta');
    } else {
      // Fallback: mostra em modal
      showPrintModal(htmlContent);
    }
  } catch (error) {
    console.error('Erro ao abrir janela de impressão:', error);
    showPrintModal(htmlContent);
  }
}

function generateTableRows(folha: FolhaPagamento): string {
  const maxRows = Math.max(folha.proventos.length, folha.descontos.length);
  let rows = '';
  
  for (let i = 0; i < maxRows; i++) {
    const prov = folha.proventos[i];
    const desc = folha.descontos[i];
    
    rows += '<tr>';
    if (prov) {
      rows += `
        <td>${prov.codigo}</td>
        <td>${prov.descricao}</td>
        <td>${prov.referencia}</td>
        <td class="text-right">${formatarMoeda(prov.provento)}</td>
      `;
    } else {
      rows += '<td></td><td></td><td></td><td></td>';
    }
    
    if (desc) {
      rows += `
        <td>${desc.codigo}</td>
        <td>${desc.descricao}</td>
        <td>${desc.referencia}</td>
        <td class="text-right">${formatarMoeda(desc.desconto)}</td>
      `;
    } else {
      rows += '<td></td><td></td><td></td><td></td>';
    }
    rows += '</tr>';
  }
  
  return rows;
}

function showPrintModal(htmlContent: string) {
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
    max-height: 90vh;
    overflow: auto;
    border-radius: 10px;
    position: relative;
  `;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '× Fechar';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 8px 16px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    z-index: 10;
  `;
  closeButton.onclick = () => document.body.removeChild(modal);
  
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 100%;
    height: 80vh;
    border: none;
  `;
  
  container.appendChild(closeButton);
  container.appendChild(iframe);
  modal.appendChild(container);
  document.body.appendChild(modal);
  
  iframe.srcdoc = htmlContent;
}

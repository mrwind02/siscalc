// ============================================================
// MOTOR DE PROCESSAMENTO DE FOLHA DE PAGAMENTO
// ============================================================

import { Colaborador, Lancamento, FolhaPagamento, ItemFolha } from '../types';
import {
  calcularINSS,
  calcularIRRF,
  calcularFGTS,
  calcularHoraExtra50,
  calcularHoraExtra100,
  calcularDSR,
  calcularAdicionalPericulosidade,
  calcularAdicionalInsalubridade,
  calcularDescontoFalta,
  calcularDescontoAtraso,
  calcularValeTransporte,
} from './taxEngine';

export function processarFolha(
  colaborador: Colaborador,
  lancamentos: Lancamento[],
  mesReferencia: string
): FolhaPagamento {
  const proventos: ItemFolha[] = [];
  const descontos: ItemFolha[] = [];

  // 1. Salário Base
  proventos.push({
    codigo: '001',
    descricao: 'Salário Base',
    referencia: '30 dias',
    provento: colaborador.salarioBase,
    desconto: 0,
  });

  // 2. Adicional de Periculosidade
  if (colaborador.adicionalPericulosidade) {
    const valor = calcularAdicionalPericulosidade(colaborador.salarioBase);
    proventos.push({
      codigo: '010',
      descricao: 'Adicional Periculosidade (30%)',
      referencia: '',
      provento: valor,
      desconto: 0,
    });
  }

  // 3. Adicional de Insalubridade
  if (colaborador.adicionalInsalubridade) {
    const valor = calcularAdicionalInsalubridade(colaborador.salarioBase, colaborador.grauInsalubridade);
    proventos.push({
      codigo: '011',
      descricao: `Adicional Insalubridade`,
      referencia: '',
      provento: valor,
      desconto: 0,
    });
  }

  // 4. Processar lançamentos variáveis
  let totalHorasExtras50 = 0;
  let totalHorasExtras100 = 0;

  const lancamentosMes = lancamentos.filter(l => l.mesReferencia === mesReferencia);

  for (const lanc of lancamentosMes) {
    switch (lanc.tipo) {
      case 'horas_extras_50': {
        const valor = calcularHoraExtra50(colaborador.salarioBase, colaborador.cargaHorariaMensal, lanc.quantidade);
        totalHorasExtras50 += valor;
        proventos.push({
          codigo: '020',
          descricao: `Hora Extra 50% (${lanc.quantidade}h)`,
          referencia: `${lanc.quantidade}h`,
          provento: valor,
          desconto: 0,
        });
        break;
      }
      case 'horas_extras_100': {
        const valor = calcularHoraExtra100(colaborador.salarioBase, colaborador.cargaHorariaMensal, lanc.quantidade);
        totalHorasExtras100 += valor;
        proventos.push({
          codigo: '021',
          descricao: `Hora Extra 100% (${lanc.quantidade}h)`,
          referencia: `${lanc.quantidade}h`,
          provento: valor,
          desconto: 0,
        });
        break;
      }
      case 'bonus':
      case 'comissao':
      case 'outro_provento': {
        proventos.push({
          codigo: '030',
          descricao: lanc.descricao,
          referencia: '',
          provento: lanc.valorTotal,
          desconto: 0,
        });
        break;
      }
      case 'falta': {
        const valor = calcularDescontoFalta(colaborador.salarioBase, colaborador.cargaHorariaMensal, lanc.quantidade);
        descontos.push({
          codigo: '100',
          descricao: `Falta (${lanc.quantidade} dia(s))`,
          referencia: `${lanc.quantidade}d`,
          provento: 0,
          desconto: valor,
        });
        break;
      }
      case 'atraso': {
        const valor = calcularDescontoAtraso(colaborador.salarioBase, colaborador.cargaHorariaMensal, lanc.quantidade);
        descontos.push({
          codigo: '101',
          descricao: `Atraso (${lanc.quantidade}h)`,
          referencia: `${lanc.quantidade}h`,
          provento: 0,
          desconto: valor,
        });
        break;
      }
      case 'convenio':
      case 'outro_desconto': {
        descontos.push({
          codigo: '110',
          descricao: lanc.descricao,
          referencia: '',
          provento: 0,
          desconto: lanc.valorTotal,
        });
        break;
      }
      case 'adiantamento': {
        descontos.push({
          codigo: '120',
          descricao: 'Adiantamento Salarial',
          referencia: '',
          provento: 0,
          desconto: lanc.valorTotal,
        });
        break;
      }
    }
  }

  // 5. DSR sobre Horas Extras
  if (totalHorasExtras50 + totalHorasExtras100 > 0) {
    const dsr = calcularDSR(totalHorasExtras50 + totalHorasExtras100);
    if (dsr > 0) {
      proventos.push({
        codigo: '025',
        descricao: 'DSR sobre Horas Extras',
        referencia: '',
        provento: dsr,
        desconto: 0,
      });
    }
  }

  // 6. Vale Transporte
  const vt = calcularValeTransporte(colaborador.salarioBase, colaborador.percentualVT);
  if (vt > 0) {
    descontos.push({
      codigo: '130',
      descricao: `Vale Transporte (${colaborador.percentualVT}%)`,
      referencia: `${colaborador.percentualVT}%`,
      provento: 0,
      desconto: vt,
    });
  }

  // 7. Calcular bases e retenções
  const totalProventos = proventos.reduce((acc, item) => acc + item.provento, 0);
  const totalDescontosSemRetencoes = descontos.reduce((acc, item) => acc + item.desconto, 0);

  // Base INSS = Salário + Adicionais + HE + DSR - Faltas/Atrasos
  const baseINSS = Math.max(0, totalProventos - descontos.filter(d => ['100', '101'].includes(d.codigo)).reduce((a, d) => a + d.desconto, 0));
  const valorINSS = calcularINSS(baseINSS);

  // Base IRRF = Base INSS - INSS - Dependentes
  const baseIRRF = Math.max(0, baseINSS - valorINSS);
  const valorIRRF = calcularIRRF(baseIRRF, colaborador.numDependentes);

  // Base FGTS = Base INSS (sem deduções)
  const baseFGTS = baseINSS;
  const valorFGTS = calcularFGTS(baseFGTS);

  // Adicionar retenções aos descontos
  descontos.push({
    codigo: '200',
    descricao: 'INSS',
    referencia: '',
    provento: 0,
    desconto: valorINSS,
  });

  descontos.push({
    codigo: '210',
    descricao: 'IRRF',
    referencia: '',
    provento: 0,
    desconto: valorIRRF,
  });

  const totalDescontosFinal = totalDescontosSemRetencoes + valorINSS + valorIRRF;
  const salarioLiquido = Math.round((totalProventos - totalDescontosFinal) * 100) / 100;

  return {
    colaboradorId: colaborador.id,
    mesReferencia,
    proventos,
    descontos,
    baseINSS: Math.round(baseINSS * 100) / 100,
    valorINSS,
    baseIRRF: Math.round(baseIRRF * 100) / 100,
    valorIRRF,
    baseFGTS: Math.round(baseFGTS * 100) / 100,
    valorFGTS,
    totalProventos: Math.round(totalProventos * 100) / 100,
    totalDescontos: Math.round(totalDescontosFinal * 100) / 100,
    salarioLiquido,
    dataProcessamento: new Date().toISOString().split('T')[0],
  };
}

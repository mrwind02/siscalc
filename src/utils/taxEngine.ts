// ============================================================
// MOTOR DE CÁLCULO TRIBUTÁRIO - Legislação Brasileira (CLT)
// Tabelas vigentes 2024/2025
// ============================================================

// Tabela INSS Progressiva 2024
const FAIXAS_INSS = [
  { limite: 1412.00, aliquota: 0.075 },
  { limite: 2666.68, aliquota: 0.09 },
  { limite: 4000.03, aliquota: 0.12 },
  { limite: 7786.02, aliquota: 0.14 },
];

// Tabela IRRF Progressiva Mensal 2024
const FAIXAS_IRRF = [
  { limite: 2259.20, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
];

// Dedução por dependente IRRF
export const DEDUCAO_DEPENDENTE_IRRF = 189.59;

// Desconto simplificado IRRF (limite)
export const DESCONTO_SIMPLIFICADO_IRRF = 564.80;

// Alíquota FGTS
export const ALIQUOTA_FGTS = 0.08;

// Alíquota multa rescisória FGTS
export const ALIQUOTA_MULTA_FGTS_SEM_JUSTA_CAUSA = 0.40;
export const ALIQUOTA_MULTA_FGTS_ACORDO = 0.20;

// Adicional noturno (% sobre hora diurna)
export const ADICIONAL_NOTURNO = 0.20;

// Percentuais de adicional
export const ADICIONAL_PERICULOSIDADE = 0.30;
export const GRAUS_INSALUBRIDADE = {
  minimo: 0.10,
  medio: 0.20,
  maximo: 0.40,
};

// Valor do salário mínimo 2024
export const SALARIO_MINIMO = 1412.00;

// ============================================================
// CÁLCULO INSS PROGRESSIVO
// ============================================================
export function calcularINSS(baseCalculo: number): number {
  if (baseCalculo <= 0) return 0;
  
  let inss = 0;
  let baseRestante = Math.min(baseCalculo, 7786.02);
  let limiteAnterior = 0;

  for (const faixa of FAIXAS_INSS) {
    if (baseRestante <= 0) break;
    
    const baseNaFaixa = Math.min(baseRestante, faixa.limite - limiteAnterior);
    inss += baseNaFaixa * faixa.aliquota;
    baseRestante -= baseNaFaixa;
    limiteAnterior = faixa.limite;
  }

  return Math.round(inss * 100) / 100;
}

// ============================================================
// CÁLCULO IRRF PROGRESSIVO
// ============================================================
export function calcularIRRF(
  baseCalculo: number,
  numDependentes: number = 0,
  descontoSimplificado: boolean = false
): number {
  if (baseCalculo <= 0) return 0;

  // Base com dedução de dependentes
  let baseComDependentes = baseCalculo - (numDependentes * DEDUCAO_DEPENDENTE_IRRF);
  
  // Desconto simplificado (se optar e for mais vantajoso)
  if (descontoSimplificado) {
    const baseSimplificada = baseCalculo - DESCONTO_SIMPLIFICADO_IRRF;
    baseComDependentes = Math.max(baseComDependentes, baseSimplificada);
  }

  if (baseComDependentes <= 2259.20) return 0;

  for (const faixa of FAIXAS_IRRF) {
    if (baseComDependentes <= faixa.limite) {
      const irrf = (baseComDependentes * faixa.aliquota) - faixa.deducao;
      return Math.max(0, Math.round(irrf * 100) / 100);
    }
  }

  return 0;
}

// ============================================================
// CÁLCULO FGTS
// ============================================================
export function calcularFGTS(baseCalculo: number): number {
  return Math.round(baseCalculo * ALIQUOTA_FGTS * 100) / 100;
}

// ============================================================
// CÁLCULO DE HORAS
// ============================================================
export function calcularValorHora(salarioBase: number, cargaHorariaMensal: number): number {
  return Math.round((salarioBase / cargaHorariaMensal) * 100) / 100;
}

export function calcularHoraExtra50(salarioBase: number, cargaHorariaMensal: number, horas: number): number {
  const valorHora = calcularValorHora(salarioBase, cargaHorariaMensal);
  return Math.round(valorHora * 1.5 * horas * 100) / 100;
}

export function calcularHoraExtra100(salarioBase: number, cargaHorariaMensal: number, horas: number): number {
  const valorHora = calcularValorHora(salarioBase, cargaHorariaMensal);
  return Math.round(valorHora * 2.0 * horas * 100) / 100;
}

// ============================================================
// CÁLCULO DSR SOBRE HORAS EXTRAS
// ============================================================
export function calcularDSR(
  valorHorasExtras: number,
  diasUteisMes: number = 22,
  domingosFeriados: number = 5
): number {
  if (diasUteisMes === 0) return 0;
  const dsr = (valorHorasExtras / diasUteisMes) * domingosFeriados;
  return Math.round(dsr * 100) / 100;
}

// ============================================================
// CÁLCULO DE ADICIONAIS
// ============================================================
export function calcularAdicionalPericulosidade(salarioBase: number): number {
  return Math.round(salarioBase * ADICIONAL_PERICULOSIDADE * 100) / 100;
}

export function calcularAdicionalInsalubridade(salarioBase: number, grau: 'minimo' | 'medio' | 'maximo'): number {
  // Base de cálculo é o salário mínimo
  return Math.round(SALARIO_MINIMO * GRAUS_INSALUBRIDADE[grau] * 100) / 100;
}

export function calcularAdicionalNoturno(salarioBase: number, cargaHorariaMensal: number, horasNoturnas: number): number {
  const valorHora = calcularValorHora(salarioBase, cargaHorariaMensal);
  return Math.round(valorHora * (1 + ADICIONAL_NOTURNO) * horasNoturnas * 100) / 100;
}

// ============================================================
// CÁLCULO DE DESCONTOS
// ============================================================
export function calcularDescontoFalta(salarioBase: number, cargaHorariaMensal: number, diasFalta: number): number {
  const valorDia = salarioBase / 30;
  return Math.round(valorDia * diasFalta * 100) / 100;
}

export function calcularDescontoAtraso(salarioBase: number, cargaHorariaMensal: number, horasAtraso: number): number {
  const valorHora = calcularValorHora(salarioBase, cargaHorariaMensal);
  return Math.round(valorHora * horasAtraso * 100) / 100;
}

export function calcularValeTransporte(salarioBase: number, percentual: number = 6): number {
  const desconto = salarioBase * (percentual / 100);
  return Math.round(desconto * 100) / 100;
}

// ============================================================
// CÁLCULO DE FÉRIAS
// ============================================================
export function calcularFerias(
  salarioBase: number,
  diasGozo: number,
  diasAbono: number = 0
): { valorFerias: number; valorTerco: number; valorAbono: number; totalBruto: number } {
  const valorDia = salarioBase / 30;
  const valorFerias = Math.round(valorDia * diasGozo * 100) / 100;
  const valorTerco = Math.round(valorFerias / 3 * 100) / 100;
  const valorAbono = Math.round(valorDia * diasAbono * 100) / 100;
  const totalBruto = valorFerias + valorTerco + valorAbono;
  return { valorFerias, valorTerco, valorAbono, totalBruto };
}

// ============================================================
// CÁLCULO DE RESCISÃO
// ============================================================
export function calcularRescisao(params: {
  salarioBase: number;
  dataAdmissao: string;
  dataDemissao: string;
  tipoRescisao: 'sem_justa_causa' | 'com_justa_causa' | 'pedido_demissao' | 'acordo';
  avisoPrevio: 'trabalhado' | 'indenizado' | 'nao_aplicavel';
  saldoFGTS: number;
  numDependentes: number;
}): {
  saldoSalario: number;
  avisoPrevioValor: number;
  feriasProporcionais: number;
  tercoFerias: number;
  decimoTerceiro: number;
  multaFGTS: number;
  totalProventos: number;
  totalDescontos: number;
  valorLiquido: number;
  diasFeriasProporcional: number;
  mesesDecimoTerceiro: number;
} {
  const { salarioBase, dataAdmissao, dataDemissao, tipoRescisao, avisoPrevio, saldoFGTS, numDependentes } = params;
  
  const admDate = new Date(dataAdmissao);
  const demDate = new Date(dataDemissao);
  
  // Dias trabalhados no mês
  const diaAdmissao = admDate.getDate();
  const diasTrabalhadosMes = demDate.getDate() - diaAdmissao + 1;
  const valorDia = salarioBase / 30;
  const saldoSalario = Math.round(valorDia * Math.max(0, diasTrabalhadosMes) * 100) / 100;

  // Aviso prévio
  let avisoPrevioValor = 0;
  let diasAviso = 0;
  if (avisoPrevio === 'indenizado') {
    diasAviso = 30;
    avisoPrevioValor = salarioBase;
  }

  // Férias proporcionais
  const mesesTrabalhados = calcularMesesParaFerias(admDate, demDate);
  const diasFeriasProporcional = Math.min(Math.floor(mesesTrabalhados / 12 * 30), 30);
  const feriasProporcionais = Math.round(valorDia * diasFeriasProporcional * 100) / 100;
  const tercoFerias = Math.round(feriasProporcionais / 3 * 100) / 100;

  // 13º proporcional
  const mesesDecimoTerceiro = calcularMesesParaDecimoTerceiro(admDate, demDate);
  const decimoTerceiro = Math.round((salarioBase / 12) * mesesDecimoTerceiro * 100) / 100;

  // Multa FGTS
  let multaFGTS = 0;
  if (tipoRescisao === 'sem_justa_causa') {
    multaFGTS = Math.round(saldoFGTS * ALIQUOTA_MULTA_FGTS_SEM_JUSTA_CAUSA * 100) / 100;
  } else if (tipoRescisao === 'acordo') {
    multaFGTS = Math.round(saldoFGTS * ALIQUOTA_MULTA_FGTS_ACORDO * 100) / 100;
  }

  // Proventos
  let totalProventos = saldoSalario;
  let totalDescontos = 0;

  if (tipoRescisao === 'sem_justa_causa') {
    totalProventos += avisoPrevioValor + feriasProporcionais + tercoFerias + decimoTerceiro;
  } else if (tipoRescisao === 'pedido_demissao') {
    totalProventos += feriasProporcionais + tercoFerias + decimoTerceiro;
    // Desconto aviso prévio se não cumpriu
    if (avisoPrevio === 'nao_aplicavel') {
      totalDescontos += salarioBase;
    }
  } else if (tipoRescisao === 'com_justa_causa') {
    // Apenas saldo de salário e férias vencidas
    totalProventos = saldoSalario;
  } else if (tipoRescisao === 'acordo') {
    totalProventos += avisoPrevioValor / 2 + feriasProporcionais + tercoFerias + decimoTerceiro;
  }

  // Descontos INSS/IRRF sobre saldo de salário e 13º
  const baseINSS = saldoSalario + decimoTerceiro;
  const inss = calcularINSS(baseINSS);
  const irrf = calcularIRRF(baseINSS - inss, numDependentes);
  totalDescontos += inss + irrf;

  const valorLiquido = Math.round((totalProventos - totalDescontos) * 100) / 100;

  return {
    saldoSalario,
    avisoPrevioValor,
    feriasProporcionais,
    tercoFerias,
    decimoTerceiro,
    multaFGTS,
    totalProventos: Math.round(totalProventos * 100) / 100,
    totalDescontos: Math.round(totalDescontos * 100) / 100,
    valorLiquido,
    diasFeriasProporcional,
    mesesDecimoTerceiro,
  };
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function calcularMesesParaFerias(admissao: Date, demissao: Date): number {
  let meses = (demissao.getFullYear() - admissao.getFullYear()) * 12;
  meses += demissao.getMonth() - admissao.getMonth();
  if (demissao.getDate() >= 15) meses += 1;
  return Math.max(0, meses);
}

function calcularMesesParaDecimoTerceiro(admissao: Date, demissao: Date): number {
  let meses = 0;
  for (let m = 0; m < 12; m++) {
    const mesDate = new Date(demissao.getFullYear(), m, 1);
    if (mesDate >= admissao && mesDate <= demissao) {
      const diasNoMes = new Date(demissao.getFullYear(), m + 1, 0).getDate();
      const inicio = Math.max(1, admissao.getMonth() === m ? admissao.getDate() : 1);
      const fim = demissao.getMonth() === m ? demissao.getDate() : diasNoMes;
      if (fim - inicio + 1 >= 15) {
        meses++;
      }
    }
  }
  return Math.min(meses, 12);
}

// ============================================================
// FORMATADORES
// ============================================================
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarCPF(cpf: string): string {
  const nums = cpf.replace(/\D/g, '');
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatarData(data: string): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarMesReferencia(mesRef: string): string {
  const [ano, mes] = mesRef.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
}

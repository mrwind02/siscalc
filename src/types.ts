// ============================================================
// TIPOS E MODELOS - Sistema de Gestão de Departamento Pessoal
// ============================================================

export interface Empresa {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: 'corrente' | 'poupanca';
  chavePix: string;
}

export type TipoContrato = 'CLT' | 'Aprendiz' | 'Estagiario';
export type TipoRescisao = 'sem_justa_causa' | 'com_justa_causa' | 'pedido_demissao' | 'acordo';

export interface Colaborador {
  id: string;
  // Dados Pessoais
  nomeCompleto: string;
  cpf: string;
  pisPasep: string;
  rg: string;
  dataNascimento: string;
  estadoCivil: string;
  nacionalidade: string;
  nomePai: string;
  nomeMae: string;
  endereco: Endereco;
  // Dados Bancários
  dadosBancarios: DadosBancarios;
  // Dados Contratuais
  cargo: string;
  departamento: string;
  tipoContrato: TipoContrato;
  dataAdmissao: string;
  salarioBase: number;
  cargaHorariaMensal: number;
  // Variáveis de Cálculo
  numDependentes: number;
  percentualVT: number;
  adicionalPericulosidade: boolean;
  adicionalInsalubridade: boolean;
  grauInsalubridade: 'minimo' | 'medio' | 'maximo';
  optanteAdiantamento: boolean;
  // Status
  ativo: boolean;
  dataDemissao?: string;
  tipoRescisao?: TipoRescisao;
}

export interface Lancamento {
  id: string;
  colaboradorId: string;
  mesReferencia: string; // YYYY-MM
  tipo: 'horas_extras_50' | 'horas_extras_100' | 'adiantamento' | 'falta' | 'atraso' | 'bonus' | 'comissao' | 'convenio' | 'outro_provento' | 'outro_desconto';
  descricao: string;
  quantidade: number; // horas, dias, ou valor
  valorUnitario?: number;
  valorTotal: number;
  data: string;
}

export interface FolhaPagamento {
  colaboradorId: string;
  mesReferencia: string;
  proventos: ItemFolha[];
  descontos: ItemFolha[];
  baseINSS: number;
  valorINSS: number;
  baseIRRF: number;
  valorIRRF: number;
  baseFGTS: number;
  valorFGTS: number;
  totalProventos: number;
  totalDescontos: number;
  salarioLiquido: number;
  dataProcessamento: string;
}

export interface ItemFolha {
  codigo: string;
  descricao: string;
  referencia: string;
  provento: number;
  desconto: number;
}

export interface PeriodoAquisitivo {
  inicio: string;
  fim: string;
  diasGozados: number;
  diasVendidos: number;
  status: 'em_andamento' | 'disponivel' | 'gozado' | 'vencido';
  valorDireito: number;
}

export interface ReciboFerias {
  colaboradorId: string;
  periodoAquisitivo: PeriodoAquisitivo;
  dataInicio: string;
  dataFim: string;
  diasGozo: number;
  abonoPecuniario: number; // dias vendidos
  valorFerias: number;
  valorTerco: number;
  valorAbono: number;
  descontoINSS: number;
  descontoIRRF: number;
  valorLiquido: number;
  dataPagamento: string;
}

export interface TermoRescisao {
  colaboradorId: string;
  tipoRescisao: TipoRescisao;
  dataAdmissao: string;
  dataDemissao: string;
  avisoPrevio: 'trabalhado' | 'indenizado' | 'nao_aplicavel';
  diasAvisoPrevio: number;
  saldoSalario: number;
  feriasProporcionais: number;
  tercoFerias: number;
  decimoTerceiroProporcional: number;
  multaFGTS: number;
  valorFGTS: number;
  totalProventos: number;
  totalDescontos: number;
  valorLiquido: number;
  dataProcessamento: string;
}

export interface HistoricoRemuneracao {
  mes: string;
  salarioBruto: number;
  salarioLiquido: number;
  descontos: number;
}

// Tipos simplificados para o sistema

export interface Empresa {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Colaborador {
  id: string;
  nomeCompleto: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  salarioBase: number;
}

export interface FolhaPagamento {
  mesReferencia: string;
  proventos: Array<{
    codigo: string;
    descricao: string;
    provento: number;
  }>;
  descontos: Array<{
    codigo: string;
    descricao: string;
    desconto: number;
  }>;
  totalProventos: number;
  totalDescontos: number;
  valorINSS: number;
  valorIRRF: number;
  valorFGTS: number;
  salarioLiquido: number;
}

export interface ReciboFerias {
  valorFerias: number;
  valorTerco: number;
  valorLiquido: number;
}

export interface TermoRescisao {
  saldoSalario: number;
  feriasProporcionais: number;
  valorLiquido: number;
}

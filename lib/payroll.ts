export interface PayrollResult {
  grossSalary: number;
  inss: number;
  inssRate: number;
  irrf: number;
  irrfRate: number;
  irrfBase: number;
  fgts: number;
  netSalary: number;
  dependentDeduction: number;
}

// INSS 2024 — progressive brackets
const INSS_BRACKETS = [
  { limit: 1412.0, rate: 0.075 },
  { limit: 2666.68, rate: 0.09 },
  { limit: 4000.03, rate: 0.12 },
  { limit: 7786.02, rate: 0.14 },
];

// IRRF 2024 — progressive brackets
const IRRF_BRACKETS = [
  { limit: 2259.2, rate: 0, deduct: 0 },
  { limit: 2826.65, rate: 0.075, deduct: 169.44 },
  { limit: 3751.05, rate: 0.15, deduct: 381.44 },
  { limit: 4664.68, rate: 0.225, deduct: 662.77 },
  { limit: Infinity, rate: 0.275, deduct: 896.0 },
];

const DEPENDENT_DEDUCTION = 189.59;
const FGTS_RATE = 0.08;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateINSS(gross: number): { value: number; rate: number } {
  let inss = 0;
  let prev = 0;

  for (const bracket of INSS_BRACKETS) {
    if (gross > prev) {
      const taxable = Math.min(gross, bracket.limit) - prev;
      inss += taxable * bracket.rate;
      prev = bracket.limit;
    } else {
      break;
    }
  }

  return { value: round2(inss), rate: gross > 0 ? inss / gross : 0 };
}

export function calculateIRRF(
  gross: number,
  inss: number,
  dependents: number
): { value: number; rate: number; base: number } {
  const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
  const base = Math.max(0, gross - inss - dependentDeduction);

  let irrf = 0;
  let rate = 0;
  for (const bracket of IRRF_BRACKETS) {
    if (base <= bracket.limit) {
      irrf = base * bracket.rate - bracket.deduct;
      rate = bracket.rate;
      break;
    }
  }

  return { value: round2(Math.max(0, irrf)), rate, base: round2(base) };
}

export function calculatePayroll(
  grossSalary: number,
  dependents: number
): PayrollResult {
  const gross = Number(grossSalary);
  const { value: inss, rate: inssRate } = calculateINSS(gross);
  const { value: irrf, rate: irrfRate, base: irrfBase } = calculateIRRF(
    gross,
    inss,
    dependents
  );
  const fgts = round2(gross * FGTS_RATE);
  const netSalary = round2(gross - inss - irrf);

  return {
    grossSalary: gross,
    inss,
    inssRate,
    irrf,
    irrfRate,
    irrfBase,
    fgts,
    netSalary,
    dependentDeduction: round2(dependents * DEPENDENT_DEDUCTION),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

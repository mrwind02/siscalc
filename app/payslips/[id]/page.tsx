import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { calculatePayroll, formatCurrency } from '@/lib/payroll';
import PrintButton from '@/components/PrintButton';

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!employee) notFound();

  const payroll = calculatePayroll(Number(employee.grossSalary), employee.dependents);
  const now = new Date();
  const monthYear = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const cpfFormatted = employee.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  const earnings = [
    { label: 'Salário Base', value: payroll.grossSalary },
  ];

  const deductions = [
    { label: 'INSS', value: payroll.inss },
    { label: 'IRRF', value: payroll.irrf },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between no-print">
        <Link
          href="/payroll"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Voltar para Folha
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4">
          <h1 className="text-xl font-bold">Recibo de Pagamento</h1>
          <p className="text-sm text-slate-300 capitalize">{monthYear}</p>
        </div>

        <div className="px-6 py-4 border-b border-slate-200">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Funcionário</dt>
              <dd className="font-medium text-slate-800">{employee.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">CPF</dt>
              <dd className="font-medium text-slate-800">{cpfFormatted}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Cargo</dt>
              <dd className="font-medium text-slate-800">{employee.position}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Dependentes</dt>
              <dd className="font-medium text-slate-800">{employee.dependents}</dd>
            </div>
          </dl>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-emerald-600 mb-2">Vencimentos</h3>
            <table className="w-full text-sm">
              <tbody>
                {earnings.map((item) => (
                  <tr key={item.label} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">{item.label}</td>
                    <td className="py-2 text-right font-medium text-slate-800">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 text-slate-700">Total Vencimentos</td>
                  <td className="py-2 text-right text-slate-800">
                    {formatCurrency(payroll.grossSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-red-500 mb-2">Descontos</h3>
            <table className="w-full text-sm">
              <tbody>
                {deductions.map((item) => (
                  <tr key={item.label} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">{item.label}</td>
                    <td className="py-2 text-right font-medium text-slate-800">
                      -{formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 text-slate-700">Total Descontos</td>
                  <td className="py-2 text-right text-slate-800">
                    -{formatCurrency(payroll.inss + payroll.irrf)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-2">
              Informações Adicionais
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">Base de cálculo IRRF</td>
                  <td className="py-2 text-right text-slate-800">{formatCurrency(payroll.irrfBase)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">Dedução por dependentes</td>
                  <td className="py-2 text-right text-slate-800">{formatCurrency(payroll.dependentDeduction)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">FGTS (8%) — encargo patronal</td>
                  <td className="py-2 text-right text-slate-500">{formatCurrency(payroll.fgts)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-6 py-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-700">Salário Líquido</span>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(payroll.netSalary)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

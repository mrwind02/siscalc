import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculatePayroll, formatCurrency } from '@/lib/payroll';

export default async function PayrollPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' },
  });

  const rows = employees.map((e) => ({
    id: e.id,
    name: e.name,
    position: e.position,
    payroll: calculatePayroll(Number(e.grossSalary), e.dependents),
  }));

  const totals = rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.payroll.grossSalary,
      inss: acc.inss + r.payroll.inss,
      irrf: acc.irrf + r.payroll.irrf,
      fgts: acc.fgts + r.payroll.fgts,
      net: acc.net + r.payroll.netSalary,
    }),
    { gross: 0, inss: 0, irrf: 0, fgts: 0, net: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Folha de Pagamento</h1>
        <p className="text-slate-500 mt-1">
          Cálculo de encargos — INSS, IRRF e FGTS
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-12 text-center text-slate-500">
          Nenhum funcionário cadastrado.{' '}
          <Link href="/employees/new" className="text-indigo-600 hover:underline">
            Cadastrar agora
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Funcionário</th>
                  <th className="text-right px-4 py-3 font-medium">Bruto</th>
                  <th className="text-right px-4 py-3 font-medium">INSS</th>
                  <th className="text-right px-4 py-3 font-medium">IRRF</th>
                  <th className="text-right px-4 py-3 font-medium">FGTS</th>
                  <th className="text-right px-4 py-3 font-medium">Líquido</th>
                  <th className="text-right px-4 py-3 font-medium">Holerite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium">{row.name}</div>
                      <div className="text-xs text-slate-400">{row.position}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatCurrency(row.payroll.grossSalary)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600">
                      -{formatCurrency(row.payroll.inss)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500">
                      -{formatCurrency(row.payroll.irrf)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {formatCurrency(row.payroll.fgts)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(row.payroll.netSalary)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/payslips/${row.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.gross)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(totals.inss)}</td>
                  <td className="px-4 py-3 text-right text-red-500">{formatCurrency(totals.irrf)}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(totals.fgts)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(totals.net)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

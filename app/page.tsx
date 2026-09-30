import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculatePayroll, formatCurrency } from '@/lib/payroll';

export default async function Dashboard() {
  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' },
  });

  const payrolls = employees.map((e) =>
    calculatePayroll(Number(e.grossSalary), e.dependents)
  );

  const totalGross = payrolls.reduce((s, p) => s + p.grossSalary, 0);
  const totalINSS = payrolls.reduce((s, p) => s + p.inss, 0);
  const totalIRRF = payrolls.reduce((s, p) => s + p.irrf, 0);
  const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0);

  const stats = [
    { label: 'Funcionários', value: String(employees.length), color: 'bg-indigo-500' },
    { label: 'Folha Bruta', value: formatCurrency(totalGross), color: 'bg-blue-500' },
    { label: 'Total INSS', value: formatCurrency(totalINSS), color: 'bg-amber-500' },
    { label: 'Folha Líquida', value: formatCurrency(totalNet), color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral da folha de pagamento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
          >
            <div className={`w-10 h-1 rounded-full ${stat.color} mb-3`} />
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Funcionários Recentes</h2>
          <Link
            href="/employees"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>
        {employees.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Nenhum funcionário cadastrado.{' '}
            <Link href="/employees/new" className="text-indigo-600 hover:underline">
              Cadastrar agora
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nome</th>
                <th className="text-left px-6 py-3 font-medium">Cargo</th>
                <th className="text-right px-6 py-3 font-medium">Salário Bruto</th>
                <th className="text-right px-6 py-3 font-medium">Salário Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.slice(0, 5).map((emp, i) => {
                const payroll = payrolls[i];
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-700">{emp.name}</td>
                    <td className="px-6 py-3 text-slate-500">{emp.position}</td>
                    <td className="px-6 py-3 text-right text-slate-700">
                      {formatCurrency(payroll.grossSalary)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(payroll.netSalary)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/payroll';
import DeleteButton from './DeleteButton';

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Funcionários</h1>
          <p className="text-slate-500 mt-1">Gerencie os funcionários cadastrados</p>
        </div>
        <Link
          href="/employees/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Novo Funcionário
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                <th className="text-left px-6 py-3 font-medium">CPF</th>
                <th className="text-left px-6 py-3 font-medium">Cargo</th>
                <th className="text-right px-6 py-3 font-medium">Salário Bruto</th>
                <th className="text-center px-6 py-3 font-medium">Dependentes</th>
                <th className="text-right px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-700 font-medium">{emp.name}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {emp.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{emp.position}</td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {formatCurrency(Number(emp.grossSalary))}
                  </td>
                  <td className="px-6 py-3 text-center text-slate-500">{emp.dependents}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={emp.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

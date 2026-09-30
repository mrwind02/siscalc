import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EmployeeForm from '@/components/EmployeeForm';

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Editar Funcionário</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <EmployeeForm employee={employee} />
      </div>
    </div>
  );
}

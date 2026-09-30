import EmployeeForm from '@/components/EmployeeForm';

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Novo Funcionário</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <EmployeeForm />
      </div>
    </div>
  );
}

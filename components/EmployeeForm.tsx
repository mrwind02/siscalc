'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EmployeeData {
  id?: number;
  name: string;
  cpf: string;
  position: string;
  grossSalary: number;
  dependents: number;
}

export default function EmployeeForm({ employee }: { employee?: EmployeeData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: employee?.name ?? '',
    cpf: employee?.cpf ?? '',
    position: employee?.position ?? '',
    grossSalary: employee ? Number(employee.grossSalary) : '',
    dependents: employee?.dependents ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      cpf: form.cpf.replace(/\D/g, ''),
      position: form.position,
      grossSalary: Number(form.grossSalary),
      dependents: Number(form.dependents),
    };

    const url = employee ? `/api/employees/${employee.id}` : '/api/employees';
    const method = employee ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erro ao salvar funcionário');
      setLoading(false);
      return;
    }

    router.push('/employees');
    router.refresh();
  }

  const fieldClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
        <input
          type="text"
          required
          placeholder="000.000.000-00"
          value={form.cpf}
          onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
        <input
          type="text"
          required
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Salário Bruto (R$)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={form.grossSalary}
          onChange={(e) => setForm({ ...form, grossSalary: e.target.value as unknown as number })}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Dependentes
        </label>
        <input
          type="number"
          min="0"
          value={form.dependents}
          onChange={(e) => setForm({ ...form, dependents: Number(e.target.value) })}
          className={fieldClass}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

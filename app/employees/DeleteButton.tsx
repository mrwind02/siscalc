'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Excluir este funcionário?')) return;
    setLoading(true);
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
    >
      {loading ? '...' : 'Excluir'}
    </button>
  );
}

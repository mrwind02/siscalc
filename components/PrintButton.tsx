'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
    >
      Imprimir
    </button>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, cpf, position, grossSalary, dependents } = body;

  if (!name || !cpf || !position || grossSalary == null) {
    return NextResponse.json(
      { error: 'Todos os campos são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        name,
        cpf: String(cpf).replace(/\D/g, ''),
        position,
        grossSalary: Number(grossSalary),
        dependents: Number(dependents) || 0,
      },
    });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar funcionário' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.employee.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao excluir funcionário' },
      { status: 400 }
    );
  }
}

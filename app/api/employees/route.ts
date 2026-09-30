import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const employees = await prisma.employee.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { name, cpf, position, grossSalary, dependents } = body;

  if (!name || !cpf || !position || grossSalary == null) {
    return NextResponse.json(
      { error: 'Todos os campos são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        name,
        cpf: String(cpf).replace(/\D/g, ''),
        position,
        grossSalary: Number(grossSalary),
        dependents: Number(dependents) || 0,
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar funcionário. CPF já cadastrado?' },
      { status: 400 }
    );
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const employees = [
  { name: 'João Silva', cpf: '12345678901', position: 'Desenvolvedor', grossSalary: 8000, dependents: 2 },
  { name: 'Maria Santos', cpf: '23456789012', position: 'Analista de RH', grossSalary: 4500, dependents: 1 },
  { name: 'Carlos Oliveira', cpf: '34567890123', position: 'Gerente de Vendas', grossSalary: 12000, dependents: 3 },
  { name: 'Ana Costa', cpf: '45678901234', position: 'Assistente Administrativo', grossSalary: 2500, dependents: 0 },
  { name: 'Pedro Souza', cpf: '56789012345', position: 'Técnico de TI', grossSalary: 3500, dependents: 1 },
];

async function main() {
  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { cpf: emp.cpf },
      update: {},
      create: emp,
    });
  }
  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());

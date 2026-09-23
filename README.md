# Sistema de Gestão de Departamento Pessoal

Sistema web completo para gestão de departamento pessoal e folha de pagamento, desenvolvido com React, TypeScript e Vite.

## 🎯 Funcionalidades

### ✅ Implementado e Funcionando

- **Dashboard Completo**
  - Visualização de dados do colaborador
  - Cards de resumo (Salário Base, Líquido, Descontos, FGTS)
  - Seleção de colaborador
  - Resumo detalhado da folha de pagamento

- **Geração de PDFs**
  - ✅ Holerite/Recibo de Pagamento
  - ✅ Recibo de Férias
  - ✅ Termo de Rescisão (TRCT)
  - ✅ Preview HTML antes do download
  - ✅ Download direto funcionando em qualquer ambiente

- **Interface Compacta**
  - Layout otimizado para visualização em uma tela
  - Cards e tabelas compactas
  - Navegação por abas (Dashboard, Cadastro, Lançamentos)

- **Cálculos Tributários**
  - INSS progressivo
  - IRRF com deduções
  - FGTS (8%)
  - Horas extras (50% e 100%)
  - Adicionais (periculosidade, insalubridade, noturno)

## 🚀 Como Usar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

### Preview do Build

```bash
npm run preview
```

## 📋 Estrutura do Projeto

```
src/
├── App.tsx                    # Componente principal
├── main.tsx                   # Entry point
├── index.css                  # Estilos globais
├── types.ts                   # Tipos TypeScript
└── utils/
    ├── pdfGenerator.ts        # Geração de PDFs
    └── taxEngine.ts           # Cálculos tributários
```

## 🎨 Características da Interface

### Dashboard
- **Seletor de Colaborador**: Dropdown para selecionar o colaborador ativo
- **Cards de Resumo**: 4 cards com informações financeiras principais
- **Dados do Colaborador**: Informações pessoais e contratuais
- **Botões de Ação**: Gerar Holerite, Férias e Rescisão
- **Resumo da Folha**: Detalhamento de proventos e descontos

### Geração de PDF
- **Modal com Preview**: Exibe preview HTML do documento antes do download
- **Botão de Download**: Link direto para baixar o PDF
- **Compatibilidade**: Funciona em qualquer navegador e ambiente (incluindo sandbox)

## 🔧 Tecnologias Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **jsPDF** - Geração de PDFs
- **jspdf-autotable** - Tabelas em PDFs
- **Tailwind CSS** - Estilização

## 📊 Legislação Brasileira

O sistema está em conformidade com:
- CLT (Consolidação das Leis do Trabalho)
- eSocial (Sistema de Escrituração Digital)
- Tabelas vigentes de INSS e IRRF
- Cálculos de FGTS e multa rescisória

## 🎯 Próximas Funcionalidades

- [ ] Cadastro completo de colaboradores
- [ ] Lançamentos variáveis (horas extras, faltas, etc.)
- [ ] Relatório mensal consolidado
- [ ] Exportação para eSocial
- [ ] Backup e restauração de dados
- [ ] Multi-empresa

## 📝 Notas Técnicas

### Geração de PDF
O sistema utiliza uma abordagem inovadora para geração de PDFs:
1. Gera o PDF com jsPDF
2. Cria um preview HTML formatado
3. Exibe em modal com botão de download direto
4. Funciona em ambientes sandbox (como iframes)

### Cálculos Tributários
Todos os cálculos seguem a legislação brasileira vigente:
- INSS: Tabela progressiva 2024
- IRRF: Tabela progressiva com deduções
- FGTS: 8% sobre remuneração
- Multa rescisória: 40% (sem justa causa) ou 20% (acordo)

## 🐛 Solução de Problemas

### PDF não baixa
- Verifique se o navegador permite downloads
- Tente clicar com botão direito e "Salvar link como..."
- O sistema usa link direto `<a>` com atributo `download`

### Preview não aparece
- Verifique o console do navegador para erros
- O preview é HTML puro, não depende de plugins

### Cálculos incorretos
- Verifique as tabelas de INSS/IRRF em `taxEngine.ts`
- Confirme os dados do colaborador (dependentes, adicionais)

## 📄 Licença

Este projeto é destinado para uso educacional e demonstração.

## 👨‍💻 Desenvolvimento

Desenvolvido como sistema completo de gestão de departamento pessoal, seguindo as melhores práticas de:
- Código limpo e tipado
- Componentes reutilizáveis
- Interface responsiva
- Performance otimizada
- Conformidade legal brasileira

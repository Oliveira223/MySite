# 🚀 Oliveira223 - Dashboard Pessoal

Este é o repositório do projeto **Oliveira223**, um dashboard pessoal contendo módulos de **Academia**, **Estudos** e **Gerenciamento VPS**, construído com [Next.js](https://nextjs.org), [Prisma](https://www.prisma.io) e [Tailwind CSS](https://tailwindcss.com).

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 20 ou superior recomendada)
- **npm** (geralmente vem com o Node.js)
- **Git**

## 💻 Como Rodar Localmente (Desenvolvimento)

Siga estes passos para rodar o projeto no seu computador:

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/mysite.git
cd mysite
```

### 2. Instalar Dependências
Instale as bibliotecas necessárias do projeto:
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (se não existir) com o seguinte conteúdo:
```env
# Banco de dados SQLite local
DATABASE_URL="file:./dev.db"

# Senha para acessar o menu /menu (Altere conforme desejar)
MENU_PASSWORD="admin123"
```

### 4. Configurar o Banco de Dados
Gere o cliente do Prisma e crie o banco de dados local:
```bash
# Gera os arquivos de tipagem do Prisma
npx prisma generate

# Cria as tabelas no banco de dados (dev.db)
npx prisma db push
```

### 5. Iniciar o Servidor
Rode o servidor de desenvolvimento:
```bash
npm run dev
```
O projeto estará acessível em: [http://localhost:3000](http://localhost:3000)

---

## 📂 Estrutura do Projeto

- **/app**: Páginas e rotas do Next.js (App Router).
  - **/gym**: Módulo de Academia.
  - **/studies**: Módulo de Estudos.
  - **/menu**: Dashboard protegido por senha.
- **/components**: Componentes reutilizáveis (UI, Sidebar, Gráficos).
- **/prisma**: Schema do banco de dados e arquivos de migração.
- **/lib**: Utilitários e configuração do cliente de banco de dados (`db.ts`).

---

## 🐳 Docker & Deploy (Produção)

Este projeto está configurado para rodar em containers Docker.

### Comandos Úteis

**Subir o container localmente (para teste de produção):**
```bash
docker-compose up --build
```

**Parar o container:**
```bash
docker-compose down
```

### Notas de Deploy (VPS)
- O projeto roda na porta `3000` dentro do container.
- Utilizamos **Nginx Proxy Manager** para gerenciar o domínio e SSL.
- O banco de dados de produção fica salvo no volume `db_data` para persistência.

---

## 📝 Notas Importantes

- **Senha do Menu:** A proteção da rota `/menu` é feita via Server Actions e Cookies. A senha é definida na variável `MENU_PASSWORD`.
- **Banco de Dados:** Em desenvolvimento usamos SQLite (`dev.db`). Em produção, também usamos SQLite, mas persistido em volume Docker.
- **Portas:**
  - `3000`: Aplicação Next.js
  - `80/443`: Nginx Proxy Manager (Acesso externo)

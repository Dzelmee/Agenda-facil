# Agenda Fácil

Reservas e atendimentos. Aplicação demonstrativa full stack com interface responsiva e API REST.

## Tecnologias

- Front-end: HTML5, CSS3, JavaScript moderno (sem frameworks).
- Back-end: Node.js 22+ (servidor HTTP nativo).
- Persistência: arquivo JSON local com escrita serializada.
- Testes: `node:test` e `node:assert`.

## Rodar localmente

```bash
npm start
```

Acesse http://localhost:3000. Para trocar a porta: `PORT=4000 npm start` (PowerShell: `$env:PORT=4000; npm start`).

## Testar

```bash
npm test
```

## API

| Método | Endpoint | Função |
| --- | --- | --- |
| GET | `/api/health` | Verificar servidor |
| GET | `/api/records` | Listar |
| POST | `/api/records` | Criar |
| PUT | `/api/records/:id` | Atualizar |
| DELETE | `/api/records/:id` | Excluir |

Exemplo POST:

```json
{
  "servico": "Exemplo",
  "cliente": "Exemplo",
  "status": "Pendente"
}
```

## Recursos

CRUD completo, busca, filtro, indicadores, exportação CSV, validação no servidor, interface mobile e testes automatizados.

## Limitações importantes

**Projeto de portfólio, não produto pronto para produção.** Não possui login, permissões, banco SQL, integração com pagamentos, controle de concorrência entre múltiplas instâncias ou backup automático. Dados ficam no servidor em `data/records.json` (ignorado pelo Git). Em hospedagens efêmeras, os registros podem ser perdidos. Para produção, adicione banco de dados, autenticação e deploy com armazenamento persistente.

## GitHub

Crie um repositório com o nome `agenda-facil`, envie os arquivos e adicione screenshots da aplicação em execução. Não inclua dados pessoais reais.

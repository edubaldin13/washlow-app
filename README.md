# WashFlow App

Frontend do projeto WashFlow, construído com React 19, TypeScript e Tailwind CSS.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Fetch API

## Estrutura

```
src/
  components/       # Componentes reutilizáveis (Layout, ConfirmModal)
  pages/            # Telas da aplicação (Login, Máquinas)
  services/         # Camada de comunicação com a API
  config/           # Configurações da aplicação
```

## Serviços

- `ApiService`: classe genérica com métodos CRUD (`get`, `post`, `put`, `delete`) que podem ser herdados por contextos específicos.
- `ServiceService`: herda `ApiService` e mapeia as operações do controller `services` da API.

## Telas

- **Login**: solicita email e endereço/AP.
- **Máquinas**: lista as máquinas com foto, nome, status, horário de início e ação para encerrar atividade.

## Configuração

A URL base da API é definida em `src/config/api.ts` e pode ser sobrescrita pela variável de ambiente `VITE_API_BASE_URL`.

```ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001/api/';
```

## Scripts

```bash
npm install     # instalar dependências
npm run dev     # iniciar servidor de desenvolvimento
npm run build   # compilar para produção
npm run lint    # executar linter
```

## Comunicação com a API

O frontend espera a API WashFlow rodando conforme documentado em `washflow-api`. Os endpoints consumidos são:

- `GET /api/services` - listar máquinas
- `PUT /api/services/{id}` - atualizar máquina (status)

## Design

- Paleta de cores leve (tons de azul, cinza e verde).
- Layout com barra de navegação superior e menu lateral recolhível.
- Responsivo para diferentes tamanhos de tela.

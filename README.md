# Manage Projects

SPA для управління проектами та завданнями. Тестове завдання рівня Middle+.

**Live demo:** після деплою на GitHub Pages — `https://denysdubas.github.io/manage-projects/`

## Запуск

```bash
npm install
npm run dev
npm run test
```

Білд для production / GitHub Pages:

```bash
npm run build:pages
```

## Технології

| Категорія | Технологія |
|-----------|------------|
| Фреймворк | Vue 3 (Composition API, `<script setup>`) |
| Мова | TypeScript (без `any`) |
| Стан | Pinia |
| HTTP | Axios + custom mock adapter |
| Стилі | SCSS |
| Drag & Drop | vuedraggable |
| Валідація | vee-validate + zod |
| Дані | localStorage |

## Архітектура

Застосунок побудований за шаровою MVC-подібною архітектурою:

```
View (views/, components/)
  ↓ events
Controller (stores/, composables/)
  ↓ calls
Model (api/, types/, localStorage)
```

### API-шар (`src/api/`)

- **`client.ts`** — generic-методи `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete` з централізованою обробкою помилок
- **`mock-adapter.ts`** — Axios custom adapter: емуляція REST API, затримка 150–300 мс, CRUD через localStorage
- **`storage.ts`** — seed-дані та persist helpers
- **`index.ts`** — `projectsApi`, `tasksApi` — єдиний вхід для stores

Компоненти **не** працюють з API напряму — тільки через Pinia stores.

### Mock-adapter

Axios використовує custom adapter замість реального HTTP. Кожен запит:

1. затримується на 150–300 мс (імітація мережі);
2. читає/записує дані в `localStorage` (`pm_projects`, `pm_tasks`);
3. повертає типізовану відповідь або помилку (404, 400).

Endpoints:

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/projects` | список проектів + taskCount |
| POST | `/projects` | створення |
| PUT | `/projects/:id` | оновлення |
| DELETE | `/projects/:id` | видалення (+ каскад tasks) |
| GET | `/tasks?projectId=` | завдання проекту |
| POST/PUT/DELETE | `/tasks` | CRUD завдань |
| PUT | `/tasks/reorder` | batch-оновлення order + status |

### Pinia Stores (`src/stores/`)

- **`projects.ts`** — CRUD проектів, реактивний `taskCount`
- **`tasks.ts`** — CRUD завдань, reorder, фільтрація по projectId

### Composables (`src/composables/`)

| Composable | Призначення |
|------------|-------------|
| `useTableSort` | Generic-сортування таблиць (key + direction) |
| `useColumnResize` | Resize колонок + persist ширини в localStorage |
| `useKanbanBoard` | Kanban columns, D&D sync через store |
| `useTaskDrag` | Drag & Drop reorder в таблиці |
| `useProjectTaskActions` | Cross-store orchestration (delete project, create/delete task + taskCount) |
| `useToast` | Toast-повідомлення (бонус) |

### Utils (`src/utils/`)

| Utility | Призначення |
|---------|-------------|
| `date.ts` | `formatDate`, `todayIsoDate` |
| `errors.ts` | `getErrorMessage`, обробка `ApiRequestError` |

### Types (`src/types/`)

Централізовані інтерфейси: `Project`, `Task`, status maps (`ProjectStatus`, `TaskStatus`, `ViewMode`), payload types.

## Структура компонентів

Компоненти розбиті за відповідальністю — без God-components:

```
components/
├── common/          # UI-примітиви: Button, Modal, Input, TableHeader, Toast
├── projects/        # ProjectsTable, ProjectFormModal
└── tasks/           # TasksTable, TasksKanban, KanbanCard, TaskFormModal, Stats
views/
├── ProjectsView.vue       # головна сторінка
└── ProjectDetailView.vue  # table/kanban toggle, orchestration
```

**ProjectsView** — лише завантаження даних і композиція `ProjectsTable` + modal.

**ProjectDetailView** — оркестратор: view mode (localStorage), перемикання table/kanban, делегує рендер дочірнім компонентам.

**TasksTable / TasksKanban** — самодостатні view-компоненти з власними фільтрами та D&D, спільний Pinia store.

## Функціонал

### Головна сторінка
- Таблиця проектів: sort по всіх колонках, пошук, фільтр статусу, resize колонок
- Модалка створення проекту (vee-validate + zod, blur + submit)
- Клік по рядку → сторінка проекту

### Сторінка проекту
- Режими **Таблиця** / **Канбан** (persist в localStorage)
- Синхронізація через один `tasks` store
- Table: sort, фільтри, D&D reorder, resize
- Kanban: D&D між колонками, auto-update status
- CRUD завдань з валідацією
- Статистика завдань (бонус)

## Деплой на GitHub Pages

1. Створити репозиторій `manage-projects`
2. У Settings → Pages → Source: **GitHub Actions**
3. Push в `main` — workflow `.github/workflows/deploy.yml` задеплоїть автоматично

`vite.config.ts` використовує `base: '/manage-projects/'` при `GITHUB_PAGES=true`.
При білді для Pages автоматично створюється `404.html` (копія `index.html`) — це потрібно для коректного refresh на deep links (`/projects/1`).

## Структура проекту

```
src/
├── api/
├── stores/
├── composables/
├── types/
├── validation/
├── components/
├── views/
├── router/
└── styles/
```

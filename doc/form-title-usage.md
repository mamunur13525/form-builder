# Form `title` Page — Usage Reference

## Types / Interfaces

| File | Lines | Usage |
|------|-------|-------|
| `src/entities/form/model/types.ts` | `Form.title`, `CreateFormRequest.title`, `UpdateFormRequest.title?` | API form types |
| `src/shared/types/common.ts` | `Form.title` | UI form type |
| `src/entities/response/model/types.ts` | `PublicFormSchema.form.title` | Public API schema |

## Adapters

| File | Lines | Usage |
|------|-------|-------|
| `src/features/forms/model/adapters.ts` | `adaptApiForm` → `title: apiForm.title` | Maps API → UI type |

## API Layer

| File | Lines | Usage |
|------|-------|-------|
| `src/entities/form/api/form.api.ts` | `updateForm(data: UpdateFormRequest)` | Sends `title` in PATCH body |
| `src/entities/response/api/public-form.api.ts` | `getPublicForm` → returns `Form` with `title` | Public form fetch |

## Store

| File | Lines | Usage |
|------|-------|-------|
| `src/app/store/formStore.ts` | `createForm({ title })`, `updateForm({ title })` | Zustand store |

## Hooks / Context

| File | Lines | Usage |
|------|-------|-------|
| `src/features/forms/hooks/FormContext.tsx` | `updateFormData({ title })` | Context provider |
| `src/features/forms/hooks/useForms.ts` | `useCreateForm(data: CreateFormRequest)`, `useUpdateForm({ data: UpdateFormRequest })` | TanStack Query hooks |

## Components

| File | Lines | Usage |
|------|-------|-------|
| `src/pages/FormBuilder/components/FormBuilderTopBar.tsx` | `initialTitle`, `title` state, `handleTitleSave`, breadcrumb display, edit dialog | Top bar breadcrumb + title edit dialog |
| `src/app/layouts/FormLayout.tsx` | `initialTitle={form?.title ?? ""}` | Passes title to TopBar |
| `src/pages/Dashboard/DashboardPage.tsx` | `createForm({ title })`, `form.title` in card | Create dialog + form cards |
| `src/shared/components/FormView.tsx` | `{form.title}` in top bar | Public form / preview view |
| `src/pages/FormPreview/FormPreviewPage.tsx` | `adaptApiForm(apiForm)` → title via adapter | Preview page |
| `src/pages/FormFill/FormFillPage.tsx` | `usePublicForm` → `form` with title via adapter | Public form fill page |
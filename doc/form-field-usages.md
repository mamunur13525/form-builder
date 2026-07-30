# Form Entity — Field Usage Reference

This document maps every property of the `Form` entity to all files that use it. Use this when changing a field name/type to know exactly which files to update.

---

## `title: string`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `Form.title`, `CreateFormRequest.title`, `UpdateFormRequest.title?` |
| | `src/shared/types/common.ts` | `Form.title` |
| | `src/entities/response/model/types.ts` | `PublicFormSchema.form.title` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `title: apiForm.title` |
| **API** | `src/entities/form/api/form.api.ts` | `createForm(data)`, `updateForm(data)` |
| **Store** | `src/app/store/formStore.ts` | `createForm({ title })`, `updateForm({ title })` |
| **Context** | `src/features/forms/hooks/FormContext.tsx` | `updateFormData({ title })` |
| **Hooks** | `src/features/forms/hooks/useForms.ts` | `useCreateForm(data)`, `useUpdateForm({ data })` |
| **Components** | `src/pages/FormBuilder/components/FormBuilderTopBar.tsx` | initialTitle prop, state, save, display, dialog |
| | `src/app/layouts/FormLayout.tsx` | `initialTitle={form?.title ?? ""}` |
| | `src/pages/Dashboard/DashboardPage.tsx` | `createForm({ title })`, `form.title` |
| | `src/shared/components/FormView.tsx` | `{form.title}` display |
| | `src/pages/FormPreview/FormPreviewPage.tsx` | via adapter → FormView |

## `slug: string`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `Form.slug`, `FormSlug.slug` |
| | `src/shared/types/common.ts` | `Form.slug` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `slug: apiForm.slug` |
| **Components** | `src/app/store/formStore.ts` | `getFormBySlug`, `submitPublicForm(form.slug)` |
| | `src/shared/components/FormView.tsx` | `submitPublicForm(form.slug)` |

## `status: "draft" | "published" | "archived"`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `FormStatus` type, `Form.status` |
| | `src/shared/types/common.ts` | `Form.status` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `status: apiForm.status` |
| **Context** | `src/features/forms/hooks/FormContext.tsx` | `isPublished` derived from status |
| **Components** | `src/pages/Dashboard/DashboardPage.tsx` | `form.status` badges |
| | `src/pages/FormBuilder/components/FormBuilderTopBar.tsx` | `isPublished` prop |

## `id: string`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `Form.id` |
| | `src/shared/types/common.ts` | `Form.id?` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `id: apiForm.id` |
| **Store** | `src/app/store/formStore.ts` | `getFormById`, `updateForm(id)`, etc. |
| **Components** | All pages using `formId` param + `form.id` |

## `theme: FormTheme` (primaryColor, backgroundColor, textColor)

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `FormTheme`, `Form.theme`, `UpdateFormThemeRequest` |
| | `src/shared/types/common.ts` | `Theme` / `Form.theme` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `theme: apiForm.theme` |
| **API** | `src/entities/form/api/form.api.ts` | `updateFormTheme` |
| **Hooks** | `src/features/forms/hooks/useForms.ts` | `useUpdateFormTheme` |

## `settings: FormSettings`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `FormSettings`, `Form.settings`, `UpdateFormSettingsRequest` |
| | `src/shared/types/common.ts` | `FormSettings` / `Form.settings` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `settings: apiForm.settings` |
| **API** | `src/entities/form/api/form.api.ts` | `updateFormSettings` |
| **Hooks** | `src/features/forms/hooks/useForms.ts` | `useUpdateFormSettings` |
| **Components** | `src/shared/components/FormView.tsx` | `form.settings.showStepCounter`, `form.settings.showProgressBar` |

## `createdBy: string` / `updatedBy?: string`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `Form.createdBy`, `Form.updatedBy?` |
| | `src/shared/types/common.ts` | `Form.createdBy`, `Form.updatedBy?` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `createdBy: apiForm.createdBy`, `updatedBy: undefined` |

## `fields: FormField[]`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `FormField`, `Form.fields` |
| | `src/shared/types/common.ts` | `FormField`, `Form.fields` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `fields: apiForm.fields.map(adaptApiField)` |
| **Components** | `src/shared/components/FormView.tsx` | `form.fields.filter((f) => f.isActive)` |

## `createdAt: string` / `updatedAt: string`

| Layer | File | Details |
|-------|------|---------|
| **Types** | `src/entities/form/model/types.ts` | `Form.createdAt`, `Form.updatedAt` |
| | `src/shared/types/common.ts` | `Form.createdAt?`, `Form.updatedAt?` |
| **Adapter** | `src/features/forms/model/adapters.ts` | `createdAt: apiForm.createdAt`, `updatedAt: apiForm.updatedAt` |
| **Store** | `src/app/store/formStore.ts` | `updatedAt: new Date().toISOString()` on updates |

---

## File Index (all files that reference Form fields)

| # | File | Fields Used |
|---|------|-------------|
| 1 | `src/entities/form/model/types.ts` | All (source of truth for API types) |
| 2 | `src/shared/types/common.ts` | All (source of truth for UI types) |
| 3 | `src/features/forms/model/adapters.ts` | All fields |
| 4 | `src/entities/form/api/form.api.ts` | title, settings, theme, share |
| 5 | `src/entities/response/api/public-form.api.ts` | All (returns full Form) |
| 6 | `src/app/store/formStore.ts` | title, slug, status, id |
| 7 | `src/features/forms/hooks/FormContext.tsx` | title, status (via isPublished) |
| 8 | `src/features/forms/hooks/useForms.ts` | title, settings, theme, share |
| 9 | `src/app/layouts/FormLayout.tsx` | title |
| 10 | `src/pages/FormBuilder/components/FormBuilderTopBar.tsx` | title, status (isPublished) |
| 11 | `src/pages/Dashboard/DashboardPage.tsx` | title, status, id |
| 12 | `src/shared/components/FormView.tsx` | title, slug, settings, fields |
| 13 | `src/pages/FormPreview/FormPreviewPage.tsx` | All (via adapter) |
| 14 | `src/pages/FormFill/FormFillPage.tsx` | All (via adapter) |
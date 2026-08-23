src/
├── app/
│   ├── providers/
│   │   ├── AppProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── RouterProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── protected-routes.tsx
│   │   └── public-routes.tsx
│   ├── layouts/
│   │   ├── MainLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── store/
│   │   ├── index.ts
│   │   └── rootReducer.ts
│   └── App.tsx
│
├── pages/
│   ├── Home/
│   │   ├── index.tsx
│   │   └── HomePage.tsx
│   ├── Login/
│   │   ├── index.tsx
│   │   └── LoginPage.tsx
│   └── Dashboard/
│       ├── index.tsx
│       └── DashboardPage.tsx
│
├── widgets/
│   ├── Header/
│   │   ├── index.tsx
│   │   └── Header.tsx
│   ├── Sidebar/
│   │   ├── index.tsx
│   │   └── Sidebar.tsx
│   └── FormBuilderPanel/
│       ├── index.tsx
│       └── FormBuilderPanel.tsx
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── model/
│   │   │   ├── auth.slice.ts
│   │   │   └── auth.types.ts
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   │
│   ├── forms/
│   │   ├── api/
│   │   │   ├── forms.api.ts
│   │   │   └── responses.api.ts
│   │   ├── model/
│   │   │   ├── form.types.ts
│   │   │   ├── form.schema.ts
│   │   │   └── form.slice.ts
│   │   ├── components/
│   │   │   ├── FormEditor.tsx
│   │   │   ├── FormPreview.tsx
│   │   │   ├── FormPageItem.tsx
│   │   │   └── ResponseTable.tsx
│   │   └── hooks/
│   │       ├── useForms.ts
│   │       └── useFormResponses.ts
│   │
│   └── users/
│       ├── api/
│       ├── model/
│       ├── components/
│       └── hooks/
│
├── entities/
│   ├── user/
│   │   ├── model/
│   │   │   ├── user.types.ts
│   │   │   └── user.slice.ts
│   │   ├── api/
│   │   └── ui/
│   ├── form/
│   │   ├── model/
│   │   ├── api/
│   │   └── ui/
│   └── response/
│       ├── model/
│       ├── api/
│       └── ui/
│
├── shared/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── error-handler.ts
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Loader/
│   │   └── ErrorState/
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useOutsideClick.ts
│   │   └── useToast.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── formatDate.ts
│   │   ├── generateSlug.ts
│   │   └── validate.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── roles.ts
│   │   └── form-types.ts
│   ├── types/
│   │   ├── common.ts
│   │   └── api.ts
│   └── assets/
│       ├── icons/
│       └── images/
│
├── services/
│   ├── firebase/
│   ├── socket/
│   ├── analytics/
│   └── storage/
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.css
│
└── main.tsx


## Feature Example: Form Settings

A multi-section settings page. **pages/** owns layout + local UI state,
**entities/** owns types + endpoint wrappers, **features/** owns the query and
mutation hooks that bind them.

src/
├── pages/
│   └── FormSettings/
│       ├── FormSettingsPage.tsx        — layout + section nav (owns SETTINGS_SECTIONS)
│       ├── components/
│       │   ├── primitives.tsx          — SettingsSection, SettingRow, ToggleRow, NestedPanel, FieldLabel
│       │   └── SaveBar.tsx             — per-section save button + status
│       ├── hooks/
│       │   └── useSectionState.ts      — local editing state + dirty tracking
│       └── sections/
│           ├── GeneralSettings.tsx
│           ├── EmailSettings.tsx
│           ├── AccessScheduling.tsx
│           └── HiddenFieldsVariables.tsx
│
├── entities/form/
│   ├── model/types.ts                  — settings request/response types
│   └── api/settings.api.ts             — endpoint wrappers (GET + five PATCH)
│
└── features/forms/hooks/
    └── useFormSettings.ts              — query + per-section mutation hooks
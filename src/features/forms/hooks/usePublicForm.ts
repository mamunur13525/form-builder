/**
 * Hook that fetches a public form (by slug) along with its fields.
 *
 * Combines GET /public/forms/:slug and GET /forms/:formId/fields
 * into a single query, returning a legacy-compatible Form object.
 */

import { useQuery } from "@tanstack/react-query"
import { getPublicForm } from "@/entities/response/api/public-form.api"
import { getFields } from "@/entities/form/api/field.api"
import { adaptApiForm } from "@/features/forms/model/adapters"
import type { Form } from "@/shared/types/common"

export function usePublicForm(slug: string) {
    return useQuery({
        queryKey: ["public-form", slug],
        queryFn: async (): Promise<Form> => {
            const apiForm = await getPublicForm(slug)
            const fields = await getFields(apiForm.id)
            return adaptApiForm(apiForm, fields)
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

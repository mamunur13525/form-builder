/**
 * Hook that fetches a public form (by slug) along with its fields.
 *
 * Fields are now embedded in the form response, so we only need
 * to call GET /public/forms/:slug once.
 */

import { useQuery } from "@tanstack/react-query"
import { getPublicForm } from "@/entities/response/api/public-form.api"
import { adaptApiForm } from "@/features/forms/model/adapters"
import type { Form } from "@/shared/types/common"

export function usePublicForm(slug: string) {
    return useQuery({
        queryKey: ["public-form", slug],
        queryFn: async (): Promise<Form> => {
            const apiForm = await getPublicForm(slug)
            return adaptApiForm(apiForm)
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

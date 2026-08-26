/**
 * Public re-exports for the Feedback board's data hooks.
 *
 * The canonical implementations live in the features layer
 * (`features/feedback` + `features/updates`); this barrel keeps the page-local
 * `../hooks` imports pointing at one place.
 */

export {
    PAGE_SIZE,
    isEmptyResult,
    useAddComment,
    useAddPost,
    useBoards,
    useComments,
    useCurrentAuthor,
    useDislikeComment,
    useFeedbackFilters,
    useFeedbackList,
    useIsAuthenticated,
    useLikeComment,
    usePost,
    useToggleUpvote,
    useUploadImage,
} from "@/features/feedback/hooks/useFeedback"
export type { FeedbackFilters } from "@/features/feedback/hooks/useFeedback"

export {
    useCreateUpdate,
    useDeleteUpdate,
    useProductActivity,
    useUpdate,
    useUpdateUpdate,
    useUpdates,
} from "@/features/updates/hooks/useUpdates"

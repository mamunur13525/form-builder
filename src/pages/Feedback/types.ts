/**
 * Public re-exports for the Feedback board's domain types.
 *
 * The canonical definitions live in the entities layer
 * (`entities/feedback` + `entities/update`); this barrel keeps the page-local
 * `../types` imports pointing at one place.
 */

export type {
    Author,
    Board,
    Comment,
    CreateFeedbackRequest,
    FeedbackPage,
    FeedbackPost,
    FeedbackQuery,
    FeedbackStatus,
    SortOrder,
} from "@/entities/feedback/model/types"

export type {
    CreateUpdateRequest,
    ProductActivity,
    TextRun,
    UpdateBlock,
    UpdateCoverKey,
    UpdateEntry,
    UpdateUpdateRequest,
} from "@/entities/update/model/types"

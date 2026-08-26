import { useEffect, useRef, useState } from "react"
import { X, Image as ImageIcon, ChevronsUpDown } from "lucide-react"
import { Link } from "react-router-dom"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/shared/constants/routes"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import {
    useAddPost,
    useBoards,
    useCurrentAuthor,
    useIsAuthenticated,
    useUploadImage,
} from "../hooks"
import { Avatar } from "./primitives"

// Mirror the backend's upload constraints so we can reject early with a clear
// message instead of round-tripping a doomed request.
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB — matches MAX_FILE_SIZE on the server
const ACCEPT_ATTR = "image/png,image/jpeg,image/gif,image/webp"

export function SubmitPostModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const isAuthed = useIsAuthenticated()
    const { data: boards = [] } = useBoards()
    const author = useCurrentAuthor()
    const addPost = useAddPost()
    const uploadImage = useUploadImage()

    const [boardId, setBoardId] = useState("")
    const [title, setTitle] = useState("")
    const [details, setDetails] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Default to the first board once the list loads.
    useEffect(() => {
        if (!boardId && boards.length) setBoardId(boards[0].id)
    }, [boards, boardId])

    // Revoke the object URL when the preview changes or the modal unmounts, so
    // we never leak blob: URLs.
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview)
        }
    }, [imagePreview])

    const reset = () => {
        setTitle("")
        setDetails("")
        setBoardId(boards[0]?.id ?? "")
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const close = () => {
        onOpenChange(false)
        reset()
    }

    const openFilePicker = () => fileInputRef.current?.click()

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        // Allow re-selecting the same file later by clearing the input value.
        e.target.value = ""
        if (!file) return

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            showError("Unsupported file", "Please choose a JPG, PNG, GIF, or WEBP image.")
            return
        }
        if (file.size > MAX_IMAGE_BYTES) {
            showError("Image too large", "Please choose an image under 5 MB.")
            return
        }

        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const isBusy = uploadImage.isPending || addPost.isPending

    const submit = async () => {
        if (!title.trim() || isBusy) return

        // Upload the image first (if one was picked) so the post is created with
        // its hosted URL in a single write.
        let imageUrl: string | undefined
        if (imageFile) {
            try {
                const uploaded = await uploadImage.mutateAsync(imageFile)
                imageUrl = uploaded.url
            } catch (err) {
                showError("Image upload failed", err)
                return
            }
        }

        addPost.mutate(
            {
                title: title.trim(),
                description: details.trim() || undefined,
                imageUrl,
                boardId,
            },
            {
                onSuccess: () => {
                    showSuccess("Submitted", "Your post is now on the board.")
                    close()
                },
                onError: (err) => showError("Could not create post", err),
            },
        )
    }

    const createLabel = uploadImage.isPending
        ? "Uploading…"
        : addPost.isPending
          ? "Creating…"
          : "Create"

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl rounded-2xl border-gray-200 bg-white p-0 text-left">
            {isAuthed ? (
                <div className="flex flex-col">
                    {/* Header: author › board selector › close */}
                    <div className="flex items-center gap-2 px-5 py-4">
                        {author && <Avatar author={author} size="sm" />}
                        <span className="text-gray-300">›</span>
                        <div className="relative">
                            <select
                                value={boardId}
                                onChange={(e) => setBoardId(e.target.value)}
                                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f2542d]/30"
                            >
                                {boards.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronsUpDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-5 pb-2">
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Submission title"
                            className="w-full border-0 p-0 text-2xl font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-0"
                        />
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Add details"
                            rows={3}
                            className="mt-3 w-full resize-none border-0 p-0 text-base text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-0"
                        />

                        {/* Image preview */}
                        {imagePreview && (
                            <div className="relative mt-3 inline-block max-w-full">
                                <img
                                    src={imagePreview}
                                    alt="Attachment preview"
                                    className="max-h-64 w-auto rounded-xl border border-gray-200 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75"
                                    aria-label="Remove image"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPT_ATTR}
                            onChange={onFileChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={openFilePicker}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                imageFile
                                    ? "border-[#f2542d] bg-[#fff1ec] text-[#f2542d]"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                            aria-label={imageFile ? "Change image" : "Add image"}
                            title={imageFile ? "Change image" : "Add image"}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <Button
                            onClick={submit}
                            disabled={!title.trim() || isBusy}
                            className="h-9 px-5 text-sm"
                        >
                            {createLabel}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">Log in to post</h2>
                    <p className="text-sm text-gray-500">
                        You need an account to submit feedback. It only takes a moment.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={close} className="h-9 px-4 text-sm">
                            Cancel
                        </Button>
                        <Link to={ROUTES.LOGIN}>
                            <Button className="h-9 px-5 text-sm">Log in</Button>
                        </Link>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

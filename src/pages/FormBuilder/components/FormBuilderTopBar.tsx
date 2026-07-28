import { useCallback, useRef } from "react"
import { ArrowLeft, Eye, Save, Share2, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { updateForm } from "../../../entities/form/api/form.api"

interface FormBuilderTopBarProps {
    title: string
    onTitleChange: (title: string) => void
    description: string
    onDescriptionChange: (description: string) => void
    id: string | undefined
    isPublished: boolean
    isLoading: boolean
    saveStatus: "idle" | "saving" | "saved" | "error"
    onShowSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void
    onPreview: () => void
    onPublish: () => void
    onPublishedClick: () => void
    onBack: () => void
}

export function FormBuilderTopBar({
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    id,
    isPublished,
    isLoading,
    saveStatus,
    onShowSaveStatus,
    onPreview,
    onPublish,
    onPublishedClick,
    onBack,
}: FormBuilderTopBarProps) {
    const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleSave = useCallback(async () => {
        if (!id || id === "new") return

        try {
            onShowSaveStatus("saving")
            await updateForm(id, {
                title,
                description,
            })
            onShowSaveStatus("saved")
        } catch (error) {
            console.error("Failed to save form:", error)
            onShowSaveStatus("error")
        }

        if (saveStatusTimeoutRef.current) {
            clearTimeout(saveStatusTimeoutRef.current)
        }
        saveStatusTimeoutRef.current = setTimeout(() => {
            onShowSaveStatus("idle")
        }, 2000)
    }, [id, title, description, onShowSaveStatus])

    return (
        <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
            <div className="flex items-center gap-3 flex-1">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 space-y-1">
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                        placeholder="Form Title"
                    />
                    <Input
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                        placeholder="Add description..."
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                {saveStatus !== "idle" && (
                    <span
                        className={`text-xs ${saveStatus === "saving"
                            ? "text-yellow-600"
                            : saveStatus === "saved"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {saveStatus === "saving" && <span className="flex items-center">< Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</span>}
                        {saveStatus === "saved" && <span className="flex items-center">< CheckCircle className="mr-1 h-4 w-4" /> Saved</span>}
                        {saveStatus === "error" && <span className="flex items-center">< AlertCircle className="mr-1 h-4 w-4" /> Error</span>}
                    </span>
                )}
                <Button variant="outline" size="sm" onClick={onPreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                </Button>
                {!isPublished ? (
                    <Button size="sm" onClick={onPublish}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Publish
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={onPublishedClick}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Published
                    </Button>
                )}
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save"}
                </Button>

            </div>
        </div>
    )
}
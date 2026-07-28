import { ArrowLeft, Eye, Share2, CheckCircle, Loader2, AlertCircle, Play } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"


interface FormBuilderTopBarProps {
    title: string
    onTitleChange: (title: string) => void
    description: string
    onDescriptionChange: (description: string) => void
    isPublished: boolean
    saveStatus: "idle" | "saving" | "saved" | "error"
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
    isPublished,
    saveStatus,
    onPreview,
    onPublish,
    onPublishedClick,
    onBack,
}: FormBuilderTopBarProps) {

    return (
        <div className="flex items-center justify-between px-4 py-2 shrink-0 bg-background border rounded-md">
            <div className="flex items-center gap-1 flex-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 space-y-1">
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="text-sm font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                        placeholder="Form Title"
                    />
                    <Input
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className="text-xs text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                        placeholder="Add description..."
                    />
                </div>
            </div>
            <div className="flex items-center gap-1">
                {saveStatus !== "idle" && (
                    <span
                        className={`text-xs ${saveStatus === "saving"
                            ? "text-yellow-600"
                            : saveStatus === "saved"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {saveStatus === "saving" && <span className="flex items-center"><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Saving...</span>}
                        {saveStatus === "saved" && <span className="flex items-center"><CheckCircle className="mr-1 h-3.5 w-3.5" /> Saved</span>}
                        {saveStatus === "error" && <span className="flex items-center"><AlertCircle className="mr-1 h-3.5 w-3.5" /> Error</span>}
                    </span>
                )}
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onPreview}>
                    <Play className="h-3.5 w-3.5 text-black/60" />
                    Preview
                </Button>
                {!isPublished ? (
                    <Button size="sm" className="h-8 gap-1.5 text-xs font-medium" onClick={onPublish}>
                        <Share2 className="h-3.5 w-3.5" />
                        Publish
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="default"
                        className="h-8 gap-1.5 text-xs font-medium bg-green-600 hover:bg-green-700"
                        onClick={onPublishedClick}
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Published
                    </Button>
                )}
            </div>
        </div>
    )
}
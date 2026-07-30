import { useCallback } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useFormStore } from "../../../app/store/formStore"

interface PublishDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    id: string | undefined
    isPublished: boolean
    slug?: string
    onIsPublishedChange: (published: boolean) => void
    onOpenForm: () => void
}

export function PublishDialog({
    open,
    onOpenChange,
    id,
    isPublished,
    slug,
    onIsPublishedChange,
    onOpenForm,
}: PublishDialogProps) {
    const { publishForm } = useFormStore()

    const handlePublish = useCallback(async () => {
        if (!id || id === "new") return
        await publishForm(id)
        onIsPublishedChange(true)
    }, [id, publishForm, onIsPublishedChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isPublished ? "Form Published" : "Publish Form"}</DialogTitle>
                    <DialogDescription>
                        {isPublished
                            ? "Your form is live and ready to collect responses."
                            : "Publish your form to make it available for users to fill out."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                {isPublished ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Form is published</span>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Form Link</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={`${window.location.origin}/form/${slug || "form-slug"}`}
                                    className="text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/form/${slug || "form-slug"}`
                                        )
                                    }}
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                        <Button className="w-full" onClick={onOpenForm}>
                            Open Form
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to publish this form? Once published, users will be able to access
                            and submit the form.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={async () => {
                                    await handlePublish()
                                    onOpenChange(false)
                                }}
                            >
                                Publish Now
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            </DialogContent>
        </Dialog>
    )
}

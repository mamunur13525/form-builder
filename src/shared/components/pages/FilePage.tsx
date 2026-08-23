import { Upload } from "lucide-react"

interface FilePageProps {
    disabled?: boolean
}

export function FilePage({ disabled }: FilePageProps) {
    return (
        <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
                disabled ? "opacity-50" : ""
            }`}
        >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click or drag files to upload</p>
        </div>
    )
}
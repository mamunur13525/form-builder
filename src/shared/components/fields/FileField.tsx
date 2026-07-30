import { Upload } from "lucide-react"

interface FileFieldProps {
    disabled?: boolean
}

export function FileField({ disabled }: FileFieldProps) {
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
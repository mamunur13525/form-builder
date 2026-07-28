import { Button } from "@/components/ui/button";
import { GitBranch, Paintbrush, Play, Plus } from "lucide-react";

interface PageContentTopbarProps {
    onAddPage: () => void
    onPreview: () => void
}

const PageContentTopbar = ({
    onAddPage,
    onPreview,
}: PageContentTopbarProps) => {
    return (
        <div className="flex items-center justify-between px-4 py-2  shrink-0 bg-background border rounded-md shadow-sm">
            <div className="flex items-center gap-1">
                <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    onClick={onAddPage}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Page
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                    <Paintbrush className="h-3.5 w-3.5" />
                    Design
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                    <GitBranch className="h-3.5 w-3.5" />
                    Logic
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onPreview}
                >
                    <Play className="h-4 w-4" />
                </Button>
            </div>

        </div>
    )
}

export default PageContentTopbar;
import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
    Plus,
    Save,
    Eye,
    Trash2,
    Settings2,
    ArrowLeft,
    ArrowRight,
    FileText,
    CheckSquare,
    List,
    Star,
    Type,
    AlignLeft,
    Mail,
    Phone,
    Hash,
    Calendar,
    Clock,
    CircleDot,
    ListChecks,
    Upload,
    ThumbsUp,
    Link,
    X,
    MoreVertical,
    Copy,
    GripVertical,
    Share2,
    CheckCircle,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../../components/ui/dropdown-menu"
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "../../components/ui/resizable"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { useFormStore } from "../../app/store/formStore"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS } from "../../shared/constants/form-types"
import type { Form, FormField } from "../../shared/types/common"
import type { LucideIcon } from "lucide-react"

const PAGE_TYPE_ICONS: Record<string, LucideIcon> = {
    shortText: Type,
    longText: AlignLeft,
    email: Mail,
    phone: Phone,
    number: Hash,
    date: Calendar,
    time: Clock,
    radio: CircleDot,
    checkbox: CheckSquare,
    select: List,
    multiSelect: ListChecks,
    file: Upload,
    rating: Star,
    yesNo: ThumbsUp,
    url: Link,
    welcome: FileText,
    thankYou: CheckSquare,
}

const PAGE_TYPES = [
    { type: "shortText", label: "Short Text", icon: Type },
    { type: "longText", label: "Long Text", icon: AlignLeft },
    { type: "email", label: "Email", icon: Mail },
    { type: "phone", label: "Phone", icon: Phone },
    { type: "number", label: "Number", icon: Hash },
    { type: "date", label: "Date", icon: Calendar },
    { type: "time", label: "Time", icon: Clock },
    { type: "radio", label: "Radio", icon: CircleDot },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "select", label: "Select", icon: List },
    { type: "multiSelect", label: "Multi Select", icon: ListChecks },
    { type: "file", label: "File Upload", icon: Upload },
    { type: "rating", label: "Rating", icon: Star },
    { type: "yesNo", label: "Yes/No", icon: ThumbsUp },
    { type: "url", label: "URL", icon: Link },
]

interface SortablePageItemProps {
    page: FormField
    index: number
    isSelected: boolean
    selectedPageIndex: number
    onSelect: (index: number) => void
    onDuplicate: (index: number) => void
    onDelete: (index: number) => void
}

function SortablePageItem({
    page,
    index,
    isSelected,
    selectedPageIndex,
    onSelect,
    onDuplicate,
    onDelete,
}: SortablePageItemProps) {
    const Icon = PAGE_TYPE_ICONS[page.type] || FileText
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.fieldKey })

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${isSelected
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted text-muted-foreground"
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing flex items-center gap-2 flex-1 min-w-0"
                onClick={() => onSelect(index)}
            >
                <GripVertical className="h-4 w-4 shrink-0 opacity-50" />
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{page.label || "Untitled"}</span>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger onClick={(e) => {
                    e.stopPropagation()
                }}
                    className="p-1 hover:bg-accent rounded shrink-0">

                    <MoreVertical className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                    <DropdownMenuItem onClick={() => onDuplicate(index)}>
                        <Copy className="h-4 w-4" />
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(index)} variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export function FormBuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { forms, fetchForms, updateForm, publishForm, isLoading } = useFormStore()

    const existingForm = id && id !== "new" ? forms.find((f) => f._id === id) : null

    const [title, setTitle] = useState(existingForm?.title || searchParams.get("title") || "")
    const [description, setDescription] = useState(existingForm?.description || searchParams.get("desc") || "")
    const [pages, setPages] = useState<FormField[]>(existingForm?.fields || [])
    const [selectedPageIndex, setSelectedPageIndex] = useState(0)
    const [addPageDialogOpen, setAddPageDialogOpen] = useState(false)
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [isPublished, setIsPublished] = useState(existingForm?.status === "published")

    useEffect(() => {
        if (forms.length === 0) {
            fetchForms()
        }
    }, [forms.length, fetchForms])

    const selectedPage = pages[selectedPageIndex]

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const addPage = (type: string) => {
        const newPage: FormField = {
            fieldKey: `page_${Date.now()}`,
            label: "New Question",
            helperText: "",
            placeholder: "",
            type,
            required: false,
            order: pages.length + 1,
            options: type === "radio" || type === "checkbox" || type === "select" || type === "multiSelect"
                ? [{ label: "Option 1", value: "option_1" }]
                : [],
            logic: [],
            appearance: { width: "full" },
            isActive: true,
        }
        setPages([...pages, newPage])
        setSelectedPageIndex(pages.length)
        setAddPageDialogOpen(false)
    }

    const updatePage = (index: number, updates: Partial<FormField>) => {
        const updated = [...pages]
        updated[index] = { ...updated[index], ...updates }
        setPages(updated)
    }

    const duplicatePage = (index: number) => {
        const page = pages[index]
        const newPage: FormField = {
            ...page,
            fieldKey: `page_${Date.now()}`,
            label: page.label + " (copy)",
            order: pages.length + 1,
        }
        const updated = [...pages]
        updated.splice(index + 1, 0, newPage)
        setPages(updated)
    }

    const removePage = (index: number) => {
        if (pages.length <= 1) return
        setPages(pages.filter((_, i) => i !== index))
        if (selectedPageIndex >= pages.length - 1) {
            setSelectedPageIndex(Math.max(0, pages.length - 2))
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = pages.findIndex((p) => p.fieldKey === active.id)
            const newIndex = pages.findIndex((p) => p.fieldKey === over.id)
            if (oldIndex !== -1 && newIndex !== -1) {
                const updated = [...pages]
                const [moved] = updated.splice(oldIndex, 1)
                updated.splice(newIndex, 0, moved)
                setPages(updated)
            }
        }
    }

    const handleSave = async () => {
        if (!id || id === "new") return

        const form = forms.find((f) => f._id === id)
        if (form) {
            await updateForm(id, {
                title,
                description,
                fields: pages,
            })
        }
    }

    const handlePublish = async () => {
        if (!id || id === "new") return
        await publishForm(id)
        setIsPublished(true)
    }

    const PageIcon = selectedPage ? (PAGE_TYPE_ICONS[selectedPage.type] || FileText) : FileText

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                            placeholder="Form Title"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/form-preview/${id || "new"}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </Button>
                    {!isPublished ? (
                        <Button size="sm" onClick={handlePublish}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Publish
                        </Button>
                    ) : (
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setPublishDialogOpen(true)}>
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

            {/* Three-panel layout with resizable panels */}
            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                {/* LEFT PANEL - Pages */}
                <ResizablePanel defaultSize={200} minSize={200} maxSize={300}>
                    <div className="w-full h-full border-r flex flex-col">
                        <div className="p-3 border-b">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pages</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={pages.map((p) => p.fieldKey)} strategy={verticalListSortingStrategy}>
                                    {pages.map((page, index) => (
                                        <SortablePageItem
                                            key={page.fieldKey}
                                            page={page}
                                            index={index}
                                            isSelected={index === selectedPageIndex}
                                            selectedPageIndex={selectedPageIndex}
                                            onSelect={setSelectedPageIndex}
                                            onDuplicate={duplicatePage}
                                            onDelete={removePage}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                        <div className="p-3 border-t">
                            <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                                onClick={() => setAddPageDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Page
                            </Button>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* MIDDLE PANEL - Page Content */}
                <ResizablePanel defaultSize={700} minSize={300}>
                    <div className="w-full h-full overflow-y-auto p-6">
                        {selectedPage ? (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <PageIcon className="h-5 w-5 text-muted-foreground" />
                                    <Badge variant="secondary">
                                        {FIELD_TYPE_LABELS[selectedPage.type as keyof typeof FIELD_TYPE_LABELS] || selectedPage.type}
                                    </Badge>
                                    {selectedPage.required && (
                                        <Badge variant="destructive" className="text-[10px]">Required</Badge>
                                    )}
                                </div>

                                {/* Editable Label */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Question</Label>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        className="text-2xl font-bold outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
                                        onBlur={(e) => updatePage(selectedPageIndex, { label: e.currentTarget.textContent || "" })}
                                        dangerouslySetInnerHTML={{ __html: selectedPage.label }}
                                    />
                                </div>

                                {/* Editable Helper Text */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Description / Helper Text</Label>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        className="text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
                                        onBlur={(e) => updatePage(selectedPageIndex, { helperText: e.currentTarget.textContent || "" })}
                                        dangerouslySetInnerHTML={{ __html: selectedPage.helperText || "Click to add description..." }}
                                    />
                                </div>

                                {/* Placeholder */}
                                {(selectedPage.type === "shortText" || selectedPage.type === "longText" || selectedPage.type === "email" || selectedPage.type === "phone" || selectedPage.type === "number" || selectedPage.type === "url") && (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Placeholder</Label>
                                        <Input
                                            value={selectedPage.placeholder}
                                            onChange={(e) => updatePage(selectedPageIndex, { placeholder: e.target.value })}
                                            placeholder="Placeholder text..."
                                        />
                                    </div>
                                )}

                                {/* Options for choice-based fields */}
                                {(selectedPage.type === "radio" || selectedPage.type === "checkbox" || selectedPage.type === "select" || selectedPage.type === "multiSelect") && (
                                    <div className="space-y-3">
                                        <Label className="text-xs text-muted-foreground">Options</Label>
                                        {selectedPage.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                                {selectedPage.type === "radio" || selectedPage.type === "select" ? (
                                                    <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                                                ) : (
                                                    <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                                                )}
                                                <Input
                                                    value={opt.label}
                                                    onChange={(e) => {
                                                        const newOpts = [...selectedPage.options]
                                                        newOpts[optIndex] = {
                                                            label: e.target.value,
                                                            value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                                        }
                                                        updatePage(selectedPageIndex, { options: newOpts })
                                                    }}
                                                    placeholder="Option label"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0"
                                                    onClick={() => {
                                                        const newOpts = selectedPage.options.filter((_, i) => i !== optIndex)
                                                        updatePage(selectedPageIndex, { options: newOpts })
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                updatePage(selectedPageIndex, {
                                                    options: [...selectedPage.options, { label: "", value: "" }],
                                                })
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Option
                                        </Button>
                                    </div>
                                )}

                                {/* Rating preview */}
                                {selectedPage.type === "rating" && (
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Button key={star} variant="outline" size="icon" className="h-12 w-12 text-lg">
                                                {star}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {/* Yes/No preview */}
                                {selectedPage.type === "yesNo" && (
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="px-8">Yes</Button>
                                        <Button variant="outline" className="px-8">No</Button>
                                    </div>
                                )}

                                {/* Navigation between pages */}
                                <div className="flex items-center justify-between pt-4 border-t mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={selectedPageIndex === 0}
                                        onClick={() => setSelectedPageIndex(selectedPageIndex - 1)}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous Page
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {selectedPageIndex + 1} of {pages.length}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={selectedPageIndex === pages.length - 1}
                                        onClick={() => setSelectedPageIndex(selectedPageIndex + 1)}
                                    >
                                        Next Page
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Select a page to edit</p>
                            </div>
                        )}
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* RIGHT PANEL - Settings */}
                <ResizablePanel defaultSize={100} minSize={200} maxSize={300}>
                    <div className="w-full h-full border-l flex flex-col">
                        <div className="p-3 border-b">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                Settings
                            </h3>
                        </div>
                        {selectedPage ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                                {/* Field Type */}
                                <div className="space-y-2">
                                    <Label className="text-xs">Field Type</Label>
                                    <Select
                                        value={selectedPage.type}
                                        onValueChange={(value) => updatePage(selectedPageIndex, { type: value })}

                                    >
                                        <SelectTrigger className={'w-full'}>
                                            <SelectValue placeholder="Select field type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAGE_TYPES.map((pt) => (
                                                <SelectItem key={pt.type} value={pt.type}>
                                                    {pt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Required Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs cursor-pointer">Required</Label>
                                    <input
                                        type="checkbox"
                                        checked={selectedPage.required}
                                        onChange={(e) => updatePage(selectedPageIndex, { required: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                </div>

                                {/* Validation */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold">Validation</Label>
                                    {(selectedPage.type === "shortText" || selectedPage.type === "longText") && (
                                        <>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] text-muted-foreground">Min Length</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedPage.validation?.minLength || ""}
                                                    onChange={(e) => updatePage(selectedPageIndex, {
                                                        validation: { ...selectedPage.validation, minLength: Number(e.target.value) || undefined }
                                                    })}
                                                    placeholder="0"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] text-muted-foreground">Max Length</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedPage.validation?.maxLength || ""}
                                                    onChange={(e) => updatePage(selectedPageIndex, {
                                                        validation: { ...selectedPage.validation, maxLength: Number(e.target.value) || undefined }
                                                    })}
                                                    placeholder="1000"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {selectedPage.type === "number" && (
                                        <>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] text-muted-foreground">Min Value</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedPage.validation?.min || ""}
                                                    onChange={(e) => updatePage(selectedPageIndex, {
                                                        validation: { ...selectedPage.validation, min: Number(e.target.value) || undefined }
                                                    })}
                                                    placeholder="0"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] text-muted-foreground">Max Value</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedPage.validation?.max || ""}
                                                    onChange={(e) => updatePage(selectedPageIndex, {
                                                        validation: { ...selectedPage.validation, max: Number(e.target.value) || undefined }
                                                    })}
                                                    placeholder="100"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Custom Error Message</Label>
                                        <Input
                                            value={selectedPage.validation?.message || ""}
                                            onChange={(e) => updatePage(selectedPageIndex, {
                                                validation: { ...selectedPage.validation, message: e.target.value }
                                            })}
                                            placeholder="This field is required"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Logic */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold">Logic</Label>
                                    {selectedPage.logic.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No logic rules configured</p>
                                    ) : (
                                        selectedPage.logic.map((rule, ruleIndex) => (
                                            <div key={ruleIndex} className="p-2 rounded border bg-muted/30 space-y-1">
                                                <p className="text-xs">
                                                    When <strong>{rule.whenFieldKey}</strong> {rule.operator} "{String(rule.value)}"
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    → {rule.action} {rule.targetFieldKey}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                    <Button variant="outline" size="sm" className="w-full text-xs">
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Logic
                                    </Button>
                                </div>

                                {/* Appearance */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Appearance</Label>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-muted-foreground">Width</Label>
                                        <Select
                                            value={selectedPage.appearance.width}
                                            onValueChange={(value) => updatePage(selectedPageIndex, {
                                                appearance: { ...selectedPage.appearance, width: value as "full" | "half" }
                                            })}
                                        >
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="Select width" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full">Full Width</SelectItem>
                                                <SelectItem value="half">Half Width</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center text-sm">
                                Select a page to view settings
                            </div>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* Publish Dialog */}
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
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
                                        value={`${window.location.origin}/form/${existingForm?.slug || "form-slug"}`}
                                        className="text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/form/${existingForm?.slug || "form-slug"}`)
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => {
                                    setPublishDialogOpen(false)
                                    navigate(`/form/${existingForm?.slug || "form-slug"}`)
                                }}
                            >
                                Open Form
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to publish this form? Once published, users will be able to access and submit the form.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setPublishDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={async () => {
                                        await handlePublish()
                                        setPublishDialogOpen(false)
                                    }}
                                >
                                    Publish Now
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

            {/* Add Page Dialog */}
            <Dialog open={addPageDialogOpen} onOpenChange={setAddPageDialogOpen}>
                <DialogHeader>
                    <DialogTitle>Add a Page</DialogTitle>
                    <DialogDescription>Choose the type of page you want to add to your form.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto py-2">
                    {PAGE_TYPES.map((pt) => {
                        const Icon = pt.icon
                        return (
                            <button
                                key={pt.type}
                                onClick={() => addPage(pt.type)}
                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent hover:border-primary/50 transition-all text-left"
                            >
                                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                                <span className="text-sm">{pt.label}</span>
                            </button>
                        )
                    })}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setAddPageDialogOpen(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

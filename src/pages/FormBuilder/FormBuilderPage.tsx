import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "../../components/ui/resizable"
import { useFormStore } from "../../app/store/formStore"
import type { FormField } from "../../shared/types/common"
import { getFormById, updateForm } from "../../entities/form/api/form.api"
import {
    createField,
    updateField,
    deleteField,
    duplicateField,
} from "../../entities/form/api/field.api"
import { adaptApiForm } from "../../features/forms/model/adapters"
import { useDebounce } from "../../shared/hooks/useDebounce"
import { FormBuilderTopBar } from "./components/FormBuilderTopBar"
import { FormBuilderSidebar } from "./components/FormBuilderSidebar"
import { PageContentEditor } from "./components/PageContentEditor/PageContentEditor"
import { SettingsPanel } from "./components/SettingsPanel"
import { PublishDialog } from "./components/PublishDialog"
import { AddPageDialog } from "./components/AddPageDialog"
import PageContentTopbar from "./components/PageContentEditor/PageContentTopbar"

export function FormBuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { forms, fetchForms, isLoading } = useFormStore()

    const [title, setTitle] = useState(searchParams.get("title") || "")
    const [description, setDescription] = useState("")
    const [pages, setPages] = useState<FormField[]>([])
    const [selectedPageIndex, setSelectedPageIndex] = useState(0)
    const [showAddPageDialog, setShowAddPageDialog] = useState(false)
    const [showPublishDialog, setShowPublishDialog] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
    const [isLoadingForm, setIsLoadingForm] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasInitializedRef = useRef(false)
    const pendingFieldUpdateRef = useRef<{ fieldId: string; data: any } | null>(null)
    const [isMobileView, setIsMobileView] = useState(false)


    const showSaveStatus = useCallback((status: "idle" | "saving" | "saved" | "error") => {
        setSaveStatus(status)
        if (saveStatusTimeoutRef.current) {
            clearTimeout(saveStatusTimeoutRef.current)
        }
        if (status !== "idle") {
            saveStatusTimeoutRef.current = setTimeout(() => {
                setSaveStatus("idle")
            }, 2000)
        }
    }, [])

    // Fetch all forms only when creating a new form (not when editing)
    useEffect(() => {
        if (!id || id === "new") {
            // Only fetch all forms when creating a new form
            if (forms.length === 0) {
                fetchForms()
            }
        }
    }, [id, forms.length, fetchForms])

    // Fetch specific form by ID when editing an existing form
    useEffect(() => {
        const loadForm = async () => {
            // Skip if creating new form or already initialized
            if (!id || id === "new" || hasInitializedRef.current) {
                if (!id || id === "new") {
                    setTitle(searchParams.get("title") || "")
                }
                return
            }

            // Check if form is already in the store
            const cachedForm = forms.find((f) => f.id === id)
            console.log({ cachedForm })
            if (cachedForm) {
                hasInitializedRef.current = true
                setTitle(cachedForm.title || "")
                setDescription(cachedForm.description || "")
                setPages(cachedForm.fields || [])
                setSelectedPageIndex(0)
                setIsPublished(cachedForm.status === "published")
                return
            }

            // Fetch form directly from API
            setIsLoadingForm(true)
            setFormError(null)
            try {
                const apiForm = await getFormById(id)
                console.log({ apiForm })

                const adaptedForm = adaptApiForm(apiForm)
                console.log({ adaptedForm })
                hasInitializedRef.current = true
                setTitle(adaptedForm.title || "")
                setDescription(adaptedForm.description || "")
                setPages(adaptedForm.fields || [])
                setSelectedPageIndex(0)
                setIsPublished(adaptedForm.status === "published")
            } catch (error) {
                console.error("Failed to fetch form:", error)
                setFormError(error instanceof Error ? error.message : "Failed to load form")
            } finally {
                setIsLoadingForm(false)
            }
        }

        loadForm()
    }, [id, forms, searchParams])

    const selectedPage = pages[selectedPageIndex]

    const autoSaveTitle = useCallback(async () => {
        if (!id || id === "new") return

        try {
            showSaveStatus("saving")
            await updateForm(id, {
                title,
                description,
            })
            showSaveStatus("saved")
        } catch (error) {
            console.error("Failed to auto-save title:", error)
            showSaveStatus("error")
        }
    }, [id, title, description, showSaveStatus])

    const debouncedAutoSaveTitle = useDebounce(autoSaveTitle, 1000)

    const executeFieldUpdate = useCallback(async () => {
        const pending = pendingFieldUpdateRef.current
        if (!pending || !id || id === "new") return

        try {
            showSaveStatus("saving")
            await updateField(id, pending.fieldId, pending.data)
            showSaveStatus("saved")
        } catch (error) {
            console.error("Failed to update field:", error)
            showSaveStatus("error")
        }
    }, [id, showSaveStatus])

    const debouncedFieldUpdate = useDebounce(executeFieldUpdate, 1000)

    const handleDescriptionChange = (newDescription: string) => {
        setDescription(newDescription)
        // Auto-save description if form has been persisted to server
        if (id && id !== "new") {
            debouncedAutoSaveTitle()
        }
    }

    const updatePage = useCallback(async (index: number, updates: Partial<FormField>) => {
        const field = pages[index]
        if (!field) return

        const fieldId = (field as any)._id as string | undefined
        if (!fieldId) return

        // Optimistically update local state
        const updated = [...pages]
        updated[index] = { ...updated[index], ...updates }
        setPages(updated)

        // If form is persisted, debounce the API update
        if (id && id !== "new") {
            // Prepare the update data, ensuring appearance.icon is always provided
            const updateData: any = { ...updates }
            if (updateData.appearance && !updateData.appearance.icon) {
                updateData.appearance = { ...updateData.appearance, icon: "" }
            }
            pendingFieldUpdateRef.current = { fieldId, data: updateData }
            debouncedFieldUpdate()
        }
    }, [id, pages, showSaveStatus, debouncedFieldUpdate])

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle)
        // Auto-save title if form has been persisted to server
        if (id && id !== "new") {
            debouncedAutoSaveTitle()
        }
    }

    const addPage = useCallback(async (page: FormField) => {
        if (!id || id === "new") {
            // For new forms, just add to local state
            setPages(prev => [...prev, page])
            setSelectedPageIndex(pages.length)
            return
        }

        try {
            showSaveStatus("saving")
            // Create field via API
            const createdField = await createField(id, {
                type: page.type,
                label: page.label,
                helperText: page.helperText,
                placeholder: page.placeholder,
                required: page.required,
                options: page.options,
                validation: page.validation,
                appearance: {
                    width: page.appearance.width,
                    icon: page.appearance.icon || "",
                },
            })

            // Update local state with the created field (which has id from server)
            setPages(prev => [...prev, { ...page, _id: createdField._id, fieldKey: createdField.fieldKey }])
            setSelectedPageIndex(pages.length)
            showSaveStatus("saved")
        } catch (error) {
            console.error("Failed to create field:", error)
            showSaveStatus("error")
        }
    }, [id, pages.length, showSaveStatus])

    const deletePage = useCallback(async (index: number) => {
        console.log({ index })
        if (pages.length <= 1) return

        const pageToDelete = pages[index]
        const fieldId = "_id" in pageToDelete ? pageToDelete._id : undefined
        console.log({ fieldId, pageToDelete })
        // Optimistically update local state
        const updatedPages = pages.filter((_, i) => i !== index)
        setPages(updatedPages)

        if (selectedPageIndex >= updatedPages.length) {
            setSelectedPageIndex(Math.max(0, updatedPages.length - 1))
        }

        // If form is persisted, delete via API
        if (id && id !== "new" && fieldId !== undefined) {
            try {
                showSaveStatus("saving")
                await deleteField(id, fieldId)
                showSaveStatus("saved")
            } catch (error) {
                console.error("Failed to delete field:", error)
                showSaveStatus("error")
                // Revert on error
                setPages(pages)
            }
        }
    }, [id, pages, selectedPageIndex, showSaveStatus])

    const duplicatePage = useCallback(async (index: number) => {
        const page = pages[index]
        const fieldId = (page as any)._id as string | undefined
        if (!fieldId) return

        // Optimistically update local state
        const newPage: FormField = {
            ...page,
            fieldKey: `field_${Date.now()}`,
            label: page.label + " (copy)",
            order: pages.length + 1,
            appearance: { width: page.appearance.width, icon: page.appearance.icon || "" },
        }

        const updatedPages = [...pages]
        updatedPages.splice(index + 1, 0, newPage)
        setPages(updatedPages)
        setSelectedPageIndex(index + 1)

        // If form is persisted, duplicate via API
        if (id && id !== "new") {
            try {
                showSaveStatus("saving")
                const duplicatedField = await duplicateField(id, fieldId)

                // Update the temporary field with the real one from server
                setPages(prev => {
                    const updated = [...prev]
                    updated[index + 1] = {
                        ...newPage,
                        _id: duplicatedField._id,
                        fieldKey: duplicatedField.fieldKey,
                    } as FormField
                    return updated
                })
                showSaveStatus("saved")
            } catch (error) {
                console.error("Failed to duplicate field:", error)
                showSaveStatus("error")
                // Revert on error
                setPages(pages)
            }
        }
    }, [id, pages, showSaveStatus])

    // Show loading state while fetching form
    if (isLoadingForm) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading form...</p>
                </div>
            </div>
        )
    }

    // Show error state if form failed to load
    if (formError) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive mb-4">{formError}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }
    console.log({ pages })
    return (
        <div className="h-screen flex flex-col bg-muted/50">
            <FormBuilderTopBar
                title={title}
                onTitleChange={handleTitleChange}
                description={description}
                onDescriptionChange={handleDescriptionChange}
                id={id}
                isPublished={isPublished}
                isLoading={isLoading || isLoadingForm}
                saveStatus={saveStatus}
                onShowSaveStatus={showSaveStatus}
                onPreview={() => navigate(`/form-preview/${id || "new"}`)}
                onPublish={() => setShowPublishDialog(true)}
                onPublishedClick={() => setShowPublishDialog(true)}
                onBack={() => navigate("/dashboard")}
            />

            <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0 p-3">
                <ResizablePanel defaultSize={200} minSize={200} maxSize={300}>
                    <FormBuilderSidebar
                        pages={pages}
                        selectedPageIndex={selectedPageIndex}
                        id={id}
                        onSelectPage={setSelectedPageIndex}
                        onSetPages={setPages}
                        onAddPage={() => setShowAddPageDialog(true)}
                        onDeletePage={deletePage}
                        onDuplicatePage={duplicatePage}
                        onShowSaveStatus={showSaveStatus}
                    />
                </ResizablePanel>

                <ResizableHandle className="w-3 bg-transparent after:hidden" />

                <ResizablePanel defaultSize={700} minSize={300}>
                    <div className="h-full w-full flex flex-col gap-3">
                        <PageContentTopbar
                            onAddPage={() => { setShowAddPageDialog(true) }}
                            onPreview={() => { }}
                            isMobileView={isMobileView}
                            onToggleView={() => setIsMobileView(prev => !prev)}
                        />

                        <div className={`w-full flex items-center justify-center flex-1 bg-background border rounded-md shadow-sm transition-all duration-500 ease-in-out ${isMobileView ? "max-w-sm mx-auto" : "max-w-full"}`}>
                            {selectedPage ? (
                                <PageContentEditor
                                    page={selectedPage}
                                    pageIndex={selectedPageIndex}
                                    onUpdate={updatePage}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>Select a page to edit</p>
                                </div>
                            )}
                        </div>
                    </div>

                </ResizablePanel>

                <ResizableHandle className="w-3 bg-transparent after:hidden" />

                <ResizablePanel defaultSize={100} minSize={200} maxSize={300}>
                    {selectedPage ? (
                        <SettingsPanel
                            page={selectedPage}
                            pageIndex={selectedPageIndex}
                            onUpdate={updatePage}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col bg-background border rounded-md shadow-sm overflow-hidden">
                            <div className="p-3 border-b">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <span>Settings</span>
                                </h3>
                            </div>
                            <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center text-sm">
                                Select a page to view settings
                            </div>
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>

            <PublishDialog
                open={showPublishDialog}
                onOpenChange={setShowPublishDialog}
                id={id}
                isPublished={isPublished}
                slug={id && id !== "new" ? forms.find((f) => f.id === id)?.slug : undefined}
                onIsPublishedChange={setIsPublished}
                onOpenForm={() => {
                    setShowPublishDialog(false)
                    const slug = id && id !== "new" ? forms.find((f) => f.id === id)?.slug : "form-slug"
                    navigate(`/form/${slug}`)
                }}
            />

            <AddPageDialog
                open={showAddPageDialog}
                onOpenChange={setShowAddPageDialog}
                id={id}
                pagesLength={pages.length}
                onAddPage={addPage}
                onShowSaveStatus={showSaveStatus}
            />
        </div >
    )
}
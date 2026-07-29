import { Outlet } from "react-router-dom";
import { FormBuilderTopBar } from "../../pages/FormBuilder/components/FormBuilderTopBar";

export function FormLayout() {
    // TODO: These props will need to be wired up with actual state
    const mockProps = {
        isPublished: false,
        saveStatus: "idle" as const,
        onPreview: () => console.log("Preview"),
        onPublish: () => console.log("Publish"),
        onPublishedClick: () => console.log("Published Click"),
        onBack: () => console.log("Back"),
    };

    return (
        <div className="flex flex-col h-screen">
            <FormBuilderTopBar {...mockProps} />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}

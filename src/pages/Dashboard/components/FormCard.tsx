import { useNavigate } from "react-router-dom";
import { FileText, Eye, BarChart3, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Form } from "@/entities/form/model/types";

interface FormCardProps {
    form: Form;
    onDeleteClick: (formId: string) => void;
}

export function FormCard({ form, onDeleteClick }: FormCardProps) {
    const navigate = useNavigate();

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg"
            onClick={() => navigate(`/form-builder/${form.id}`)}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg font-semibold">
                        {form.title}
                    </CardTitle>
                    <Badge
                        variant={
                            form.status === "published"
                                ? "default"
                                : form.status === "draft"
                                    ? "secondary"
                                    : "outline"
                        }
                        className="whitespace-nowrap"
                    >
                        {form.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
                <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>{form.fields?.length || 0} pages</span>
                    <span>•</span>
                    <span>{form.responses_count || 0} responses</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<span />}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/form-response/${form.id}/submissions`)}>
                            <BarChart3 className="h-4 w-4" />
                            <span>View Responses</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/form-response/${form.id}/analytics`)}>
                            <BarChart3 className="h-4 w-4" />
                            <span>Form Analytics</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/form-settings/${form.id}`)}>
                            <FileText className="h-4 w-4" />
                            <span>Form Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/form-share/${form.id}`)}>
                            <Eye className="h-4 w-4" />
                            <span>Form Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/form-integrate/${form.id}`)}>
                            <FileText className="h-4 w-4" />
                            <span>Form Integrations</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <FileText className="h-4 w-4" />
                            <span>Duplicate Form</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4" />
                            <span>Resubmissions</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Eye className="h-4 w-4" />
                            <span>Theme</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Eye className="h-4 w-4" />
                            <span>Translations</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <FileText className="h-4 w-4" />
                            <span>Export Responses</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(form.id);
                            }}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Delete Form</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}
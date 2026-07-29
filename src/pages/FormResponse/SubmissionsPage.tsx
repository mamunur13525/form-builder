import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Download, FileText, BarChart3, Activity } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table"
import { motion } from "motion/react"
import { useForm } from "../../features/forms/hooks/useForms"
import { useResponses } from "../../features/forms/hooks/useFormResponses"
import { adaptApiForm, adaptApiResponse } from "../../features/forms/model/adapters"
import type { Form as CommonForm } from "../../shared/types/common"

export function SubmissionsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const { data: apiForm, isLoading: formLoading } = useForm(id || "")
    const { data: apiResponses = [], isLoading: responsesLoading } = useResponses(id || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const formResponses = apiResponses.map(adaptApiResponse)
    const isLoading = formLoading || responsesLoading

    if (!form) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Form not found</h2>
                <Button className="mt-4" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const getCurrentTab = () => {
        if (location.pathname.includes("/summary")) return "summary"
        if (location.pathname.includes("/analytics")) return "analytics"
        return "submissions"
    }

    const currentTab = getCurrentTab()

    return (
        <div className="w-full h-full flex flex-col bg-background border rounded-md overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-sm font-bold">Submissions</h1>
                        <p className="text-[11px] text-muted-foreground">{formResponses.length} total responses</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b px-2">
                <Tabs defaultValue="overview" className="w-[400px]">
                    <TabsList className="bg-transparent h-9">
                        <TabsTrigger
                            value="submissions"
                            className="text-xs gap-1.5 h-7"
                            onClick={() => navigate(`/form-response/${id}/submissions`)}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Submissions
                        </TabsTrigger>
                        <TabsTrigger
                            value="summary"
                            className="text-xs gap-1.5 h-7"
                            onClick={() => navigate(`/form-response/${id}/summary`)}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="text-xs gap-1.5 h-7"
                            onClick={() => navigate(`/form-response/${id}/analytics`)}
                        >
                            <Activity className="h-3.5 w-3.5" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
                {formResponses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card>
                            <CardContent className="text-center py-12">
                                <p className="text-muted-foreground">No responses yet</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => navigate(`/form-preview/${form.id}`)}
                                >
                                    Share Form
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-md border"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Response ID</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    {form.fields.slice(0, 4).map((field) => (
                                        <TableHead key={field.fieldKey}>{field.label}</TableHead>
                                    ))}
                                    {form.fields.length > 4 && (
                                        <TableHead className="text-right">More</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formResponses.map((response, index) => (
                                    <motion.tr
                                        key={response._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-muted/50 cursor-pointer"
                                    >
                                        <TableCell className="font-medium">
                                            #{response._id?.slice(-4)}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(response.submittedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                        {form.fields.slice(0, 4).map((field) => {
                                            const answer = response.answers.find((a) => a.fieldKey === field.fieldKey)
                                            return (
                                                <TableCell key={field.fieldKey}>
                                                    {answer ? (
                                                        Array.isArray(answer.value)
                                                            ? answer.value.join(", ")
                                                            : String(answer.value)
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                        {form.fields.length > 4 && (
                                            <TableCell className="text-right text-muted-foreground">
                                                +{form.fields.length - 4} more
                                            </TableCell>
                                        )}
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
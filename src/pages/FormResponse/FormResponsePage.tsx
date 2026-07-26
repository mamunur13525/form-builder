import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
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
import { useFields } from "../../features/forms/hooks/useFormFields"
import { useResponses } from "../../features/forms/hooks/useFormResponses"
import { adaptApiForm, adaptApiResponse } from "../../features/forms/model/adapters"

export function FormResponsePage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: apiForm, isLoading: formLoading } = useForm(id || "")
    const { data: apiFields = [] } = useFields(id || "")
    const { data: apiResponses = [], isLoading: responsesLoading } = useResponses(id || "")

    const form = apiForm ? adaptApiForm(apiForm, apiFields) : null
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

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{form.title}</h1>
                    <p className="text-muted-foreground">{formResponses.length} total responses</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </motion.div>

            {isLoading ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">Loading responses...</p>
                    </CardContent>
                </Card>
            ) : formResponses.length === 0 ? (
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
                                onClick={() => navigate(`/form-preview/${form._id}`)}
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
    )
}

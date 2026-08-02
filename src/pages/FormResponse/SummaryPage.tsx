import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, BarChart3, Activity } from "lucide-react"
import { Button } from "../../components/ui/button"
import { motion } from "motion/react"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useForm } from "../../features/forms/hooks/useForms"
import { useResponseSummary } from "../../features/forms/hooks/useFormResponses"
import { adaptApiForm } from "../../features/forms/model/adapters"
import type { Form as CommonForm } from "../../shared/types/common"

export function SummaryPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: apiForm, isLoading: formLoading } = useForm(id || "")
    const { data: summaryData, isLoading: summaryLoading } = useResponseSummary(id || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const isLoading = formLoading || summaryLoading

    if (!form) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">Form not found</h2>
            </div>
        )
    }

    const totalResponses = summaryData?.totalResponses || 0
    const fields = summaryData?.fields || []

    return (
        <div className="w-full h-full flex flex-col bg-background border rounded-md overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">Summary</h1>
                        <p className="text-base text-muted-foreground">Overview of your form responses</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b px-2">
                <Tabs defaultValue="overview" className="w-[400px]">
                    <TabsList className="bg-transparent h-9">
                        <TabsTrigger
                            value="submissions"
                            className="text-sm gap-1.5 h-7"
                            onClick={() => navigate(`/form-response/${id}/submissions`)}
                        >
                            <FileText className="h-4 w-4" />
                            Submissions
                        </TabsTrigger>
                        <TabsTrigger
                            value="summary"
                            className="text-sm gap-1.5 h-7"
                            onClick={() => navigate(`/form-response/${id}/summary`)}
                        >
                            <BarChart3 className="h-4 w-4" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="text-sm gap-1.5 h-7"
                            onClick={() => navigate(`/form-response/${id}/analytics`)}
                        >
                            <Activity className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
                {isLoading ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-base text-muted-foreground">Loading summary...</p>
                        </CardContent>
                    </Card>
                ) : totalResponses === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-base text-muted-foreground">No responses yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                                        <p className="text-3xl font-bold">{totalResponses}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Total Fields</p>
                                        <p className="text-3xl font-bold">{form.fields.length}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Unique Answers</p>
                                        <p className="text-3xl font-bold">
                                            {fields.reduce((acc, field) => acc + field.uniqueAnswers, 0)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {fields.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Response Breakdown</h3>
                                <div className="grid gap-4">
                                    {fields.map((field, index) => {
                                        const percentage = totalResponses > 0 ? (field.answerCount / totalResponses) * 100 : 0
                                        return (
                                            <motion.div
                                                key={field.fieldKey}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card>
                                                    <CardContent className="pt-6">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="font-medium">{field.label}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {field.type}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium">{field.answerCount}/{totalResponses}</p>
                                                                    <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-secondary rounded-full h-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percentage}%` }}
                                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                                    className="bg-primary h-2 rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
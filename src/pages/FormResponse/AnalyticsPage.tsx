import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, BarChart3, Activity } from "lucide-react"
import { Button } from "../../components/ui/button"
import { motion } from "motion/react"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useForm } from "../../features/forms/hooks/useForms"
import { useResponseStats } from "../../features/forms/hooks/useFormResponses"
import { adaptApiForm } from "../../features/forms/model/adapters"
import type { Form as CommonForm } from "../../shared/types/common"

export function AnalyticsPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: apiForm, isLoading: formLoading } = useForm(id || "")
    const { data: stats, isLoading: statsLoading } = useResponseStats(id || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const isLoading = formLoading || statsLoading

    if (!form) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">Form not found</h2>
            </div>
        )
    }

    const totalResponses = stats?.totalResponses || 0
    const uniqueRespondents = stats?.uniqueRespondents || 0
    const todayResponses = stats?.todayResponses || 0
    const avgCompletionTime = stats?.averageCompletionTime || 0
    const completionRate = stats?.completionRate || 0

    return (
        <div className="w-full h-full flex flex-col bg-background border rounded-md overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">Analytics</h1>
                        <p className="text-base text-muted-foreground">Detailed insights and statistics</p>
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
                            <p className="text-base text-muted-foreground">Loading analytics...</p>
                        </CardContent>
                    </Card>
                ) : totalResponses === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-base text-muted-foreground">No data available yet. Share your form to start collecting responses.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Overview Stats */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">Total Responses</p>
                                        <p className="text-3xl font-bold">{totalResponses}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">Unique Respondents</p>
                                        <p className="text-3xl font-bold">{uniqueRespondents}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">Today's Responses</p>
                                        <p className="text-3xl font-bold">{todayResponses}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">Completion Rate</p>
                                        <p className="text-3xl font-bold">{completionRate}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">Avg. Completion Time</p>
                                        <p className="text-2xl font-bold">{avgCompletionTime}s</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">Total Fields</p>
                                        <p className="text-2xl font-bold">{form.fields.length}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
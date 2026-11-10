import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { TestResult } from "../services/integrationService"

/** Green/red banner shown after "Test Connection". */
export function IntegrationTestResult({ testResult }: { testResult: TestResult }) {
    return (
        <div
            className={`flex items-start gap-3 rounded-lg p-3.5 text-xs sm:text-sm border ${
                testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
            }`}
        >
            {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
            ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            )}
            <div className="flex-1">
                <p className="font-semibold">{testResult.success ? "Success" : "Test Failed"}</p>
                <p className="mt-0.5 opacity-90">{testResult.message}</p>
            </div>
        </div>
    )
}

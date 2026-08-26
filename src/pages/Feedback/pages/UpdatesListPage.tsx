import { useUpdates } from "../hooks"
import { ProductActivity, UpdateCard } from "../components"

function UpdateSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="h-44 w-full animate-pulse bg-gray-100" />
            <div className="space-y-2 p-5">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
        </div>
    )
}

export function UpdatesListPage() {
    const { data: updates, isLoading, isError } = useUpdates()

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            <div className="flex flex-col gap-8 lg:flex-row">
                <main className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">What's new</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Product updates, improvements, and fixes.
                    </p>

                    <div className="mt-6 flex flex-col gap-6">
                        {isLoading ? (
                            <>
                                <UpdateSkeleton />
                                <UpdateSkeleton />
                            </>
                        ) : isError ? (
                            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                                Something went wrong loading updates. Please try again.
                            </div>
                        ) : (updates ?? []).length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                                <p className="text-sm font-medium text-gray-900">No updates yet</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Check back soon for product news and improvements.
                                </p>
                            </div>
                        ) : (
                            (updates ?? []).map((u) => <UpdateCard key={u.id} update={u} />)
                        )}
                    </div>
                </main>

                <aside className="w-full shrink-0 lg:w-72">
                    <ProductActivity />
                </aside>
            </div>
        </div>
    )
}

/** Right column placeholder shown when no page or end page is selected. */
export function EmptySettingsState() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141418] text-slate-800 dark:text-zinc-100">
      <div className="border-b border-slate-200/80 dark:border-zinc-800/80 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Page settings
        </h3>
      </div>
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm leading-6 text-slate-500 dark:text-zinc-500">
          Select a page to view its settings.
        </p>
      </div>
    </div>
  );
}

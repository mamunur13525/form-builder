import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Drawer } from "@/components/ui/drawer";

interface BuilderWorkspaceProps {
  isDesktop: boolean;
  sidebar: ReactNode;
  canvas: ReactNode;
  settings: ReactNode;
  pagesDrawerOpen: boolean;
  onPagesDrawerOpenChange: (open: boolean) => void;
  settingsDrawerOpen: boolean;
  onSettingsDrawerOpenChange: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Three-panel desktop layout with compact-layout drawers for the page list and
 * settings. Panel contents are passed in so the workspace itself never has to
 * know about builder state.
 */
export function BuilderWorkspace({
  isDesktop,
  sidebar,
  canvas,
  settings,
  pagesDrawerOpen,
  onPagesDrawerOpenChange,
  settingsDrawerOpen,
  onSettingsDrawerOpenChange,
  children,
}: BuilderWorkspaceProps) {
  return (
    <div className="editorial h-full flex bg-[var(--editorial-canvas)] text-[var(--foreground)]">
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {isDesktop ? (
          <ResizablePanelGroup
            orientation="horizontal"
            className="mx-auto w-full flex-1 min-h-0"
          >
            <ResizablePanel defaultSize={280} minSize={240} maxSize={380}>
              {sidebar}
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-transparent hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 transition-colors after:hidden" />

            <ResizablePanel defaultSize={600} minSize={300} className="bg-transparent">
              {canvas}
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-transparent hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 transition-colors after:hidden" />

            <ResizablePanel defaultSize={340} minSize={300} maxSize={420}>
              {settings}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col">{canvas}</div>

            <Drawer
              open={pagesDrawerOpen}
              onOpenChange={onPagesDrawerOpenChange}
              side="left"
              title="Pages"
            >
              {sidebar}
            </Drawer>

            <Drawer
              open={settingsDrawerOpen}
              onOpenChange={onSettingsDrawerOpenChange}
              side="right"
              title="Settings"
            >
              {settings}
            </Drawer>
          </>
        )}
      </div>

      {children}
    </div>
  );
}

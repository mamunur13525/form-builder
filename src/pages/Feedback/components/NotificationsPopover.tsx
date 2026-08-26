import { Bell, BellOff } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function NotificationsPopover() {
    return (
        <Popover>
            <PopoverTrigger
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 outline-none hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-[#f2542d]/40"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 items-stretch gap-0 bg-white p-0 text-gray-700"
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">Notifications</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <BellOff className="h-6 w-6" />
                    </span>
                    <p className="text-sm font-medium text-gray-900">Hmm, nothing here!</p>
                    <p className="text-xs text-gray-500">
                        We'll let you know when there's activity on your posts.
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    )
}

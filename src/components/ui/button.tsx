import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-3 rounded-xl border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[22px] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border border-[#FF5722]/80 bg-[#FF5722] hover:bg-[#F4511E] text-white shadow-[0_2px_10px_rgba(255,87,34,0.25)] font-medium active:scale-[0.98] transition-all",
        outline:
          "rounded-xl bg-white dark:bg-[#18181c] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all cursor-pointer shadow-xs",
        secondary:
          "bg-slate-100 dark:bg-[#1a1a20] text-slate-800 dark:text-zinc-200 hover:bg-slate-200/80 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80 active:scale-[0.98] transition-all",
        ghost:
          "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all aria-expanded:bg-slate-100 dark:aria-expanded:bg-zinc-800/60 aria-expanded:text-slate-900 dark:aria-expanded:text-white",
        destructive:
          "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 focus-visible:border-red-500/40 focus-visible:ring-red-500/20",
        link: "text-[#FF5722] hover:text-[#FF7043] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
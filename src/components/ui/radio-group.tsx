import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-input shadow-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center after:size-2 after:rounded-full after:bg-primary data-unchecked:hidden translate-y-[3px] "
      />
    </RadioPrimitive.Root>
  )
}

/**
 * A selectable tile for icon-led radio groups, e.g. alignment or size pickers.
 * Unlike `RadioGroupItem` it has no dot indicator: the tile itself is the
 * affordance, so the icon and label stay legible at small sizes.
 */
function RadioGroupCard({ className, children, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-card"
      className={cn(
        "group/radio-card relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border border-transparent bg-transparent px-2 py-3 text-[11px] leading-none font-medium tracking-[0.01em] text-muted-foreground transition-[color,background-color,border-color,box-shadow,transform] duration-200 outline-none select-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 data-checked:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupCard }

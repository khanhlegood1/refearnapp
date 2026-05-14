"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type SwitchFieldProps = {
  control: any
  name: string
  label: string
  description?: string
  disabled?: boolean
  premiumBadge?: string
  className?: string
}

export const SwitchField = ({
  control,
  name,
  label,
  description,
  disabled = false,
  premiumBadge,
  className,
}: SwitchFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border p-4 transition-colors",
            disabled ? "bg-muted/30 opacity-80" : "bg-card",
            className
          )}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-base cursor-pointer">{label}</FormLabel>
            {description && (
              <FormDescription className="max-w-[80%]">
                {description}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <div className="flex flex-col items-end gap-2">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
              {disabled && premiumBadge && (
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse">
                  {premiumBadge}
                </span>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

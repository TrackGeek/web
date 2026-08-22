import { Tooltip as TooltipPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipToggleContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ open, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);

  const isOpen = open ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolledOpen(next);

      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const toggleContext = React.useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen]);

  return (
    <TooltipToggleContext.Provider value={toggleContext}>
      <TooltipPrimitive.Root data-slot="tooltip" open={isOpen} onOpenChange={setOpen} {...props} />
    </TooltipToggleContext.Provider>
  );
}

function TooltipTrigger({ onPointerDown, onClick, ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const toggle = React.useContext(TooltipToggleContext);
  const isTouchRef = React.useRef(false);

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onPointerDown={(event) => {
        onPointerDown?.(event);

        isTouchRef.current = event.pointerType !== "mouse";

        if (isTouchRef.current) event.preventDefault();
      }}
      onClick={(event) => {
        onClick?.(event);

        if (!isTouchRef.current || !toggle) return;

        event.preventDefault();

        toggle.setOpen(!toggle.open);
      }}
      {...props}
    />
  );
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-muted border border-border text-card-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}

        <TooltipPrimitive.Arrow className="bg-foreground fill-border z-50 size-2.5 translate-y-[calc(-1px)] rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

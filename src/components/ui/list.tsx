import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface ListProps {
  active?: boolean;
  name: string;
  className?: string;
}

function List({ className, active = false, name }: ListProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 justify-between p-1 px-3 rounded-xl cursor-pointer hover:bg-primary/40 text-sm",
        active && "bg-primary/30",
        className,
      )}
    >
      <p>{name}</p>
      {active && <Icon icon={"lucide:check"} className={"size-3.5"} />}
    </div>
  );
}

export { List };

import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    props.onInput?.(event); // preserve user's onInput
  };

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, []);

  return (
    <textarea
      data-slot="textarea"
      ref={ref}
      onInput={handleInput}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-12 w-full rounded-md bg-transparent px-2 lg:text-lg py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-silver/20 scrollbar-track-transparent ",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

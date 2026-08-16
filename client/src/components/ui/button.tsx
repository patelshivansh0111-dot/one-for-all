import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4267ff]/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer border-[1.5px] border-[#111]",
  {
    variants: {
      variant: {
        default:
          "bg-[#111] text-[#F5F0E8] shadow-[3px_3px_0_#111] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111]",
        secondary:
          "bg-[#FFD34E] text-[#111] shadow-[3px_3px_0_#111] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111]",
        outline: "bg-transparent text-[#111] hover:bg-white",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-[#ebe4d8]",
        blue: "bg-[#4267FF] text-white shadow-[3px_3px_0_#111] hover:-translate-y-0.5",
        pink: "bg-[#E83E8C] text-white shadow-[3px_3px_0_#111] hover:-translate-y-0.5",
        mint: "bg-[#63D1B5] text-[#111] shadow-[3px_3px_0_#111] hover:-translate-y-0.5",
        soft: "bg-white text-[#111] shadow-[2px_2px_0_#111] hover:bg-[#fffdf8]",
      },
      size: {
        default: "h-11 rounded-full px-5",
        sm: "h-9 rounded-full px-4 text-[10px]",
        lg: "h-12 rounded-full px-7 text-sm",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

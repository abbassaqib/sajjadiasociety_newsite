import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      default: "",
      meta: "text-muted-foreground text-xs md:text-sm",
      button:
        "text-xs   sm:text-sm whitespace-normal text-center font-semibold",
      subheading: "text-lg md:text-xl text-foreground font-normal",
      heading: "text-xl   md:text-2xl ",
      display: "text-xl font-bold  md:text-2xl",
      displayLG: "text-xl md:text-3xl  font-bold",
      sermonHeading: "text-3xl font-bold  sm:text-5xl",
      displayXL: "text-5xl font-bold  sm:text-7xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type StyledTextProps<Tag extends ElementType> = {
  as?: Tag;
  variant?: VariantProps<typeof textVariants>["variant"];
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<Tag>, "as" | "variant">;

const StyledText = <Tag extends ElementType = "p">({
  as = "p" as unknown as Tag,
  className,
  variant,
  children,
  ...props
}: StyledTextProps<Tag>) => {
  const Tag = as as ElementType;
  return (
    <Tag className={cn(textVariants({ variant, className }))} {...props}>
      {children}
    </Tag>
  );
};

export default StyledText;

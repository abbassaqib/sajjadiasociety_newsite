import * as React from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isCurrentPath } from "@/data/navigation";

interface NavMenuProps extends React.HTMLAttributes<HTMLElement> {
  /** Astro.url.pathname, passed from Header.astro */
  currentPath?: string;
}

const NavMenu = ({ currentPath, className, ...props }: NavMenuProps) => {
  return (
    <nav aria-label="Main" className={className} {...props}>
      {NAV_ITEMS.map((item) => {
        const current = isCurrentPath(item, currentPath);
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-semibold transition-colors xl:text-base",
              "hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              current
                ? "text-foreground after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
};

export default NavMenu;

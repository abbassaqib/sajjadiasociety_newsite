import * as React from "react";
import { Menu, X } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Our Story", href: "/our-story" },
  { label: "News & Events", href: "/news-events" },
  { label: "Support Us", href: "/donate" },
];

interface SidebarProps {
  /** Optional: pass Astro.url.pathname from Header.astro to highlight the current page */
  currentPath?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const isCurrent = (href: string) =>
    !!currentPath && (href === "/" ? currentPath === "/" : currentPath.startsWith(href));

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      {/* Opens the menu. Hidden behind the drawer once it's open. */}
      <DrawerTrigger
        aria-label="Open menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <Menu size={26} aria-hidden="true" />
      </DrawerTrigger>

      <DrawerOverlay className="lg:hidden" />

      <DrawerContent className="flex h-full w-72 flex-col gap-6 bg-background p-5 lg:hidden">
        <div className="flex items-center justify-between">
          <DrawerTitle className="font-serif text-2xl text-foreground">Menu</DrawerTitle>
          {/* Closes the menu — Esc and tapping outside also work */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <DrawerDescription className="sr-only">Site navigation links</DrawerDescription>

        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const current = isCurrent(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={current ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current && "bg-accent"
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
};

export default Sidebar;

import { Spin as Hamburger } from "hamburger-react";
import * as React from "react";

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
  { label: "Donate", href: "/donate", sectionId: "", isDonate: true },
  { label: "News & Events", href: "/news-events", sectionId: "news-events", isDonate: false },
  { label: "About Us", href: "/about-us", sectionId: "about", isDonate: false }
];

interface SidebarProps {
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isHomepage = currentPath === "/";

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
    isDonate: boolean
  ) => {
    if (isHomepage && sectionId && !isDonate) {
      e.preventDefault();
      setIsOpen(false);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 450);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right" modal>
        <DrawerTrigger
          className="focus-visible:border-ring focus-visible:ring-ring z-100 outline-none focus-visible:ring-2 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Hamburger
            toggled={isOpen}
            color="var(--sidebar-foreground)"
            size={24}
            label="Button to open sidebar menu"
          />
        </DrawerTrigger>

        <DrawerOverlay className="lg:hidden" />

        <DrawerContent className="lg:hidden h-full w-72 bg-background p-6 flex flex-col gap-6">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          <DrawerDescription className="sr-only">Site navigation links</DrawerDescription>

          <nav className="flex flex-col gap-2 mt-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.isDonate ? item.href : (isHomepage && item.sectionId ? "/" : item.href)}
                onClick={(e) => handleClick(e, item.sectionId, item.isDonate)}
                className={cn(
                  "rounded-md px-4 py-3 text-base font-semibold tracking-widest uppercase transition-colors",
                  item.isDonate
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 text-center"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
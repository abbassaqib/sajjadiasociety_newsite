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

const NAV_ITEMS = [
  { label: "Donate", href: "/donate" },
  { label: "News & Events", href: "/news-events" },
  { label: "About Us", href: "/about-us" },
];

interface SidebarProps {
  
}

const Sidebar: React.FC<SidebarProps> = () => {
  const [isOpen, setIsOpen] = React.useState(false);

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
                href={item.href}
                className="rounded-md px-4 py-3 text-base font-semibold tracking-widest uppercase transition-colors text-foreground hover:bg-muted"
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
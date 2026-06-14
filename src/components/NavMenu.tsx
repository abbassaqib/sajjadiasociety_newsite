import * as React from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Donate", href: "/donate", sectionId: "", isDonate: true },
  { label: "News & Events", href: "/news-events", sectionId: "news-events", isDonate: false },
  { label: "About Us", href: "/about-us", sectionId: "about", isDonate: false },
  { label: "FAQ", href: "/about-us/faq", sectionId: "faq", isDonate: false },
];

interface NavMenuProps extends React.HTMLAttributes<HTMLElement> {
  currentPath: string;
}

const NavMenu = ({ currentPath, ...props }: NavMenuProps) => {
  const isHomepage = currentPath === "/";

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
    isDonate: boolean
  ) => {
    if (isHomepage && sectionId && !isDonate) {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav {...props}>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.label}
          href={
            isHomepage && item.sectionId && !item.isDonate
              ? `#${item.sectionId}`
              : item.href
          }
          onClick={(e) => handleClick(e, item.sectionId, item.isDonate)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium tracking-widest uppercase xl:text-base transition-colors",
            item.isDonate
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export default NavMenu;
import * as React from "react";

const NAV_ITEMS = [
  { label: "Donate", href: "/donate" },
  { label: "News & Events", href: "/news-events" },
  { label: "About Us", href: "/about-us" },
];

interface NavMenuProps extends React.HTMLAttributes<HTMLElement> {
  
}

const NavMenu = ({ ...props }: NavMenuProps) => {
  return (
    <nav {...props}>
      {NAV_ITEMS.map((item) => (
        <a key={item.label} href={item.href} 
          className="rounded-md px-3 py-2 text-sm font-medium tracking-widest uppercase xl:text-base transition-colors hover:bg-accent hover:text-accent-foreground">
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export default NavMenu;
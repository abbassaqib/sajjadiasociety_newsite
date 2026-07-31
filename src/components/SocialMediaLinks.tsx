import { Icon } from "@iconify/react";
import * as React from "react";

interface SocialLink {
  name?: string;
  link?: string;
  icon?: string;
  hint?: string;
}

interface SocialMediaLinksProps {
  social: SocialLink[];
  showLabels?: boolean;
}

const iconSizeMap: Record<string, string> = {
  "simple-icons:facebook": "text-[#1877F2]",
  "simple-icons:youtube":  "text-[#FF0000]",
  "simple-icons:instagram": "text-[#E1306C]",
  "simple-icons:x":        "text-foreground",
  "simple-icons:whatsapp": "text-[#25D366]",
};

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  social,
  showLabels = false,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {social.map(({ name = "", link = "", icon = "" }) => {
        const brandColor = iconSizeMap[icon] ?? "text-sidebar-foreground";
        return (
          <a
            key={name}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit our ${name} page`}
            className="group flex items-center gap-2 rounded-xl bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 px-4 py-2.5 transition-all duration-200"
          >
            <span className={`text-2xl ${brandColor} transition-transform duration-200 group-hover:scale-110`}>
              <Icon icon={icon} />
            </span>
            <span className="text-sm font-medium text-sidebar-foreground/80 group-hover:text-sidebar-foreground transition-colors">
              {name}
            </span>
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaLinks;
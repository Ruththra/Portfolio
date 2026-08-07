import Link from "next/link";
import {
  FileText,
  Folder,
  Gauge,
  ImageIcon,
  LayoutTemplate,
  Library,
  Settings,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
const links = [
  { href: "/manage", label: "Overview", icon: Gauge },
  { href: "/manage/blogs", label: "Blogs", icon: FileText },
  { href: "/manage/projects", label: "Projects", icon: Folder },
  { href: "/manage/content", label: "Content", icon: LayoutTemplate },
  { href: "/manage/media", label: "Media", icon: ImageIcon },
  { href: "/manage/resume", label: "Resume", icon: Library },
  { href: "/manage/settings", label: "Settings", icon: Settings },
];
export function ManageNav() {
  return (
    <aside className="manage-sidebar">
      <Link href="/manage" className="manage-brand">
        RS <span>Studio</span>
      </Link>
      <nav aria-label="Management navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link className="manage-link" href={href} key={href}>
            <Icon aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <LogoutButton />
    </aside>
  );
}

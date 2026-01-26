"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Layout.module.css";
import { LayoutDashboard, Briefcase, FileText, Mail, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function Sidebar({ isOpen, onToggle }: { isOpen?: boolean, onToggle?: () => void }) {
    const pathname = usePathname();

    const sections = [
        {
            title: "Main",
            items: [
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/matters", label: "Matters", icon: Briefcase },
            ]
        },
        {
            title: "Management",
            items: [
                { href: "/notes", label: "Quick Notes", icon: FileText },
                { href: "/outbox", label: "Email Outbox", icon: Mail },
            ]
        }
    ];

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <img src="/logo.png" alt="Logo" width={32} height={32} />
                </div>
                <span>Work Tracker AI</span>
            </div>

            <nav className={styles.nav}>
                {sections.map((section, idx) => (
                    <div key={idx}>
                        <div className={styles.navSection}>{section.title}</div>
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                                    aria-current={isActive ? "page" : undefined}
                                    onClick={onToggle}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                <div className={styles.navSection}>System</div>
            <Link
                href="/settings"
                className={`${styles.navLink} ${pathname === "/settings" ? styles.active : ""}`}
                aria-current={pathname === "/settings" ? "page" : undefined}
                onClick={onToggle}
            >
                    <Settings size={18} />
                    Settings
                </Link>
            </nav>

            <div className={styles.userSection}>
                <UserButton afterSignOutUrl="/" showName />
            </div>
        </aside>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Layout.module.css";
import { LayoutDashboard, Briefcase, FileText, Mail, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/matters", label: "Matters", icon: Briefcase },
        { href: "/notes", label: "Quick Notes", icon: FileText },
        { href: "/outbox", label: "Email Outbox", icon: Mail },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <img src="/logo.png" alt="Work Tracker AI" className={styles.logoImg} width={32} height={32} />
                <span>Work Tracker AI</span>
            </div>
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div style={{ marginTop: "auto", padding: "12px" }}>
                <UserButton afterSignOutUrl="/" showName />
            </div>
        </aside>
    );
}

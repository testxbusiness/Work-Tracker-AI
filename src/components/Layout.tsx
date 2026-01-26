"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import styles from "./Layout.module.css";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return <main>{children}</main>;
    }

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
            <button
                className={`${styles.overlay} ${sidebarOpen ? styles.overlayOpen : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
                type="button"
            />

            <div className={styles.mainWrapper}>
                <header className={styles.topBar}>
                    <div className={styles.mobileHeader}>
                        <button
                            className={styles.iconBtn}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Open navigation"
                        >
                            <Menu size={20} />
                        </button>
                        <div className={styles.logo} style={{ marginBottom: 0, padding: 0 }}>
                            <div className={styles.logoIcon}>
                                <img src="/logo.png" alt="Logo" width={32} height={32} />
                            </div>
                        </div>
                    </div>

                    {/* Search bar placeholder removed */}

                    <div className={styles.topBarActions}>
                        {/* Notification bell and user placeholders removed */}
                    </div>
                </header>

                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </div>
    );
}

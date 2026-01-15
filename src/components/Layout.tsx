"use client";

import { Sidebar } from "./Sidebar";
import styles from "./Layout.module.css";
import { usePathname } from "next/navigation";

export function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return <main>{children}</main>;
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}

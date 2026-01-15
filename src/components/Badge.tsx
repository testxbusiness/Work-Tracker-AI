import styles from "./Badge.module.css";

export function Badge({ children, type }: { children: React.ReactNode, type: string }) {
    return (
        <span className={`${styles.badge} ${styles[type] || styles.default}`}>
            {children}
        </span>
    );
}

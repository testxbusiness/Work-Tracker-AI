import styles from "./Badge.module.css";

export function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: string }) {
    return (
        <span className={`${styles.badge} ${styles[variant] || styles.default}`}>
            {children}
        </span>
    );
}

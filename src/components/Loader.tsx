import styles from "./Loader.module.css";
import { Loader2 } from "lucide-react";

export default function Loader({ size = 24, className = "" }: { size?: number; className?: string }) {
    return (
        <div className={`${styles.loaderWrapper} ${className}`}>
            <Loader2 size={size} className={styles.spinner} />
        </div>
    );
}

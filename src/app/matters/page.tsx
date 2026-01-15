"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./Matters.module.css";
import { Plus, Briefcase, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { useState } from "react";

export default function MattersPage() {
    const matters = useQuery(api.matters.list);
    const [search, setSearch] = useState("");

    if (matters === undefined) return <div className="p-8">Loading matters...</div>;

    const filteredMatters = matters.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.counterparty?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>All Matters</h1>
                    <p className="text-muted">Manage and track all your active cases.</p>
                </div>
                <Link href="/matters/new" className="button-primary">
                    <Plus size={18} /> New Matter
                </Link>
            </header>

            <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search by title or counterparty..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className={styles.grid}>
                {filteredMatters.map((matter) => (
                    <Link key={matter._id} href={`/matters/${matter._id}`} className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox}>
                                <Briefcase size={20} />
                            </div>
                            <div className={styles.badges}>
                                <Badge type={matter.priority}>{matter.priority}</Badge>
                                <Badge type={matter.status}>{matter.status}</Badge>
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{matter.title}</h3>
                            <p className={styles.type}>{matter.type}</p>
                            {matter.counterparty && (
                                <p className={styles.counterparty}>Vs. {matter.counterparty}</p>
                            )}
                        </div>
                        <div className={styles.cardFooter}>
                            <span>View Details</span>
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                ))}

                {filteredMatters.length === 0 && (search !== "") && (
                    <div className={styles.empty}>
                        No matters found matching "{search}"
                    </div>
                )}

                {matters.length === 0 && (
                    <div className={styles.empty}>
                        <Briefcase size={48} />
                        <p>No matters created yet.</p>
                        <Link href="/matters/new" className="text-primary">Create your first matter</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./page.module.css";
import { Plus, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const matters = useQuery(api.matters.list);

  if (matters === undefined) {
    return <div>Loading dashboard...</div>;
  }

  const activeMatters = matters.filter(m => m.status === "active");
  const onHoldMatters = matters.filter(m => m.status === "on-hold");

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Welcome back</h1>
          <p className="text-muted">Here's what's happening today.</p>
        </div>
        <Link href="/matters/new" className={styles.addButton}>
          <Plus size={20} />
          New Matter
        </Link>
      </header>

      <div className={styles.statsGrid}>
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
            <Clock size={20} />
            <span style={{ fontWeight: 600 }}>Active</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{activeMatters.length}</p>
        </div>
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '8px' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600 }}>On Hold</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{onHoldMatters.length}</p>
        </div>
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '8px' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontWeight: 600 }}>Recent</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{matters.length}</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2>Recent Matters</h2>
        <div className={styles.matterList}>
          {matters.slice(0, 5).map(matter => (
            <Link key={matter._id} href={`/matters/${matter._id}`} className={`${styles.matterCard} glass glass-hover`}>
              <div style={{ flex: 1 }}>
                <h3>{matter.title}</h3>
                <p className="text-muted">{matter.type} • {matter.counterparty || 'No counterparty'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`${styles.badge} ${styles[matter.priority]}`}>{matter.priority}</span>
              </div>
            </Link>
          ))}
          {matters.length === 0 && (
            <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              No matters found. Create one to get started.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

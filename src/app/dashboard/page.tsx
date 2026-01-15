"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./page.module.css";
import { Plus, Clock, AlertCircle, CheckCircle2, MoreHorizontal, FileText, Calendar, User, MousePointer2, PlusCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";

export default function Dashboard() {
  const matters = useQuery(api.matters.list);

  if (matters === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', height: '100%', gap: 12 }}>
        <Clock className="spin" size={20} />
        <span>Loading system overview...</span>
      </div>
    );
  }

  const activeMatters = matters.filter(m => m.status === "active");
  const onHoldMatters = matters.filter(m => m.status === "on-hold");

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1>System Overview</h1>
          <p className={styles.subtitle}>Recent legal management metrics and active cases.</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statsCard} glass`}>
          <div className={styles.statsHeader}>
            <span className={styles.statsTitle}>Active Cases Today</span>
            <div className={styles.statsIcon} style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
              <MousePointer2 size={18} />
            </div>
          </div>
          <p className={styles.statsValue}>{activeMatters.length}</p>
        </div>

        <div className={`${styles.statsCard} glass`}>
          <div className={styles.statsHeader}>
            <span className={styles.statsTitle}>Stalled Cases</span>
            <div className={styles.statsIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <p className={styles.statsValue}>{onHoldMatters.length}</p>
        </div>

        <div className={`${styles.statsCard} glass`}>
          <div className={styles.statsHeader}>
            <span className={styles.statsTitle}>Recently Updated</span>
            <div className={styles.statsIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Clock size={18} />
            </div>
          </div>
          <p className={styles.statsValue}>{matters.slice(0, 3).length}</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.mainSection}>
          <div className={styles.sectionHeader}>
            <h3>Recent Activities</h3>
            <Link href="/matters" className={styles.viewAll}>View All</Link>
          </div>

          <div className={styles.activityList}>
            {matters.length > 0 ? matters.slice(0, 4).map(matter => (
              <Link key={matter._id} href={`/matters/${matter._id}`} className={styles.activityItem}>
                <div className={styles.activityLabel}>
                  <FileText size={16} />
                  <span>{matter.title}</span>
                </div>
                <div className={styles.caseId}>LD-{matter._id.slice(0, 4).toUpperCase()}</div>
                <div className={styles.member}>
                  <div className={styles.avatar} />
                  <span>Legal Team</span>
                </div>
                <div>
                  <Badge variant={matter.status === 'active' ? 'success' : 'warning'}>
                    {matter.status.toUpperCase()}
                  </Badge>
                </div>
              </Link>
            )) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                No recent activity recorded.
              </div>
            )}
          </div>
        </section>

        <aside className={styles.sideBar}>
          <div className={`${styles.sideCard} glass`}>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/matters/new" className={styles.actionButton}>
                <PlusCircle size={18} />
                Start New Case
              </Link>
              <Link href="/notes" className={styles.secondaryAction}>
                <FileText size={18} />
                Log New Action
              </Link>
              <Link href="/dashboard" className={styles.secondaryAction}>
                <UploadCloud size={18} />
                Upload File
              </Link>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

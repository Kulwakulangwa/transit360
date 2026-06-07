import { useState } from 'react';
import { useStore } from './store';
import type { PageId } from './types';
import { Dashboard } from './pages/Dashboard';
import { Shipments } from './pages/Shipments';
import { Containers } from './pages/Containers';
import { Drivers } from './pages/Drivers';
import { Tracking } from './pages/Tracking';
import { Fleet } from './pages/Fleet';
import { GpsMonitor } from './pages/GpsMonitor';
import { Incidents } from './pages/Incidents';
import { Borders } from './pages/Borders';
import { PODs } from './pages/PODs';
import { Costs } from './pages/Costs';
import { Claims } from './pages/Claims';
import { Customers } from './pages/Customers';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Documents } from './pages/Documents';
import { Settings } from './pages/Settings';
import { ComingSoon } from './pages/ComingSoon';

interface NavItem {
  icon: string;
  label: string;
  id: PageId;
  badge?: (counts: BadgeCounts) => number;
  badgeColor?: string;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

interface BadgeCounts {
  delayed: number;
  openInc: number;
  pendingPods: number;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ icon: 'ti-layout-dashboard', label: 'Dashboard', id: 'dashboard' }],
  },
  {
    label: 'Operations',
    items: [
      { icon: 'ti-package', label: 'Shipments', id: 'shipments', badge: c => c.delayed, badgeColor: 'red' },
      { icon: 'ti-box', label: 'Containers', id: 'containers' },
      { icon: 'ti-truck', label: 'Fleet', id: 'fleet' },
      { icon: 'ti-id-badge', label: 'Drivers', id: 'drivers' },
      { icon: 'ti-map-pin', label: 'Tracking', id: 'tracking' },
      { icon: 'ti-satellite', label: 'GPS Monitor', id: 'gps' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { icon: 'ti-alert-triangle', label: 'Incidents', id: 'incidents', badge: c => c.openInc, badgeColor: 'red' },
      { icon: 'ti-ban', label: 'Borders', id: 'borders' },
      { icon: 'ti-file-check', label: 'PODs', id: 'pods', badge: c => c.pendingPods, badgeColor: 'amber' },
      { icon: 'ti-files', label: 'Documents', id: 'documents' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: 'ti-receipt', label: 'Costs', id: 'costs' },
      { icon: 'ti-shield-exclamation', label: 'Claims', id: 'claims' },
      { icon: 'ti-users', label: 'Customers', id: 'customers' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { icon: 'ti-chart-bar', label: 'Analytics', id: 'analytics' },
      { icon: 'ti-file-analytics', label: 'Reports', id: 'reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: 'ti-settings', label: 'Settings', id: 'settings' },
      { icon: 'ti-lock', label: 'Admin', id: 'admin' },
    ],
  },
];

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: 'Operations Command Center', shipments: 'Shipments', containers: 'Containers',
  fleet: 'Fleet', drivers: 'Drivers', tracking: 'Tracking', gps: 'GPS Monitor',
  incidents: 'Incidents', borders: 'Borders', pods: 'PODs', documents: 'Documents',
  costs: 'Costs', claims: 'Claims', customers: 'Customers', analytics: 'Analytics',
  reports: 'Reports', settings: 'Settings', admin: 'Admin',
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const { shipments, fleet, incidents, updateShipmentStatus, addShipment, addFleetUnit, resolveIncident, addIncident } = useStore();

  const delayed = shipments.filter(s => s.status === 'Delayed').length;
  const openInc = incidents.filter(i => !i.resolved).length;
  const pendingPods = shipments.filter(s => !s.podUploaded && s.status === 'Delivered').length;
  const badgeCounts: BadgeCounts = { delayed, openInc, pendingPods };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard shipments={shipments} fleet={fleet} incidents={incidents} onNavigate={(id) => setActivePage(id as PageId)} />;
      case 'shipments':
        return <Shipments shipments={shipments} onAdd={addShipment} onUpdateStatus={updateShipmentStatus} />;
      case 'containers':
        return <Containers />;
      case 'drivers':
        return <Drivers />;
      case 'tracking':
        return <Tracking />;
      case 'fleet':
        return <Fleet fleet={fleet} onAdd={addFleetUnit} />;
      case 'gps':
        return <GpsMonitor fleet={fleet} />;
      case 'incidents':
        return <Incidents incidents={incidents} onResolve={resolveIncident} onAdd={addIncident} />;
      case 'borders':
        return <Borders />;
      case 'pods':
        return <PODs />;
      case 'costs':
        return <Costs />;
      case 'claims':
        return <Claims />;
      case 'customers':
        return <Customers />;
      case 'analytics':
        return <Analytics shipments={shipments} />;
      case 'reports':
        return <Reports />;
      case 'documents':
        return <Documents />;
      case 'settings':
        return <Settings />;
      default:
        return <ComingSoon page={activePage} />;
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-56 min-w-[224px] bg-white border-r border-slate-200/70 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200/70">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
            <svg viewBox="0 0 15 15" fill="none" width="16" height="16">
              <path d="M2 11L6 4L9 8L11 6L13 11H2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-900 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Transit<span className="text-slate-500">360</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Logistics Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-5 pt-4 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const badgeCount = item.badge ? item.badge(badgeCounts) : 0;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`relative flex items-center gap-2.5 w-full px-5 py-2 text-[12.5px] text-left transition-all border-none outline-none ${
                      isActive
                        ? 'bg-slate-100/80 text-slate-900 font-medium'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-slate-800" />}
                    <i className={`ti ${item.icon} text-base flex-shrink-0 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          item.badgeColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-slate-200/70">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
            OP
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">Operations Lead</div>
            <div className="text-[10px] text-slate-400">Admin</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur border-b border-slate-200/70 px-8 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{PAGE_TITLES[activePage]}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500">{dateStr}</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <i className="ti ti-download text-sm" /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <i className="ti ti-refresh text-sm" /> Refresh
            </button>
            <button
              onClick={() => setActivePage('incidents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                openInc > 0
                  ? 'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                  : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <i className="ti ti-bell text-sm" />
              Alerts
              {openInc > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

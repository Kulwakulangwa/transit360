import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useShipments, useIncidents } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: '/auth' });
    return { user: data.user };
  },
  component: AppLayout,
});

interface NavItem { icon: string; label: string; path: string; badgeKey?: 'delayed' | 'openInc' | 'pendingPods'; badgeColor?: string; }
interface NavGroup { label: string | null; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ icon: 'ti-layout-dashboard', label: 'Dashboard', path: '/dashboard' }] },
  { label: 'Operations', items: [
    { icon: 'ti-package', label: 'Shipments', path: '/shipments', badgeKey: 'delayed', badgeColor: 'red' },
    { icon: 'ti-box', label: 'Containers', path: '/containers' },
    { icon: 'ti-truck', label: 'Fleet', path: '/fleet' },
    { icon: 'ti-id-badge', label: 'Drivers', path: '/drivers' },
    { icon: 'ti-map-pin', label: 'Tracking', path: '/tracking' },
    { icon: 'ti-satellite', label: 'GPS Monitor', path: '/gps' },
  ]},
  { label: 'Compliance', items: [
    { icon: 'ti-alert-triangle', label: 'Incidents', path: '/incidents', badgeKey: 'openInc', badgeColor: 'red' },
    { icon: 'ti-ban', label: 'Borders', path: '/borders' },
    { icon: 'ti-file-check', label: 'PODs', path: '/pods', badgeKey: 'pendingPods', badgeColor: 'amber' },
    { icon: 'ti-files', label: 'Documents', path: '/documents' },
  ]},
  { label: 'Finance', items: [
    { icon: 'ti-receipt', label: 'Costs', path: '/costs' },
    { icon: 'ti-shield-exclamation', label: 'Claims', path: '/claims' },
    { icon: 'ti-users', label: 'Customers', path: '/customers' },
  ]},
  { label: 'Intelligence', items: [
    { icon: 'ti-chart-bar', label: 'Analytics', path: '/analytics' },
    { icon: 'ti-file-analytics', label: 'Reports', path: '/reports' },
  ]},
  { label: 'System', items: [
    { icon: 'ti-settings', label: 'Settings', path: '/settings' },
    { icon: 'ti-lock', label: 'Admin', path: '/admin' },
  ]},
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Operations Command Center',
  '/shipments': 'Shipments', '/containers': 'Containers', '/fleet': 'Fleet',
  '/drivers': 'Drivers', '/tracking': 'Tracking', '/gps': 'GPS Monitor',
  '/incidents': 'Incidents', '/borders': 'Borders', '/pods': 'PODs',
  '/documents': 'Documents', '/costs': 'Costs', '/claims': 'Claims',
  '/customers': 'Customers', '/analytics': 'Analytics', '/reports': 'Reports',
  '/settings': 'Settings', '/admin': 'Admin',
};

function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const shipments = useShipments();
  const incidents = useIncidents();

  const badgeCounts = {
    delayed: shipments.filter(s => s.status === 'Delayed').length,
    openInc: incidents.filter(i => !i.resolved).length,
    pendingPods: shipments.filter(s => !s.podUploaded && s.status === 'Delivered').length,
  };

  const title = PAGE_TITLES[pathname] ?? 'Transit360';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: '/auth', replace: true });
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <aside className="w-56 min-w-[224px] bg-white border-r border-slate-200/70 flex flex-col h-full">
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

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-5 pt-4 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2.5 w-full px-5 py-2 text-[12.5px] text-left transition-all border-none outline-none ${
                      isActive ? 'bg-slate-100/80 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-slate-800" />}
                    <i className={`ti ${item.icon} text-base flex-shrink-0 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        item.badgeColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{badgeCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <button onClick={handleSignOut} className="flex items-center gap-2.5 px-4 py-3.5 border-t border-slate-200/70 hover:bg-slate-50 text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">OP</div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 truncate">Operations Lead</div>
            <div className="text-[10px] text-slate-400">Sign out</div>
          </div>
          <i className="ti ti-logout text-sm text-slate-400" />
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur border-b border-slate-200/70 px-8 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{title}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500">{dateStr}</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/incidents" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              badgeCounts.openInc > 0
                ? 'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900'
            }`}>
              <i className="ti ti-bell text-sm" /> Alerts
              {badgeCounts.openInc > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5" />}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

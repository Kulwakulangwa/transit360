import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Cost, Claim, Customer, POD, BorderCrossing } from '../types';

type ReportType =
  | 'financial-summary'
  | 'claims-analysis'
  | 'pod-compliance'
  | 'border-performance'
  | 'customer-ledger';

interface ReportMeta {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
}

const REPORTS: ReportMeta[] = [
  {
    id: 'financial-summary',
    title: 'Financial Summary',
    description: 'Revenue, cost breakdown, and payment status across all shipments',
    icon: 'ti-report-money',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  {
    id: 'claims-analysis',
    title: 'Claims Analysis',
    description: 'Claims by type, priority, status, and settlement rates',
    icon: 'ti-shield-exclamation',
    color: 'text-red-700',
    bg: 'bg-red-50',
  },
  {
    id: 'pod-compliance',
    title: 'POD Compliance',
    description: 'Proof of delivery upload and verification compliance rates',
    icon: 'ti-file-check',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    id: 'border-performance',
    title: 'Border Performance',
    description: 'Clearance times, hold rates, and fees by border crossing point',
    icon: 'ti-ban',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  {
    id: 'customer-ledger',
    title: 'Customer Ledger',
    description: 'Outstanding balances, credit usage, and account standing per customer',
    icon: 'ti-users',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
  },
];

const CURRENCIES = ['USD', 'TZS', 'KES'];

export function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('financial-summary');
  const [costs, setCosts] = useState<Cost[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pods, setPods] = useState<POD[]>([]);
  const [borders, setBorders] = useState<BorderCrossing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [c, cl, cu, p, b] = await Promise.all([
        supabase.from('costs').select('*'),
        supabase.from('claims').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('pods').select('*'),
        supabase.from('border_crossings').select('*'),
      ]);
      if (!c.error && c.data) setCosts(c.data as Cost[]);
      if (!cl.error && cl.data) setClaims(cl.data as Claim[]);
      if (!cu.error && cu.data) setCustomers(cu.data as Customer[]);
      if (!p.error && p.data) setPods(p.data as POD[]);
      if (!b.error && b.data) setBorders(b.data as BorderCrossing[]);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const meta = REPORTS.find(r => r.id === activeReport)!;

  return (
    <div className="flex h-full">
      {/* Left panel — report list */}
      <aside className="w-64 min-w-[256px] border-r border-gray-100 bg-white p-3 flex flex-col gap-1">
        <div className="px-1 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Available Reports</div>
        {REPORTS.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`w-full text-left rounded-xl p-3 transition-all border ${activeReport === r.id ? `${r.bg} border-transparent` : 'border-transparent hover:bg-gray-50'}`}
          >
            <div className="flex items-start gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${r.bg}`}>
                <i className={`ti ${r.icon} text-sm ${r.color}`} />
              </div>
              <div>
                <div className={`text-xs font-semibold ${activeReport === r.id ? r.color : 'text-gray-800'}`}>{r.title}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{r.description}</div>
              </div>
            </div>
          </button>
        ))}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">Display Currency</div>
          <div className="flex gap-1">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)} className={`flex-1 py-1 rounded-lg text-xs font-medium border transition-colors ${currency === c ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel — report content */}
      <main className="flex-1 overflow-y-auto p-5 bg-gray-50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg}`}>
              <i className={`ti ${meta.icon} text-base ${meta.color}`} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{meta.title}</div>
              <div className="text-xs text-gray-500">{meta.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-lg">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 bg-white hover:bg-gray-50 transition-colors">
              <i className="ti ti-download text-sm" /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <i className="ti ti-loader animate-spin text-base" /> Loading report data...
            </div>
          </div>
        ) : (
          <>
            {activeReport === 'financial-summary' && <FinancialSummary costs={costs} currency={currency} />}
            {activeReport === 'claims-analysis' && <ClaimsAnalysis claims={claims} />}
            {activeReport === 'pod-compliance' && <PODCompliance pods={pods} />}
            {activeReport === 'border-performance' && <BorderPerformance borders={borders} />}
            {activeReport === 'customer-ledger' && <CustomerLedger customers={customers} currency={currency} />}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-semibold" style={{ color: color || '#1a1a2e' }}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-5 first:mt-0">{children}</div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

// --- Financial Summary ---
function FinancialSummary({ costs, currency }: { costs: Cost[]; currency: string }) {
  const filtered = costs.filter(c => c.currency === currency || currency === 'USD');
  const total = costs.reduce((s, c) => s + Number(c.amount), 0);
  const paid = costs.filter(c => c.payment_status === 'Paid').reduce((s, c) => s + Number(c.amount), 0);
  const pending = costs.filter(c => c.payment_status === 'Pending').reduce((s, c) => s + Number(c.amount), 0);
  const disputed = costs.filter(c => c.payment_status === 'Disputed').reduce((s, c) => s + Number(c.amount), 0);

  const byCategory = Object.entries(
    costs.reduce((acc: Record<string, number>, c) => {
      acc[c.category] = (acc[c.category] || 0) + Number(c.amount);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const byPayment = [
    { label: 'Paid', amount: paid, color: '#2F9E44' },
    { label: 'Pending', amount: pending, color: '#F08C00' },
    { label: 'Disputed', amount: disputed, color: '#E03131' },
    { label: 'Invoiced', amount: costs.filter(c => c.payment_status === 'Invoiced').reduce((s, c) => s + Number(c.amount), 0), color: '#1C7ED6' },
  ];

  const topVendors = Object.entries(
    costs.reduce((acc: Record<string, number>, c) => {
      if (c.vendor) acc[c.vendor] = (acc[c.vendor] || 0) + Number(c.amount);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Costs" value={`$${total.toLocaleString()}`} sub={`${costs.length} entries`} color="#0F4C81" />
        <StatCard label="Paid" value={`$${paid.toLocaleString()}`} sub={`${costs.filter(c => c.payment_status === 'Paid').length} entries`} color="#2F9E44" />
        <StatCard label="Pending" value={`$${pending.toLocaleString()}`} sub="Awaiting payment" color="#F08C00" />
        <StatCard label="Disputed" value={`$${disputed.toLocaleString()}`} sub="Under review" color="#E03131" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>Cost by Category</SectionTitle>
          {byCategory.length === 0 ? <p className="text-xs text-gray-400">No data</p> :
            byCategory.map(([cat, amount]) => (
              <div key={cat} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700">{cat}</span>
                  <span className="text-xs font-semibold text-gray-800">${amount.toLocaleString()}</span>
                </div>
                <ProgressBar value={amount} max={total} color="#0F4C81" />
              </div>
            ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>Payment Status Breakdown</SectionTitle>
          {byPayment.map(({ label, amount, color }) => (
            <div key={label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{label}</span>
                <span className="text-xs font-semibold text-gray-800">${amount.toLocaleString()}</span>
              </div>
              <ProgressBar value={amount} max={total} color={color} />
            </div>
          ))}
        </div>
      </div>

      {topVendors.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
          <SectionTitle>Top Vendors by Cost</SectionTitle>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Vendor', 'Total Amount', 'Entries', 'Share'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 pb-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topVendors.map(([vendor, amount]) => {
                const count = costs.filter(c => c.vendor === vendor).length;
                return (
                  <tr key={vendor} className="border-b border-gray-50">
                    <td className="py-2 text-xs font-medium text-gray-800">{vendor}</td>
                    <td className="py-2 text-xs text-gray-700">${amount.toLocaleString()}</td>
                    <td className="py-2 text-xs text-gray-500">{count}</td>
                    <td className="py-2 w-32">
                      <ProgressBar value={amount} max={total} color="#1C7ED6" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Claims Analysis ---
function ClaimsAnalysis({ claims }: { claims: Claim[] }) {
  const open = claims.filter(c => c.status === 'Open').length;
  const settled = claims.filter(c => c.status === 'Settled').length;
  const totalClaimed = claims.reduce((s, c) => s + Number(c.claim_amount), 0);
  const totalSettled = claims.reduce((s, c) => s + Number(c.settled_amount), 0);
  const settlementRate = claims.length > 0 ? Math.round((settled / claims.length) * 100) : 0;
  const recoveryRate = totalClaimed > 0 ? Math.round((totalSettled / totalClaimed) * 100) : 0;

  const byType = Object.entries(
    claims.reduce((acc: Record<string, number>, c) => {
      acc[c.claim_type] = (acc[c.claim_type] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const byStatus = [
    { label: 'Open', color: '#F08C00' },
    { label: 'In Review', color: '#1C7ED6' },
    { label: 'Approved', color: '#2F9E44' },
    { label: 'Rejected', color: '#E03131' },
    { label: 'Settled', color: '#0F4C81' },
  ].map(s => ({ ...s, count: claims.filter(c => c.status === s.label).length }));

  const byPriority = ['Critical', 'High', 'Medium', 'Low'].map(p => ({
    label: p,
    count: claims.filter(c => c.priority === p).length,
    amount: claims.filter(c => c.priority === p).reduce((s, c) => s + Number(c.claim_amount), 0),
  }));

  const PRIORITY_COLORS: Record<string, string> = {
    Critical: '#E03131', High: '#F08C00', Medium: '#1C7ED6', Low: '#868E96',
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Claims" value={claims.length} sub={`${open} open`} color="#0F4C81" />
        <StatCard label="Settlement Rate" value={`${settlementRate}%`} sub={`${settled} settled`} color="#2F9E44" />
        <StatCard label="Total Claimed" value={`$${totalClaimed.toLocaleString()}`} color="#F08C00" />
        <StatCard label="Recovery Rate" value={`${recoveryRate}%`} sub={`$${totalSettled.toLocaleString()} settled`} color="#1C7ED6" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>By Status</SectionTitle>
          {byStatus.map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{s.label}</span>
                <span className="text-xs font-semibold text-gray-800">{s.count}</span>
              </div>
              <ProgressBar value={s.count} max={claims.length} color={s.color} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>By Claim Type</SectionTitle>
          {byType.length === 0 ? <p className="text-xs text-gray-400">No data</p> :
            byType.map(([type, count]) => (
              <div key={type} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700">{type}</span>
                  <span className="text-xs font-semibold text-gray-800">{count}</span>
                </div>
                <ProgressBar value={count} max={claims.length} color="#E03131" />
              </div>
            ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>By Priority</SectionTitle>
          {byPriority.map(({ label, count, amount }) => (
            <div key={label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{label}</span>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-800">{count}</span>
                  {amount > 0 && <span className="text-[10px] text-gray-400 ml-1">${amount.toLocaleString()}</span>}
                </div>
              </div>
              <ProgressBar value={count} max={claims.length} color={PRIORITY_COLORS[label]} />
            </div>
          ))}
        </div>
      </div>

      {claims.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
          <SectionTitle>Recent Claims</SectionTitle>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Claim #', 'Customer', 'Type', 'Priority', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 pb-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.slice(0, 10).map(c => {
                const CLAIM_STATUS_COLORS: Record<string, string> = { Open: 'text-amber-700 bg-amber-100', 'In Review': 'text-blue-700 bg-blue-100', Approved: 'text-emerald-700 bg-emerald-100', Rejected: 'text-red-700 bg-red-100', Settled: 'text-green-700 bg-green-100' };
                return (
                  <tr key={c.id} className="border-b border-gray-50">
                    <td className="py-2 text-xs font-semibold text-[#0F4C81]">{c.claim_number}</td>
                    <td className="py-2 text-xs text-gray-700">{c.customer_name}</td>
                    <td className="py-2 text-xs text-gray-500">{c.claim_type}</td>
                    <td className="py-2 text-xs" style={{ color: PRIORITY_COLORS[c.priority] }}>{c.priority}</td>
                    <td className="py-2 text-xs font-semibold text-gray-800">${Number(c.claim_amount).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${CLAIM_STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- POD Compliance ---
function PODCompliance({ pods }: { pods: POD[] }) {
  const total = pods.length;
  const verified = pods.filter(p => p.pod_status === 'Verified').length;
  const pending = pods.filter(p => p.pod_status === 'Pending').length;
  const rejected = pods.filter(p => p.pod_status === 'Rejected').length;
  const uploaded = pods.filter(p => p.pod_status === 'Uploaded').length;
  const complianceRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  const byDestination = Object.entries(
    pods.reduce((acc: Record<string, number>, p) => {
      if (p.destination) acc[p.destination] = (acc[p.destination] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const byCustomer = Object.entries(
    pods.reduce((acc: Record<string, { total: number; verified: number }>, p) => {
      if (!acc[p.customer_name]) acc[p.customer_name] = { total: 0, verified: 0 };
      acc[p.customer_name].total++;
      if (p.pod_status === 'Verified') acc[p.customer_name].verified++;
      return acc;
    }, {})
  ).sort((a, b) => b[1].total - a[1].total).slice(0, 8);

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total PODs" value={total} color="#0F4C81" />
        <StatCard label="Compliance Rate" value={`${complianceRate}%`} sub={`${verified} verified`} color="#2F9E44" />
        <StatCard label="Pending Upload" value={pending} sub="Awaiting POD" color="#F08C00" />
        <StatCard label="Rejected" value={rejected} sub="Need resubmission" color="#E03131" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>Status Distribution</SectionTitle>
          {[
            { label: 'Verified', count: verified, color: '#2F9E44' },
            { label: 'Uploaded', count: uploaded, color: '#1C7ED6' },
            { label: 'Pending', count: pending, color: '#F08C00' },
            { label: 'Rejected', count: rejected, color: '#E03131' },
          ].map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{s.label}</span>
                <span className="text-xs font-semibold text-gray-800">{s.count}</span>
              </div>
              <ProgressBar value={s.count} max={total} color={s.color} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>PODs by Destination</SectionTitle>
          {byDestination.length === 0 ? <p className="text-xs text-gray-400">No data</p> :
            byDestination.map(([dest, count]) => (
              <div key={dest} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700">{dest}</span>
                  <span className="text-xs font-semibold text-gray-800">{count}</span>
                </div>
                <ProgressBar value={count} max={total} color="#2F9E44" />
              </div>
            ))}
        </div>
      </div>

      {byCustomer.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
          <SectionTitle>Customer POD Compliance</SectionTitle>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Customer', 'Total PODs', 'Verified', 'Compliance Rate'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 pb-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byCustomer.map(([customer, data]) => {
                const rate = data.total > 0 ? Math.round((data.verified / data.total) * 100) : 0;
                return (
                  <tr key={customer} className="border-b border-gray-50">
                    <td className="py-2 text-xs font-medium text-gray-800">{customer || '(Unknown)'}</td>
                    <td className="py-2 text-xs text-gray-500">{data.total}</td>
                    <td className="py-2 text-xs text-green-600 font-semibold">{data.verified}</td>
                    <td className="py-2 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${rate}%`, background: rate >= 80 ? '#2F9E44' : rate >= 50 ? '#F08C00' : '#E03131' }} />
                        </div>
                        <span className="text-[10px] text-gray-500 w-7 text-right">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Border Performance ---
function BorderPerformance({ borders }: { borders: BorderCrossing[] }) {
  const total = borders.length;
  const cleared = borders.filter(b => b.status === 'Cleared').length;
  const onHold = borders.filter(b => b.status === 'Hold').length;
  const totalFees = borders.reduce((s, b) => s + Number(b.fees), 0);
  const clearanceRate = total > 0 ? Math.round((cleared / total) * 100) : 0;

  const byPoint = Object.entries(
    borders.reduce((acc: Record<string, { count: number; cleared: number; fees: number }>, b) => {
      const key = b.border_point || 'Unknown';
      if (!acc[key]) acc[key] = { count: 0, cleared: 0, fees: 0 };
      acc[key].count++;
      if (b.status === 'Cleared') acc[key].cleared++;
      acc[key].fees += Number(b.fees);
      return acc;
    }, {})
  ).sort((a, b) => b[1].count - a[1].count).slice(0, 8);

  const byStatus = [
    { label: 'Cleared', color: '#2F9E44' },
    { label: 'In Clearance', color: '#1C7ED6' },
    { label: 'Pending', color: '#F08C00' },
    { label: 'Hold', color: '#E03131' },
    { label: 'Rejected', color: '#868E96' },
  ].map(s => ({ ...s, count: borders.filter(b => b.status === s.label).length }));

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Crossings" value={total} color="#0F4C81" />
        <StatCard label="Clearance Rate" value={`${clearanceRate}%`} sub={`${cleared} cleared`} color="#2F9E44" />
        <StatCard label="On Hold" value={onHold} sub="Requires attention" color="#E03131" />
        <StatCard label="Total Fees" value={`$${totalFees.toLocaleString()}`} color="#F08C00" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>Status Breakdown</SectionTitle>
          {byStatus.map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{s.label}</span>
                <span className="text-xs font-semibold text-gray-800">{s.count}</span>
              </div>
              <ProgressBar value={s.count} max={total} color={s.color} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>Export vs Import</SectionTitle>
          {[
            { label: 'Export', count: borders.filter(b => b.direction === 'Export').length, color: '#0F4C81' },
            { label: 'Import', count: borders.filter(b => b.direction === 'Import').length, color: '#1C7ED6' },
          ].map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{s.label}</span>
                <span className="text-xs font-semibold text-gray-800">{s.count}</span>
              </div>
              <ProgressBar value={s.count} max={total} color={s.color} />
            </div>
          ))}
        </div>
      </div>

      {byPoint.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
          <SectionTitle>Border Point Performance</SectionTitle>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Border Point', 'Total', 'Cleared', 'Clearance Rate', 'Total Fees'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 pb-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byPoint.map(([point, data]) => {
                const rate = data.count > 0 ? Math.round((data.cleared / data.count) * 100) : 0;
                return (
                  <tr key={point} className="border-b border-gray-50">
                    <td className="py-2 text-xs font-medium text-gray-800">{point}</td>
                    <td className="py-2 text-xs text-gray-500">{data.count}</td>
                    <td className="py-2 text-xs text-green-600 font-semibold">{data.cleared}</td>
                    <td className="py-2 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${rate}%`, background: rate >= 70 ? '#2F9E44' : rate >= 40 ? '#F08C00' : '#E03131' }} />
                        </div>
                        <span className="text-[10px] text-gray-500 w-7 text-right">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-xs text-gray-700">${data.fees.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Customer Ledger ---
function CustomerLedger({ customers, currency }: { customers: Customer[]; currency: string }) {
  const active = customers.filter(c => c.status === 'Active').length;
  const totalCredit = customers.reduce((s, c) => s + Number(c.credit_limit), 0);
  const totalBalance = customers.reduce((s, c) => s + Number(c.current_balance), 0);
  const totalShipments = customers.reduce((s, c) => s + (c.total_shipments || 0), 0);

  const overCredit = customers.filter(c => Number(c.current_balance) > Number(c.credit_limit));

  const byCountry = Object.entries(
    customers.reduce((acc: Record<string, number>, c) => {
      acc[c.country || 'Unknown'] = (acc[c.country || 'Unknown'] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const byType = ['VIP', 'Premium', 'Regular'].map(type => ({
    label: type,
    count: customers.filter(c => c.customer_type === type).length,
    credit: customers.filter(c => c.customer_type === type).reduce((s, c) => s + Number(c.credit_limit), 0),
  }));

  const TYPE_COLORS: Record<string, string> = { VIP: '#F08C00', Premium: '#1C7ED6', Regular: '#868E96' };

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Customers" value={customers.length} sub={`${active} active`} color="#0F4C81" />
        <StatCard label="Total Credit Extended" value={`$${totalCredit.toLocaleString()}`} color="#1C7ED6" />
        <StatCard label="Outstanding Balance" value={`$${totalBalance.toLocaleString()}`} sub={`${overCredit.length} over limit`} color="#F08C00" />
        <StatCard label="Total Shipments" value={totalShipments} color="#2F9E44" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>Customers by Country</SectionTitle>
          {byCountry.length === 0 ? <p className="text-xs text-gray-400">No data</p> :
            byCountry.map(([country, count]) => (
              <div key={country} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700">{country}</span>
                  <span className="text-xs font-semibold text-gray-800">{count}</span>
                </div>
                <ProgressBar value={count} max={customers.length} color="#0F4C81" />
              </div>
            ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <SectionTitle>By Customer Type</SectionTitle>
          {byType.map(({ label, count, credit }) => (
            <div key={label} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{label}</span>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-800">{count}</span>
                  {credit > 0 && <span className="text-[10px] text-gray-400 ml-1">${credit.toLocaleString()}</span>}
                </div>
              </div>
              <ProgressBar value={count} max={customers.length} color={TYPE_COLORS[label]} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
        <SectionTitle>Customer Ledger</SectionTitle>
        {customers.length === 0 ? <p className="text-xs text-gray-400">No customers found</p> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Company', 'Type', 'Country', 'Credit Limit', 'Balance', 'Utilisation', 'Shipments', 'Status'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 pb-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const util = Number(c.credit_limit) > 0 ? Math.round((Number(c.current_balance) / Number(c.credit_limit)) * 100) : 0;
                const overLimit = Number(c.current_balance) > Number(c.credit_limit);
                const STATUS_COLORS: Record<string, string> = { Active: 'text-green-700 bg-green-100', Inactive: 'text-gray-700 bg-gray-100', Suspended: 'text-red-700 bg-red-100' };
                return (
                  <tr key={c.id} className="border-b border-gray-50">
                    <td className="py-2 text-xs font-medium text-gray-800">{c.company_name}</td>
                    <td className="py-2 text-xs text-gray-500">{c.customer_type}</td>
                    <td className="py-2 text-xs text-gray-500">{c.country}</td>
                    <td className="py-2 text-xs text-gray-700">${Number(c.credit_limit).toLocaleString()}</td>
                    <td className={`py-2 text-xs font-semibold ${overLimit ? 'text-red-600' : 'text-gray-700'}`}>
                      ${Number(c.current_balance).toLocaleString()}
                    </td>
                    <td className="py-2 w-28">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(util, 100)}%`, background: util >= 90 ? '#E03131' : util >= 60 ? '#F08C00' : '#2F9E44' }} />
                        </div>
                        <span className="text-[10px] text-gray-500 w-7">{util}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-xs text-gray-500">{c.total_shipments || 0}</td>
                    <td className="py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
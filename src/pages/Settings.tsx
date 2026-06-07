import { useState } from 'react';

type TabId = 'organization' | 'preferences' | 'notifications' | 'integrations' | 'security';

interface OrgSettings {
  companyName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  baseCurrency: string;
  timezone: string;
  language: string;
  weightUnit: 'kg' | 'lb';
  distanceUnit: 'km' | 'mi';
}

interface NotifPrefs {
  shipmentDelay: boolean;
  incidentCritical: boolean;
  podPending: boolean;
  borderHold: boolean;
  docExpiry: boolean;
  weeklyDigest: boolean;
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

interface IntegrationState {
  supabaseConnected: boolean;
  gpsProvider: string;
  customsApi: string;
  webhookUrl: string;
}

interface SecurityState {
  twoFactor: boolean;
  sessionTimeoutMin: number;
  passwordExpiryDays: number;
  enforceStrongPwd: boolean;
}

const DEFAULT_ORG: OrgSettings = {
  companyName: 'Transit360 Logistics',
  legalName: '',
  taxId: '',
  email: 'ops@transit360.io',
  phone: '',
  address: '',
  city: '',
  country: '',
  baseCurrency: 'USD',
  timezone: 'Africa/Lagos',
  language: 'en',
  weightUnit: 'kg',
  distanceUnit: 'km',
};

const DEFAULT_NOTIF: NotifPrefs = {
  shipmentDelay: true,
  incidentCritical: true,
  podPending: true,
  borderHold: true,
  docExpiry: true,
  weeklyDigest: false,
  email: true,
  inApp: true,
  sms: false,
};

const DEFAULT_INT: IntegrationState = {
  supabaseConnected: true,
  gpsProvider: '',
  customsApi: '',
  webhookUrl: '',
};

const DEFAULT_SEC: SecurityState = {
  twoFactor: false,
  sessionTimeoutMin: 60,
  passwordExpiryDays: 90,
  enforceStrongPwd: true,
};

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'organization', label: 'Organization', icon: 'ti-building' },
  { id: 'preferences', label: 'Preferences', icon: 'ti-adjustments' },
  { id: 'notifications', label: 'Notifications', icon: 'ti-bell' },
  { id: 'integrations', label: 'Integrations', icon: 'ti-plug' },
  { id: 'security', label: 'Security', icon: 'ti-shield-lock' },
];

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
}

export function Settings() {
  const [tab, setTab] = useState<TabId>('organization');
  const [org, setOrg] = useState<OrgSettings>(() => loadJSON('t360.settings.org', DEFAULT_ORG));
  const [notif, setNotif] = useState<NotifPrefs>(() => loadJSON('t360.settings.notif', DEFAULT_NOTIF));
  const [integ, setInteg] = useState<IntegrationState>(() => loadJSON('t360.settings.integ', DEFAULT_INT));
  const [sec, setSec] = useState<SecurityState>(() => loadJSON('t360.settings.sec', DEFAULT_SEC));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function saveAll() {
    window.localStorage.setItem('t360.settings.org', JSON.stringify(org));
    window.localStorage.setItem('t360.settings.notif', JSON.stringify(notif));
    window.localStorage.setItem('t360.settings.integ', JSON.stringify(integ));
    window.localStorage.setItem('t360.settings.sec', JSON.stringify(sec));
    setSavedAt(new Date().toLocaleTimeString());
    setTimeout(() => setSavedAt(null), 2500);
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-[200px_1fr] gap-4">
        {/* Side tabs */}
        <aside className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm h-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                tab === t.id ? 'bg-blue-50/70 text-[#0F4C81] font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className={`ti ${t.icon} text-sm`} />
              {t.label}
            </button>
          ))}
        </aside>

        {/* Panel */}
        <section className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div>
              <div className="text-sm font-semibold text-gray-800">{TABS.find(t => t.id === tab)?.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Changes are stored locally on this device.</div>
            </div>
            <div className="flex items-center gap-2">
              {savedAt && <span className="text-[10px] text-green-600">Saved at {savedAt}</span>}
              <button
                onClick={saveAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white text-xs rounded-lg hover:bg-[#0d4373] transition-colors"
              >
                <i className="ti ti-device-floppy text-sm" /> Save changes
              </button>
            </div>
          </div>

          <div className="p-5 text-xs">
            {tab === 'organization' && <OrgPanel value={org} onChange={setOrg} />}
            {tab === 'preferences' && <PrefsPanel value={org} onChange={setOrg} />}
            {tab === 'notifications' && <NotifPanel value={notif} onChange={setNotif} />}
            {tab === 'integrations' && <IntegPanel value={integ} onChange={setInteg} />}
            {tab === 'security' && <SecPanel value={sec} onChange={setSec} />}
          </div>
        </section>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1C7ED6] text-xs';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-b-0 text-left"
    >
      <div>
        <div className="text-gray-800 font-medium">{label}</div>
        {hint && <div className="text-[10px] text-gray-400 mt-0.5">{hint}</div>}
      </div>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#0F4C81]' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
    </button>
  );
}

function OrgPanel({ value, onChange }: { value: OrgSettings; onChange: (v: OrgSettings) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Company Name" className="col-span-2">
        <input className={inputCls} value={value.companyName} onChange={e => onChange({ ...value, companyName: e.target.value })} />
      </Field>
      <Field label="Legal Name">
        <input className={inputCls} value={value.legalName} onChange={e => onChange({ ...value, legalName: e.target.value })} />
      </Field>
      <Field label="Tax / VAT ID">
        <input className={inputCls} value={value.taxId} onChange={e => onChange({ ...value, taxId: e.target.value })} />
      </Field>
      <Field label="Contact Email">
        <input type="email" className={inputCls} value={value.email} onChange={e => onChange({ ...value, email: e.target.value })} />
      </Field>
      <Field label="Contact Phone">
        <input className={inputCls} value={value.phone} onChange={e => onChange({ ...value, phone: e.target.value })} />
      </Field>
      <Field label="Address" className="col-span-2">
        <input className={inputCls} value={value.address} onChange={e => onChange({ ...value, address: e.target.value })} />
      </Field>
      <Field label="City">
        <input className={inputCls} value={value.city} onChange={e => onChange({ ...value, city: e.target.value })} />
      </Field>
      <Field label="Country">
        <input className={inputCls} value={value.country} onChange={e => onChange({ ...value, country: e.target.value })} />
      </Field>
    </div>
  );
}

function PrefsPanel({ value, onChange }: { value: OrgSettings; onChange: (v: OrgSettings) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Base Currency">
        <select className={inputCls} value={value.baseCurrency} onChange={e => onChange({ ...value, baseCurrency: e.target.value })}>
          {['USD','EUR','GBP','NGN','KES','ZAR','XOF','XAF'].map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Timezone">
        <select className={inputCls} value={value.timezone} onChange={e => onChange({ ...value, timezone: e.target.value })}>
          {['Africa/Lagos','Africa/Nairobi','Africa/Johannesburg','Africa/Cairo','Europe/London','Europe/Paris','UTC'].map(z => <option key={z}>{z}</option>)}
        </select>
      </Field>
      <Field label="Language">
        <select className={inputCls} value={value.language} onChange={e => onChange({ ...value, language: e.target.value })}>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
        </select>
      </Field>
      <Field label="Weight Unit">
        <select className={inputCls} value={value.weightUnit} onChange={e => onChange({ ...value, weightUnit: e.target.value as 'kg' | 'lb' })}>
          <option value="kg">Kilograms (kg)</option>
          <option value="lb">Pounds (lb)</option>
        </select>
      </Field>
      <Field label="Distance Unit">
        <select className={inputCls} value={value.distanceUnit} onChange={e => onChange({ ...value, distanceUnit: e.target.value as 'km' | 'mi' })}>
          <option value="km">Kilometers (km)</option>
          <option value="mi">Miles (mi)</option>
        </select>
      </Field>
    </div>
  );
}

function NotifPanel({ value, onChange }: { value: NotifPrefs; onChange: (v: NotifPrefs) => void }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Event Alerts</div>
        <Toggle label="Shipment delays" hint="Notify when shipments are marked delayed" checked={value.shipmentDelay} onChange={v => onChange({ ...value, shipmentDelay: v })} />
        <Toggle label="Critical incidents" hint="Severity: Critical" checked={value.incidentCritical} onChange={v => onChange({ ...value, incidentCritical: v })} />
        <Toggle label="POD pending" hint="Delivered with no POD attached" checked={value.podPending} onChange={v => onChange({ ...value, podPending: v })} />
        <Toggle label="Border holds" checked={value.borderHold} onChange={v => onChange({ ...value, borderHold: v })} />
        <Toggle label="Document expiry" hint="Licenses, permits, insurance" checked={value.docExpiry} onChange={v => onChange({ ...value, docExpiry: v })} />
        <Toggle label="Weekly digest" hint="Operations summary every Monday" checked={value.weeklyDigest} onChange={v => onChange({ ...value, weeklyDigest: v })} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Channels</div>
        <Toggle label="Email" checked={value.email} onChange={v => onChange({ ...value, email: v })} />
        <Toggle label="In-app" checked={value.inApp} onChange={v => onChange({ ...value, inApp: v })} />
        <Toggle label="SMS" hint="Carrier rates may apply" checked={value.sms} onChange={v => onChange({ ...value, sms: v })} />
      </div>
    </div>
  );
}

function IntegPanel({ value, onChange }: { value: IntegrationState; onChange: (v: IntegrationState) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-green-50/60 border border-green-100 rounded-lg">
        <div className="flex items-center gap-3">
          <i className="ti ti-database text-lg text-green-700" />
          <div>
            <div className="font-medium text-gray-800">Supabase</div>
            <div className="text-[10px] text-gray-500">Backend database & auth</div>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
          {value.supabaseConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <Field label="GPS Provider API Key">
        <input className={inputCls} placeholder="e.g. Geotab, Samsara token" value={value.gpsProvider} onChange={e => onChange({ ...value, gpsProvider: e.target.value })} />
      </Field>
      <Field label="Customs API Endpoint">
        <input className={inputCls} placeholder="https://customs.example/api" value={value.customsApi} onChange={e => onChange({ ...value, customsApi: e.target.value })} />
      </Field>
      <Field label="Webhook URL">
        <input className={inputCls} placeholder="https://your-app/webhook" value={value.webhookUrl} onChange={e => onChange({ ...value, webhookUrl: e.target.value })} />
      </Field>
    </div>
  );
}

function SecPanel({ value, onChange }: { value: SecurityState; onChange: (v: SecurityState) => void }) {
  return (
    <div className="space-y-3 max-w-md">
      <Toggle label="Two-factor authentication" hint="Require a second factor at sign-in" checked={value.twoFactor} onChange={v => onChange({ ...value, twoFactor: v })} />
      <Toggle label="Enforce strong passwords" hint="Minimum 12 chars, mixed case + symbol" checked={value.enforceStrongPwd} onChange={v => onChange({ ...value, enforceStrongPwd: v })} />
      <Field label="Session Timeout (minutes)">
        <input type="number" min={5} max={1440} className={inputCls} value={value.sessionTimeoutMin} onChange={e => onChange({ ...value, sessionTimeoutMin: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Password Expiry (days)">
        <input type="number" min={0} max={365} className={inputCls} value={value.passwordExpiryDays} onChange={e => onChange({ ...value, passwordExpiryDays: Number(e.target.value) || 0 })} />
      </Field>
    </div>
  );
}
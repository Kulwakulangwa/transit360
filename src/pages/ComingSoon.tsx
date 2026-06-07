const PAGE_ICONS: Record<string, string> = {
  containers: 'ti-box',
  drivers: 'ti-id-badge',
  tracking: 'ti-map-pin',
  gps: 'ti-satellite',
  borders: 'ti-ban',
  pods: 'ti-file-check',
  documents: 'ti-files',
  costs: 'ti-receipt',
  claims: 'ti-shield-exclamation',
  customers: 'ti-users',
  reports: 'ti-file-analytics',
  settings: 'ti-settings',
  admin: 'ti-lock',
};

export function ComingSoon({ page }: { page: string }) {
  const icon = PAGE_ICONS[page] || 'ti-layout-dashboard';
  const name = page.charAt(0).toUpperCase() + page.slice(1);
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        <i className={`ti ${icon} text-3xl text-gray-300`} />
      </div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{name}</div>
      <div className="text-xs text-gray-400 max-w-xs">
        This section is coming soon. Select Dashboard to continue using Transit360.
      </div>
    </div>
  );
}

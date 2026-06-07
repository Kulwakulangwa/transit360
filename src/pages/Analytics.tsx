import type { Shipment } from '../types';

interface Props {
  shipments: Shipment[];
}

export function Analytics({ shipments }: Props) {
  const detTotal = shipments.reduce((a, s) => a + s.detentionCost, 0);
  const fuelTotal = shipments.reduce((a, s) => a + s.costFuel, 0);
  const customsTotal = shipments.reduce((a, s) => a + s.costCustoms, 0);
  const grandCost = detTotal + fuelTotal + customsTotal;
  const topDetention = [...shipments].filter(s => s.detentionCost > 0).sort((a, b) => b.detentionCost - a.detentionCost).slice(0, 5);

  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const delayed = shipments.filter(s => s.status === 'Delayed').length;
  const onTimeRate = shipments.length > 0 ? Math.round((delivered / shipments.length) * 100) : 0;

  return (
    <div className="p-4 space-y-3">
      <div className="mb-1">
        <div className="text-sm font-semibold text-gray-900">Finance &amp; Analytics</div>
        <div className="text-xs text-gray-500 mt-0.5">Live from shipment &amp; fleet data</div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'YTD Revenue', value: '—', color: '#1C7ED6', note: 'Connect financial data', icon: 'ti-trending-up', dc: '#2B8A3E' },
          { label: 'YTD Profit', value: '—', color: '#2B8A3E', note: 'Connect financial data', icon: 'ti-trending-up', dc: '#2B8A3E' },
          { label: 'On-Time Rate', value: onTimeRate > 0 ? `${onTimeRate}%` : '—', color: onTimeRate >= 85 ? '#2B8A3E' : onTimeRate >= 70 ? '#F08C00' : '#E03131', note: `${delivered} delivered`, icon: 'ti-circle-check', dc: '#2B8A3E' },
          { label: 'Total Shipments', value: shipments.length || '—', color: '#111827', note: 'All time', icon: 'ti-package', dc: '#2B8A3E' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1.5">{s.label}</div>
            <div className="text-2xl font-semibold leading-none mb-2" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: s.dc }}>
              <i className={`ti ${s.icon} text-xs`} />{s.note}
            </div>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-chart-line text-[#1C7ED6]" /> Revenue, Profit &amp; Cost Chart</span>
        </div>
        <div className="h-28 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg gap-2">
          <i className="ti ti-chart-area-line text-3xl text-gray-300" />
          <div className="text-xs text-gray-400">Connect your financial data source to populate this chart</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Cost breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-coins text-[#1C7ED6]" /> Cost Breakdown</span>
          </div>
          {grandCost === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">Add shipment cost data to see breakdown</div>
          ) : (
            <>
              {[['Fuel', fuelTotal, '#1C7ED6'], ['Detention', detTotal, '#E03131'], ['Customs & Fees', customsTotal, '#F08C00']].map(([l, v, c]) => {
                const pct = grandCost > 0 ? Math.round(((v as number) / grandCost) * 100) : 0;
                return (
                  <div key={l as string} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: c as string }} />
                        <span className="text-xs text-gray-500">{l}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800">${(v as number).toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 w-6 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c as string }} />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-700">Total Cost</span>
                <span className="text-sm font-semibold text-gray-900">${grandCost.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Detention top 5 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-alert-triangle text-[#E03131]" /> Detention Exposure — Top 5</span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Shipments accruing highest detention charges</p>
          {topDetention.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">No detention charges recorded</div>
          ) : (
            <>
              {topDetention.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2.5 px-2.5 py-2 border border-gray-100 rounded-lg mb-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                    style={{
                      background: i === 0 ? 'rgba(224,49,49,0.12)' : i === 1 ? 'rgba(240,140,0,0.12)' : '#f3f4f6',
                      color: i === 0 ? '#E03131' : i === 1 ? '#F08C00' : '#6b7280'
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#0F4C81] w-16 flex-shrink-0">{s.blNumber}</span>
                  <span className="flex-1 text-xs text-gray-500 truncate">{s.transporter || '—'}</span>
                  <span className="text-xs font-semibold text-red-600">${s.detentionCost.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                <span className="text-xs font-semibold text-gray-700">Total Exposure</span>
                <span className="text-sm font-semibold text-red-600">${detTotal.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delivery performance */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-chart-bar text-[#1C7ED6]" /> Delivery Performance</span>
        </div>
        {shipments.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400">Add shipment data to see delivery performance</div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Delivered', value: delivered, color: '#2B8A3E', bg: 'bg-green-50' },
              { label: 'Delayed', value: delayed, color: '#E03131', bg: 'bg-red-50' },
              { label: 'Border Hold', value: shipments.filter(s => s.status === 'Border Hold').length, color: '#F08C00', bg: 'bg-amber-50' },
              { label: 'In Transit', value: shipments.filter(s => s.status === 'In Transit').length, color: '#1C7ED6', bg: 'bg-blue-50' },
            ].map(stat => (
              <div key={stat.label} className={`rounded-lg p-3 ${stat.bg}`}>
                <div className="text-xl font-semibold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

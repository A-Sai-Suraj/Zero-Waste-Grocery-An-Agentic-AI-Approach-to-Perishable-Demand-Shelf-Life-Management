import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/expiry', label: 'Expiry Alerts' },
  { href: '/forecasts', label: 'Forecasts' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/compare', label: 'Store Comparison' },
  { href: '/sales', label: 'Sales & Promotions' },
  { href: '/evaluation', label: 'Reports' },
  { href: '/admin', label: 'Admin Settings' },
];

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-waste-700">ZeroWaste AI</p>
          <h1 className="mt-2 text-xl font-bold">Operations Console</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">ZeroWaste AI</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            Mock mode enabled
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

import { PageShell } from '@/components/page-shell';

const roles = [
  { name: 'Admin', access: 'Full dashboard access' },
  { name: 'Store Manager', access: 'Store-specific approvals and actions' },
  { name: 'Analyst', access: 'Reports and forecast review' },
];

export default function AdminPage() {
  return (
    <PageShell title="Admin Settings">
      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((role) => (
          <div key={role.name} className="card">
            <p className="text-sm text-slate-500">Role</p>
            <h3 className="mt-2 text-xl font-semibold">{role.name}</h3>
            <p className="mt-3 text-sm text-slate-600">{role.access}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

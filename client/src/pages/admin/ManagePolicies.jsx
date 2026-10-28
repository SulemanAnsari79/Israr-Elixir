import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPolicies, savePolicies } from '../../services/AdminService.js';

const fields = [
  { key: 'terms', title: 'Terms & Conditions', description: 'The rules customers agree to when using the store.' },
  { key: 'privacy', title: 'Privacy Policy', description: 'Explain how customer information is collected and used.' },
  { key: 'refund', title: 'Refund Policy', description: 'Describe eligible returns, refunds, and processing timelines.' },
  { key: 'cancellation', title: 'Cancellation Policy', description: 'Explain when and how customers can cancel an order.' },
];

const emptyPolicies = { terms: '', privacy: '', refund: '', cancellation: '' };

export default function ManagePolicies() {
  const [policies, setPolicies] = useState(emptyPolicies);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPolicies()
      .then(({ data }) => setPolicies({ ...emptyPolicies, ...data.policies }))
      .catch(() => toast.error('Could not load policies'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await savePolicies(policies);
      toast.success('Policies saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save policies');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading policies…</div>;

  return (
    <form onSubmit={save} className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-800">Storefront</p>
          <h1 className="mt-1 text-3xl font-semibold text-gray-900">Store policies</h1>
          <p className="mt-2 text-sm text-gray-500">Manage the policies shown to customers from one place.</p>
        </div>
        <button disabled={saving} className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save policies'}
        </button>
      </div>

      {fields.map((field) => (
        <section key={field.key} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">{field.title}</h2>
            <p className="text-sm text-gray-500">{field.description}</p>
          </div>
          <textarea
            rows="12"
            value={policies[field.key]}
            onChange={(event) => setPolicies((current) => ({ ...current, [field.key]: event.target.value }))}
            placeholder={`Write your ${field.title.toLowerCase()} here…`}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 focus:border-amber-700 focus:outline-none"
          />
          <p className="text-xs text-gray-400">Line breaks are preserved on the customer-facing page.</p>
        </section>
      ))}
    </form>
  );
}

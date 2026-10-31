import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPolicies, getStorefrontSettings, savePolicies, saveStorefrontSettings, uploadStorefrontImage } from '../../services/AdminService.js';

const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none';
const initial = {
  brandName: 'Israr Elixir',
  login: { backgroundImage: '', logoImage: '' },
  about: { eyebrow: '', title: '', intro: '', storyTitle: '', storyParagraphs: ['', ''], image: '' },
  contact: { eyebrow: '', title: '', description: '', address: '', phone: '', email: '', mapEmbedUrl: '' },
  footer: { tagline: '', email: '', phone: '', instagramUrl: '' },
};
const policyFields = [
  { key: 'terms', title: 'Terms & Conditions', description: 'The rules customers agree to when using the store.' },
  { key: 'privacy', title: 'Privacy Policy', description: 'Explain how customer information is collected and used.' },
  { key: 'refund', title: 'Refund Policy', description: 'Describe eligible returns, refunds, and processing timelines.' },
  { key: 'cancellation', title: 'Cancellation Policy', description: 'Explain when and how customers can cancel an order.' },
];

function TextField({ label, value, onChange, multiline = false, type = 'text' }) {
  const Field = multiline ? 'textarea' : 'input';
  return <label className="block text-sm font-medium text-gray-700">{label}<Field type={multiline ? undefined : type} rows={multiline ? 3 : undefined} className={inputClass} value={value || ''} onChange={(event) => onChange(event.target.value)} /></label>;
}

function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadStorefrontImage(file);
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
  return <div className="space-y-2">
    <TextField label={label} value={value} onChange={onChange} type="url" />
    <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-semibold text-gray-700">
      {uploading ? 'Uploading…' : 'Upload image'}
      <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
    </label>
    {value && <img src={value} alt={`${label} preview`} className="h-32 w-full rounded-lg object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
  </div>;
}

export default function ManageStorefront() {
  const [settings, setSettings] = useState(initial);
  const [policies, setPolicies] = useState({ terms: '', privacy: '', refund: '', cancellation: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([getStorefrontSettings(), getPolicies()])
      .then(([storefrontResponse, policiesResponse]) => {
        const storefront = storefrontResponse.data.storefront;
        setSettings((current) => ({
          ...current,
          ...storefront,
          login: { ...current.login, ...(storefront?.login || {}) },
          about: { ...current.about, ...(storefront?.about || {}) },
          contact: { ...current.contact, ...(storefront?.contact || {}) },
          footer: { ...current.footer, ...(storefront?.footer || {}) },
        }));
        setPolicies((current) => ({ ...current, ...(policiesResponse.data.policies || {}) }));
      })
      .catch(() => toast.error('Could not load storefront settings'))
      .finally(() => setLoading(false));
  }, []);
  const update = (section, key, value) => setSettings((current) => section ? { ...current, [section]: { ...current[section], [key]: value } } : { ...current, [key]: value });
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await Promise.all([saveStorefrontSettings(settings), savePolicies(policies)]);
      toast.success('Storefront settings saved');
    }
    catch (error) { toast.error(error.response?.data?.message || 'Could not save storefront settings'); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="p-8 text-gray-500">Loading storefront settings…</div>;
  return <form onSubmit={save} className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-800">Storefront</p><h1 className="mt-1 text-3xl font-semibold text-gray-900">Brand and page controls</h1><p className="mt-2 text-sm text-gray-500">Manage login imagery, navigation branding, About Us, Contact, and footer content.</p></div>
      <button disabled={saving} className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
    </div>
    <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="md:col-span-2 text-lg font-semibold">Brand and login</h2><TextField label="Brand name" value={settings.brandName} onChange={(value) => update('', 'brandName', value)} /><ImageField label="Login background image URL" value={settings.login.backgroundImage} onChange={(value) => update('login', 'backgroundImage', value)} /><ImageField label="Login logo image URL" value={settings.login.logoImage} onChange={(value) => update('login', 'logoImage', value)} /></section>
    <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="md:col-span-2 text-lg font-semibold">About Us page</h2><TextField label="Eyebrow" value={settings.about.eyebrow} onChange={(value) => update('about', 'eyebrow', value)} /><TextField label="Page title" value={settings.about.title} onChange={(value) => update('about', 'title', value)} /><TextField label="Intro" value={settings.about.intro} onChange={(value) => update('about', 'intro', value)} multiline /><TextField label="Story heading" value={settings.about.storyTitle} onChange={(value) => update('about', 'storyTitle', value)} /><TextField label="First story paragraph" value={settings.about.storyParagraphs?.[0]} onChange={(value) => update('about', 'storyParagraphs', [value, settings.about.storyParagraphs?.[1] || ''])} multiline /><TextField label="Second story paragraph" value={settings.about.storyParagraphs?.[1]} onChange={(value) => update('about', 'storyParagraphs', [settings.about.storyParagraphs?.[0] || '', value])} multiline /><ImageField label="About page image URL" value={settings.about.image} onChange={(value) => update('about', 'image', value)} /></section>
    <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="md:col-span-2 text-lg font-semibold">Contact page</h2><TextField label="Eyebrow" value={settings.contact.eyebrow} onChange={(value) => update('contact', 'eyebrow', value)} /><TextField label="Page title" value={settings.contact.title} onChange={(value) => update('contact', 'title', value)} /><TextField label="Description" value={settings.contact.description} onChange={(value) => update('contact', 'description', value)} multiline /><TextField label="Address" value={settings.contact.address} onChange={(value) => update('contact', 'address', value)} /><TextField label="Support phone" value={settings.contact.phone} onChange={(value) => update('contact', 'phone', value)} /><TextField label="Support email" value={settings.contact.email} onChange={(value) => update('contact', 'email', value)} type="email" /><TextField label="Google Maps embed URL" value={settings.contact.mapEmbedUrl} onChange={(value) => update('contact', 'mapEmbedUrl', value)} type="url" /></section>
    <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="md:col-span-2 text-lg font-semibold">Footer</h2><TextField label="Tagline" value={settings.footer.tagline} onChange={(value) => update('footer', 'tagline', value)} multiline /><TextField label="Email" value={settings.footer.email} onChange={(value) => update('footer', 'email', value)} type="email" /><TextField label="Phone" value={settings.footer.phone} onChange={(value) => update('footer', 'phone', value)} /><TextField label="Instagram URL" value={settings.footer.instagramUrl} onChange={(value) => update('footer', 'instagramUrl', value)} type="url" /></section>
    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm"><div><h2 className="text-lg font-semibold">Store policies</h2><p className="text-sm text-gray-500">Manage the policies linked from the storefront footer.</p></div>{policyFields.map((field) => <label key={field.key} className="block text-sm font-medium text-gray-700">{field.title}<span className="mt-1 block text-xs font-normal text-gray-500">{field.description}</span><textarea rows="8" value={policies[field.key]} onChange={(event) => setPolicies((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={`Write your ${field.title.toLowerCase()} here…`} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 focus:border-amber-700 focus:outline-none" /></label>)}</section>
  </form>;
}

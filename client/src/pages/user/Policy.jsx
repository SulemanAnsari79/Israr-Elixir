import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/Api.js';

const policyTitles = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
  cancellation: 'Cancellation Policy',
};

export default function Policy() {
  const { policyType } = useParams();
  const [content, setContent] = useState('');
  const [loadedPolicyType, setLoadedPolicyType] = useState(null);
  const title = policyTitles[policyType];
  const loading = loadedPolicyType !== policyType;

  useEffect(() => {
    let active = true;
    api.get(`/policies/${policyType}`)
      .then(({ data }) => {
        if (active) {
          setContent(data.policy?.content || '');
          setLoadedPolicyType(policyType);
        }
      })
      .catch(() => {
        if (active) {
          setContent('');
          setLoadedPolicyType(policyType);
        }
      });
    return () => { active = false; };
  }, [policyType]);

  if (!title) {
    return <div className="min-h-screen p-10 text-center">Policy not found.</div>;
  }

  return (
    <div className="store-page min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Link to="/" className="text-xs font-bold uppercase tracking-[.18em] text-[#0D9488]">Israr Elixir</Link>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">{title}</h1>
        {loading ? (
          <p className="mt-10 text-slate-500">Loading policy…</p>
        ) : (
          <div className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 text-base leading-8 text-slate-600 shadow-sm md:p-10">
            {content ? <p className="whitespace-pre-wrap">{content}</p> : <p>This policy has not been published yet.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

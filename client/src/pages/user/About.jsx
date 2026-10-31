import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Target01Icon, 
  ViewIcon, 
  CheckmarkBadge01Icon, 
  GlobalIcon, 
  Location01Icon, 
  City01Icon, 
  Mail01Icon,
  StethoscopeIcon,
  CleanIcon
} from 'hugeicons-react';
import api from "../../services/Api.js";

const About = () => {
  const [about, setAbout] = useState({
    eyebrow: 'The Israr Elixir story',
    title: 'Fragrance that feels like you.',
    intro: 'We believe a fragrance can hold a memory, set a mood, and make the everyday feel special.',
    storyTitle: 'A little about us',
    storyParagraphs: [
      'Israr Elixir is a fragrance boutique for people who see scent as part of their personal style and daily ritual.',
      'Our edit brings together distinctive perfumes and considered gifts, so finding your next signature scent feels simple and personal.',
    ],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000',
  });
  useEffect(() => { api.get('/storefront').then(({ data }) => setAbout((current) => ({ ...current, ...(data.storefront?.about || {}) }))).catch(() => {}); }, []);
  return (
    <div className="store-page min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="pt-12">
        {/* 1. PREMIUM HERO SECTION */}
        <section className="relative px-6 overflow-hidden">
          {/* <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-blue-50/50 to-transparent"></div>
          </div> */}
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 shadow-sm border border-slate-100">
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{about.eyebrow}</span>
            </div>
            {/* <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
              Fragrance that <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#1A56DB] to-[#0D9488] italic font-serif">Feels like you.</span>
            </h1> */}
            <h1 className="mb-5 text-5xl font-black tracking-tighter text-slate-900">{about.title}</h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">{about.intro}</p>
          </div>
        </section>

        {/* 2. OVERLAP CONTENT SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative z-10 p-4 bg-white rounded-[3rem] shadow-2xl border border-slate-50 -rotate-2">
                <img
                  src={about.image}
                  alt="A carefully composed perfume bottle"
                  className="rounded-[2.5rem] w-full h-125 object-cover"
                />
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{about.storyTitle}</h2>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-lg">
                {(about.storyParagraphs || []).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                 <div className="bg-white p-6 rounded-3xl border border-slate-100">
                    <p className="text-3xl font-black text-[#1A56DB]">Fine</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fragrance notes</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100">
                    <p className="text-3xl font-black text-[#0D9488]">You</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Your signature</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CORE PILLARS (Mission/Vision/Values) */}
        {/* <section className="bg-black py-32">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
            {[
              { icon: <Target01Icon />, title: "Our point of view", text: "Scent is personal. The right one should feel like it was always yours.", color: "text-blue-400" },
              { icon: <ViewIcon />, title: "Our edit", text: "A considered collection of distinctive scents for every mood and moment.", color: "text-teal-400" },
              { icon: <CleanIcon />, title: "Our promise", text: "Thoughtful service from discovery through delivery.", color: "text-rose-400" }
            ].map((pillar, i) => (
              <div key={i} className="group p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all">
                <div className={`${pillar.color} mb-6 transform group-hover:scale-110 transition-transform`}>
                   {React.cloneElement(pillar.icon, { size: 40, variant: "bulk" })}
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{pillar.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* 4. WHY CHOOSE US - BENTO GRID */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <h2 className="text-center text-4xl font-black text-slate-900 mb-16 tracking-tighter">The  Israr Elixir experience</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['A considered collection', 'Gifting made simple', 'Secure checkout', 'Careful delivery'].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-4xl border border-slate-100 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="p-3 bg-blue-50 text-[#1A56DB] rounded-2xl">
                   <CheckmarkBadge01Icon size={24} variant="bulk" />
                </div>
                <span className="font-black text-slate-800 tracking-tight">{feature}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

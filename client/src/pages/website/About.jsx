import React from 'react';
import { Award, ShieldCheck, Heart, User, CheckCircle } from 'lucide-react';

const About = () => {
  const certifications = [
    { title: "DDA Pharmacy License", issuer: "Department of Drug Administration, Nepal", details: "License No: 40321-A. Fully authorized to store, compound, and dispense Schedule drugs." },
    { title: "Nepal Pharmacy Council Registration", issuer: "Nepal Pharmacy Council (NPC)", details: "Registered under qualified clinical pharmacist credentials." },
    { title: "Panchkhal Municipality Registration", issuer: "Kavre District Health Division", details: "Certified to operate emergency first-aid and medical checkup camps." }
  ];

  return (
    <div className="space-y-16 pb-20 animate-fade-in font-sans">
      
      {/* 1. Header Grid */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-text-primary dark:text-white tracking-tight">
          About Grace Medical Hall
        </h1>
        <p className="text-text-secondary dark:text-slate-300">
          Serving Kavre with pharmacy excellence, clinical consultation, and genuine medical care since 2018.
        </p>
      </section>

      {/* 2. Founders Profile */}
      <section className="grid md:grid-cols-5 gap-12 items-center">
        
        {/* Founder Bio */}
        <div className="md:col-span-3 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold dark:bg-sky-500/10 dark:text-sky-400">
            <User className="h-4 w-4" />
            <span>Founder & Senior Pharmacist</span>
          </div>
          <h2 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">
            Hari Bahadur Parajuli
          </h2>
          <p className="text-text-secondary dark:text-slate-300 leading-relaxed">
            With over 15 years of clinical pharmacy practice, Hari Bahadur Parajuli founded Grace Medical Hall in Panchkhal to bridge the gap between quality medication and rural healthcare access. He has been a champion of safe dispensing guidelines in Kavre district.
          </p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 text-primary dark:text-sky-400 shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary dark:text-slate-300">Registered Pharmacist under Nepal Pharmacy Council.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 text-primary dark:text-sky-400 shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary dark:text-slate-300">Advocate for clinical safety, patient counselling, and community health checks.</p>
            </div>
          </div>
        </div>

        {/* Founder Illustration/Card */}
        <div className="md:col-span-2 glass-card p-8 text-center space-y-4 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-sky-400">
            <User className="h-12 w-12" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white">Hari B. Parajuli</h3>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold">Founder, Pharmacist</p>
          </div>
          <p className="text-xs text-text-secondary dark:text-slate-400 italic">
            "We believe that medical dispensing is a trust and responsibility. Our goal is to ensure every patient goes home with the right medicine and correct knowledge."
          </p>
        </div>
      </section>

      {/* 3. Certifications and Standards */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">
            Our Certifications & Approvals
          </h2>
          <p className="text-sm text-text-secondary dark:text-slate-400">
            We adhere to rigorous pharmacy standards regulated by Nepal drug authorities.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {certifications.map((cert, index) => (
            <div key={index} className="glass-card p-6 border border-slate-100 dark:border-slate-800 space-y-4 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
                <Award className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-text-primary dark:text-white">{cert.title}</h3>
                <p className="text-[10px] font-bold text-primary dark:text-sky-400 uppercase tracking-wide">{cert.issuer}</p>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">{cert.details}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="rounded-3xl bg-brandBg dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 sm:p-12 grid md:grid-cols-3 gap-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-text-primary dark:text-white pt-2">Integrity First</h3>
          <p className="text-xs text-text-secondary dark:text-slate-400">We source only WHO-GMP certified medicines from accredited local and international manufacturers.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-soft">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-text-primary dark:text-white pt-2">Patient Care</h3>
          <p className="text-xs text-text-secondary dark:text-slate-400">Customized counselling, dosage instructions, side-effect checks, and direct followup support.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-soft">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-text-primary dark:text-white pt-2">Continuous Learning</h3>
          <p className="text-xs text-text-secondary dark:text-slate-400">Keeping track of pharmacological updates and upgrading our storage cold chains for vaccines.</p>
        </div>
      </section>

    </div>
  );
};

export default About;

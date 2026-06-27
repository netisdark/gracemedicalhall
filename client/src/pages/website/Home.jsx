import React from 'react';
import { Phone, Calendar, ShieldCheck, Award, Star, MessageSquare, MapPin, ArrowRight } from 'lucide-react';

const Home = ({ setActiveSection }) => {
  const reviews = [
    { name: "Rabina Shrestha", role: "Local Resident", comment: "Excellent pharmacy! The staff is incredibly helpful, and they always have the medicines we need for our family in Panchkhal.", rating: 5 },
    { name: "Dr. Ramesh Adhikari", role: "Medical Practitioner", comment: "Grace Medical Hall maintains strict storage guidelines and inventory quality. Their commitment to authentic medicines is commendable.", rating: 5 },
    { name: "Niranjan Danuwar", role: "Regular Customer", comment: "Very polite behavior and prompt response. The WhatsApp ordering system is very convenient for senior citizens.", rating: 5 }
  ];

  return (
    <div className="space-y-20 pb-20 animate-fade-in font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-light/40 via-brandBg to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12 lg:p-16 border border-white/40 dark:border-slate-800 shadow-soft">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold dark:bg-sky-500/10 dark:text-sky-400">
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Trusted Pharmacy & Clinic in Kavre</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary dark:text-white tracking-tight leading-tight">
            Your Health Is Our <span className="text-primary bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent dark:from-sky-400 dark:to-sky-300">Grace & Priority</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary dark:text-slate-300 leading-relaxed max-w-xl">
            Providing high-quality prescription medicines, essential healthcare supplies, and clinic consultation services to the Panchkhal community.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="https://wa.me/9779841234567?text=Hello%20Grace%20Medical%20Hall,%20I%20have%20an%20inquiry%20about..."
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all shadow-lg shadow-green-500/20 active:scale-95"
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Order via WhatsApp
            </a>
            <button 
              onClick={() => setActiveSection('contact')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-white font-bold text-sm transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
            >
              <span>Contact Us</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. About Clinic Summary */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">
            Caring for Panchkhal Since 2018
          </h2>
          <p className="text-text-secondary dark:text-slate-300 leading-relaxed">
            Grace Medical Hall is more than just a retail pharmacy. We are a dedicated healthcare checkpoint providing medical consultations, OTC guidance, diagnostic support, and home-delivery of medications throughout Kavre district.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-2xl font-extrabold text-primary dark:text-sky-400">100%</span>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold mt-1">Authentic Medicines</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-2xl font-extrabold text-primary dark:text-sky-400">5000+</span>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold mt-1">Happy Patients Served</p>
            </div>
          </div>
        </div>
        
        {/* Features list */}
        <div className="space-y-4">
          <div className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary dark:text-white">Registered Pharmacists</h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">All prescriptions are checked and dispensed by qualified pharmacists.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary dark:text-white">DDA Approved Standards</h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">Fully registered and certified by the Department of Drug Administration (DDA), Nepal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Opening Hours & Local Map */}
      <section className="grid md:grid-cols-3 gap-8">
        
        {/* Hours Card */}
        <div className="glass-card p-6 md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400 mb-4">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">Opening Hours</h3>
            <p className="text-xs text-text-secondary dark:text-slate-400 mb-6">We are open 7 days a week to serve you.</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-slate-400 font-medium">Sunday - Friday</span>
                <span className="font-bold text-text-primary dark:text-white">7:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-slate-400 font-medium">Saturday</span>
                <span className="font-bold text-text-primary dark:text-white">8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between text-sm text-green-500 font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>Emergency Services</span>
                <span>24/7 on Call</span>
              </div>
            </div>
          </div>

          <a 
            href="tel:+97711400123" 
            className="flex items-center justify-center gap-2 mt-8 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-sky-400 font-bold text-sm transition-all"
          >
            <Phone className="h-4 w-4" />
            Call Emergency: +977-11-400123
          </a>
        </div>

        {/* Map Embed */}
        <div className="glass-card overflow-hidden md:col-span-2 min-h-[300px] relative border border-slate-100 dark:border-slate-800 shadow-soft">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14134.184319401777!2d85.597658!3d27.671043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3534.6293529367123!2d85.602658!3d27.669043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full grayscale dark:invert"
            title="Google Maps Location - Panchkhal-12, Kavre, Nepal"
          ></iframe>
          <div className="absolute bottom-4 left-4 glass-panel p-3.5 rounded-xl border border-white/20 shadow-lg text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-text-primary">
              <MapPin className="h-4 w-4 text-primary" />
              Panchkhal-12, Kavre
            </p>
            <p className="text-[10px] text-text-secondary">Main highway checkpoint, Panchkhal, Nepal</p>
          </div>
        </div>
      </section>

      {/* 4. Testimonials / Reviews */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">
            What Our Patients Say
          </h2>
          <p className="text-sm text-text-secondary dark:text-slate-400">
            Reviews from residents of Kavre and Panchkhal who visit us for healthcare.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary dark:text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary dark:text-white">{rev.name}</span>
                <span className="text-[10px] text-text-secondary dark:text-slate-400 font-semibold">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;

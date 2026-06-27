import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error('Please provide a name and message.');
      return;
    }
    setLoading(true);
    // Simulate API contact request
    setTimeout(() => {
      toast.success('Your message was sent! The Grace Medical Hall team will contact you.');
      setForm({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-16 pb-20 animate-fade-in font-sans">
      
      {/* 1. Header */}
      <section className="text-center space-y-4 max-w-xl mx-auto">
        <h1 className="text-4xl font-extrabold text-text-primary dark:text-white tracking-tight">
          Contact Us
        </h1>
        <p className="text-text-secondary dark:text-slate-300">
          Have an inquiry, need to order medicines, or want to consult with our pharmacist? Reach out to us.
        </p>
      </section>

      {/* 2. Grid Content */}
      <section className="grid md:grid-cols-5 gap-12">
        
        {/* Contact details */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
              Grace Medical Hall
            </h2>
            <p className="text-sm text-text-secondary dark:text-slate-400">Panchkhal-12, Kavre, Nepal</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-text-primary dark:text-white">Our Address</p>
                <p className="text-xs text-text-secondary dark:text-slate-400">Panchkhal Highway Checkpoint, Kavre, Nepal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-text-primary dark:text-white">Phone Numbers</p>
                <p className="text-xs text-text-secondary dark:text-slate-400">+977-11-400123 (Landline) | +977-9841234567</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-text-primary dark:text-white">Email Address</p>
                <p className="text-xs text-text-secondary dark:text-slate-400">info@gracemedicalhall.com.np</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-brandBg dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-text-primary dark:text-white flex items-center gap-2 text-sm">
              <HeartHandshake className="h-4.5 w-4.5 text-primary" />
              Prescription Orders
            </h3>
            <p className="text-xs text-text-secondary dark:text-slate-400 leading-relaxed">
              You can instantly send photo of your prescription directly via WhatsApp. Our team will verify and prepare your dosage.
            </p>
            <a 
              href="https://wa.me/9779841234567?text=Hi%20Grace%20Medical%20Hall,%20I'm%20attaching%20my%20prescription..."
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-green-500 hover:text-green-600 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Open WhatsApp Chat &rarr;
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3 glass-card p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Send an Online Inquiry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ram Bahadur"
                className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. ram@gmail.com"
                className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Your Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="4"
                placeholder="Write your request, required medicines, or questions..."
                className="w-full p-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Contact;

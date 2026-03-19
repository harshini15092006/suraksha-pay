import { Link } from 'react-router-dom';
import { Shield, Zap, CloudRain, Thermometer, Wind, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: CloudRain, title: 'Rain Trigger', desc: 'Auto-payout when rainfall exceeds 10mm/hr — no claim filing' },
  { icon: Thermometer, title: 'Heat Trigger', desc: 'Covered when temperature crosses 40°C — stay safe' },
  { icon: Wind, title: 'AQI Trigger', desc: 'Payout when air quality turns hazardous — your lungs matter' },
];

const STATS = [
  { value: '2.5L+', label: 'Gig Workers Protected' },
  { value: '₹4.2Cr', label: 'Payouts Disbursed' },
  { value: '< 5 min', label: 'Auto Claim Time' },
  { value: '₹20/wk', label: 'Starting Premium' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-body">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">SurakshaPay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Protected</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-8">
            <Zap size={14} className="text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">AI-Powered Parametric Insurance</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            No Rain, No Pay?<br />
            <span className="gradient-text">We've Got You Covered.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SurakshaPay protects Zomato, Swiggy & gig delivery workers from income loss 
            during extreme weather. <strong className="text-white">Automatic payouts. No claim forms. Ever.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start for ₹20/week <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="card text-center py-6">
              <div className="font-display text-2xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-3">How Parametric Insurance Works</h2>
          <p className="text-gray-400">No paperwork. No waiting. Just automatic protection.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Register & Get Priced', desc: 'Our AI analyses your city, platform and weather patterns to generate your weekly premium.' },
            { step: '02', title: 'Pay ₹20–₹90/week', desc: 'Ultra-affordable coverage, priced dynamically. Pay once, protected all week.' },
            { step: '03', title: 'Auto Payout Triggers', desc: 'When rain, heat or AQI crosses thresholds — funds hit your account. Zero action needed.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="card-glow relative overflow-hidden">
              <div className="absolute top-4 right-4 font-mono text-5xl font-bold text-dark-600">{step}</div>
              <div className="relative">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(249,115,22,0.3)]">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Triggers */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-3">3 Parametric Triggers</h2>
          <p className="text-gray-400">Real-time data from Open-Meteo — triggers fire the moment conditions are met</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-glow p-8">
              <div className="w-12 h-12 bg-brand-500/15 border border-brand-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="card-glow bg-gradient-to-br from-dark-800 to-dark-700 border-brand-500/20 text-center py-16">
          <TrendingUp size={40} className="text-brand-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Your earnings deserve protection
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of gig workers across Mumbai, Delhi, Bangalore and more who never lose a day's income to bad weather again.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Get Protected Today — ₹20/week <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-8 text-center text-sm text-gray-600">
        <p>© 2024 SurakshaPay — Built for India's 15 Crore Gig Workers</p>
        <p className="mt-1 font-mono text-xs">Hackathon Project · AI + Parametric Insurance</p>
      </footer>
    </div>
  );
}

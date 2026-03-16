import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Truck, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { AnimatedHeroBackground } from '@/components/ui/AnimatedHeroBackground';
import { HeroIllustration } from '@/components/ui/HeroIllustration';
import { HeroActions } from '@/components/ui/HeroActions';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <section className="relative pt-20 pb-32 overflow-hidden isolate min-h-[600px] flex items-center">
          <AnimatedHeroBackground />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 space-y-8 text-center lg:text-left mt-8 lg:mt-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-bold border border-primary-100 mb-2">
                  <ShieldCheck className="h-4 w-4" /> Trusted Healthcare Partner
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                  Modern Healthcare, <br />
                  <span className="text-primary-600">Delivered to You.</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
                  Access thousands of prescription drugs and healthcare products from verified 
                  pharmacies. Fast, secure, and right to your doorstep.
                </p>

                {/* Search Bar & CTAs */}
                <div className="space-y-4 max-w-2xl mx-auto lg:mx-0">
                  <div className="bg-white p-2 rounded-2xl shadow-xl shadow-primary-900/5 border border-slate-100 flex items-center">
                    <div className="flex-grow flex items-center px-4">
                      <Search className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Search medicines, vitamins..." 
                        className="w-full py-3 focus:outline-none text-slate-700 bg-transparent"
                      />
                    </div>
                    <Button variant="primary" size="lg" className="rounded-xl px-8 hidden sm:block shadow-md">
                      Search
                    </Button>
                  </div>
                  
                  <HeroActions />
                </div>

                <div className="flex justify-center lg:justify-start items-center gap-6 pt-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-secondary-500" />
                    Verified Pharmacies
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary-500" />
                    Fast Delivery
                  </div>
                </div>
              </div>

              {/* Hero Image Area */}
              <div className="lg:w-1/2 relative hidden md:block">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-slate-600">Get your medicines delivered securely in four simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Search & Find', desc: 'Browse our catalog or upload your prescription directly.', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', borderHover: 'hover:border-blue-200', shadowHover: 'hover:shadow-blue-900/5' },
                { title: 'Verify & Order', desc: 'Pharmacists review prescriptions and confirm availability.', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', borderHover: 'hover:border-indigo-200', shadowHover: 'hover:shadow-indigo-900/5' },
                { title: 'Secure Payment', desc: 'Pay safely using integrated local Ethiopian banking APIs.', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', borderHover: 'hover:border-green-200', shadowHover: 'hover:shadow-green-900/5' },
                { title: 'Fast Delivery', desc: 'Track your delivery agent in real-time right to your door.', icon: Clock, color: 'text-primary-600', bg: 'bg-primary-50', borderHover: 'hover:border-primary-200', shadowHover: 'hover:shadow-primary-900/5' }
              ].map((step, idx) => (
                <div key={idx} className={`relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all duration-300 group text-center z-10 hover:-translate-y-2 hover:shadow-2xl ${step.shadowHover} ${step.borderHover}`}>
                  {/* Subtle hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
                  
                  <div className={`relative w-16 h-16 mx-auto rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-inner`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="relative text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">{step.title}</h3>
                  <p className="relative text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-primary-600 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between bg-primary-700/50 rounded-3xl p-8 md:p-12 border border-primary-500 shadow-inner">
               <div className="text-white mb-8 md:mb-0 max-w-2xl">
                 <h2 className="text-3xl font-bold mb-4">Are you a Pharmacy Owner?</h2>
                 <p className="text-primary-100 text-lg">
                   Join our growing network to reach more customers, easily manage 
                   inventory, and process prescriptions digitally securely.
                 </p>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                 <Link href="/register" className="w-full md:w-auto">
                   <Button variant="secondary" size="lg" className="w-full md:w-auto shadow-xl">
                     Partner With Us
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

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
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary-600/20">
                      Order Medicine
                    </Button>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl bg-white hover:bg-slate-50 border-slate-200">
                      <FileText className="h-5 w-5 mr-2" />
                      Upload Prescription
                    </Button>
                  </div>
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
                <div className="relative w-full aspect-square max-w-lg mx-auto bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-primary-900/10 border border-white flex items-center justify-center overflow-visible">
                  
                  {/* Mock UI overlapping for visual interest */}
                  <div className="absolute top-12 -right-8 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-20 flex items-center gap-4 animate-bounce hover:scale-105 transition-transform" style={{ animationDuration: '3s' }}>
                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Order Status</p>
                      <p className="text-sm font-bold text-slate-900">Out for Delivery</p>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-24 -left-12 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-20 flex items-center gap-4 max-w-[260px] animate-bounce hover:scale-105 transition-transform" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                     <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                       <MapPin className="h-6 w-6 text-primary-600" />
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 mb-1">Delivering to</p>
                       <p className="text-sm font-bold text-slate-900 leading-tight">Bole Ruanda, Addis Ababa</p>
                     </div>
                  </div>

                  {/* Central App Mockup */}
                  <div className="w-[65%] h-[80%] bg-slate-50 rounded-[2rem] border-4 border-white shadow-inner relative overflow-hidden flex flex-col">
                    <div className="bg-primary-600 p-4 text-white text-center font-bold shadow-md relative z-10">
                      TenaCare App
                    </div>
                    <div className="p-4 space-y-3 relative z-10">
                       <div className="h-24 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center p-3 gap-3">
                         <div className="h-16 w-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg shrink-0"></div>
                         <div className="space-y-2 flex-1">
                           <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                           <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                         </div>
                       </div>
                       <div className="h-24 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center p-3 gap-3">
                         <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg shrink-0"></div>
                         <div className="space-y-2 flex-1">
                           <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                           <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                         </div>
                       </div>
                    </div>
                    {/* Soft glowing background in the mockup */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary-100/50 to-transparent pointer-events-none"></div>
                  </div>

                </div>
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
                 <Button variant="secondary" size="lg" className="w-full md:w-auto shadow-xl">
                   Partner With Us
                 </Button>
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

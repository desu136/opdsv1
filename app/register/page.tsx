'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pill, Mail, Lock, User, Phone, Briefcase, ArrowRight, ShieldCheck, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useAuth } from '@/components/providers/AuthProvider';

export default function RegisterPage() {
  const [role, setRole] = useState<'customer'|'pharmacy'|'agent'>('customer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pharmacyName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    password: ''
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let licenseUrl = '';

      if (role === 'pharmacy') {
        if (!licenseFile) {
          throw new Error('Please upload your pharmacy license');
        }

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', licenseFile);
        uploadFormData.append('folder', 'licenses');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadRes.ok) throw new Error('Failed to upload license document');
        const uploadData = await uploadRes.json();
        licenseUrl = uploadData.url;
        setIsUploading(false);
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: role === 'pharmacy' ? 'PHARMACIST' : role === 'agent' ? 'DELIVERY_AGENT' : 'CUSTOMER',
          ...formData,
          licenseDocumentUrl: licenseUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login?registered=true');

    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Output - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12">
        
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 mb-10 w-fit">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            EthioPharma
          </span>
        </Link>
        
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create an Account</h1>
          <p className="text-slate-500 mb-6">Join our network to get access to fast, reliable health solutions.</p>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${role === 'customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Customer
            </button>
            <button
              onClick={() => setRole('agent')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${role === 'agent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Agent
            </button>
            <button
              onClick={() => setRole('pharmacy')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${role === 'pharmacy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pharmacy
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {role === 'pharmacy' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 block">Pharmacy Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="pharmacyName"
                        value={formData.pharmacyName}
                        onChange={handleChange}
                        required
                        placeholder="Enter licensed pharmacy name"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 block">EFDA License Number</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g. EFDA-8923-23"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 block">Upload Operating License</label>
                    <div className="relative flex items-center justify-center w-full px-4 py-6 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                       <input 
                         type="file" 
                         required 
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                         accept=".pdf,.jpg,.jpeg,.png"
                         onChange={handleFileChange}
                       />
                       <div className="text-center">
                         <div className="bg-white p-2 rounded-full shadow-sm w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                           {licenseFile ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <FileText className="h-5 w-5 text-primary-500" />}
                         </div>
                         <p className="text-sm text-slate-700 font-medium">
                           {licenseFile ? licenseFile.name : 'Click to upload license'}
                         </p>
                         <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                       </div>
                    </div>
                  </div>
                </>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 block">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange} 
                        required
                        placeholder="Abebe"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 block">Last Name</label>
                    <div className="relative">
                      <input 
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange} 
                        required
                        placeholder="Kebede"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
             )}

             <div className="space-y-1">
               <label className="text-sm font-semibold text-slate-700 block">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                 <input 
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange} 
                   required
                   placeholder="you@example.com"
                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
               </div>
             </div>
             
             <div className="space-y-1">
               <label className="text-sm font-semibold text-slate-700 block">Phone Number</label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                 <input 
                   type="text"
                   name="phone"
                   value={formData.phone}
                   onChange={handleChange} 
                   required
                   placeholder="+251 9..."
                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
               </div>
             </div>

             <div className="space-y-1">
               <label className="text-sm font-semibold text-slate-700 block">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                 <input 
                   type="password"
                   name="password"
                   value={formData.password}
                   onChange={handleChange} 
                   required
                   placeholder="••••••••"
                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
               </div>
               <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters</p>
             </div>

             {error && (
               <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg flex items-center gap-2">
                 <AlertCircle className="h-4 w-4" />
                 {error}
               </div>
             )}

              <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl py-4 mt-4" disabled={isLoading || isUploading}>
                {isUploading ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Uploading License...</>
                ) : isLoading ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Creating Account...</>
                ) : (
                  <>Create Account <ArrowRight className="h-5 w-5 ml-2" /></>
                )}
              </Button>

             <p className="text-xs text-center text-slate-500 leading-relaxed mt-4">
               By clicking "Create Account", you agree to our <Link href="/terms" className="text-primary-600 font-medium">Terms of Service</Link> and <Link href="/privacy" className="text-primary-600 font-medium">Privacy Policy</Link>.
             </p>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
             Already have an account? <Link href="/login" className="font-bold text-primary-600 hover:text-primary-700">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Right side - Decoration */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
         <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
         
         <div className="relative z-10 max-w-md px-8 text-center">
            <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-2xl">
               <ShieldCheck className="h-16 w-16 text-primary-400 mx-auto mb-6" />
               <h3 className="text-2xl font-bold text-white mb-4">A Network Built on Trust.</h3>
               <p className="text-slate-300 leading-relaxed mb-8">
                 We verify all pharmacies and delivery agents on our platform. Your health information is encrypted and securely stored.
               </p>
               <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-8 mt-8 text-left">
                  <div>
                    <h4 className="text-4xl font-black text-white mb-1">500+</h4>
                    <p className="text-sm text-slate-400">Verified Pharmacies</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-black text-white mb-1">20k+</h4>
                    <p className="text-sm text-slate-400">Active Patients</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// // src/pages/Landing.tsx
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useNavigate } from 'react-router-dom';
// import { Send } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// const step1Schema = z.object({
//   applywizz_id: z.string().min(1, 'Applywizz ID is required'),
//   email: z.string().email('Please enter a valid email'),
//   phone: z.string().min(7, 'Please enter a valid phone number')
// });

// type FormVals = z.infer<typeof step1Schema>;

// const Landing: React.FC = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const { authorize } = useAuth(); // Use the authorize function

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//     clearErrors,
//   } = useForm<FormVals>({
//     resolver: zodResolver(step1Schema),
//     defaultValues: {
//       applywizz_id: 'AWL-', // Set default value to "AWL-"
//     }
//   });

//   const cleanPhone = (s: string) => s.replace(/[^\d+]/g, '');

//   const onSubmit = async (data: FormVals) => {
//     setIsLoading(true);
//     clearErrors();

//     // Trim leading/trailing spaces for the fields
//     const trimmedData = {
//       ...data,
//       applywizz_id: data.applywizz_id.trim(),
//       email: data.email.trim(),
//       phone: data.phone.trim(),
//     };

//     try {
//       console.log('Trimmed Data:', trimmedData);
//       // 1) sales_closure match (lead_id + email)
//       const { data: sc, error: scErr } = await supabase
//         .from('sales_closure')
//         .select('id, lead_id, email')
//         .eq('lead_id', trimmedData.applywizz_id)
//         .eq('email', trimmedData.email)
//         .limit(1)
//         .maybeSingle();

//       if (scErr) throw scErr;
//       if (!sc) {
//         setError('applywizz_id', { message: 'No sale found for this ID & email.' });
//         setIsLoading(false);
//         return;
//       }

//       // 2) leads phone match (business_id === applywizz_id)
//       const { data: lead, error: leadErr } = await supabase
//         .from('leads')
//         .select('phone, name')
//         .eq('business_id', trimmedData.applywizz_id)
//         .limit(1)
//         .maybeSingle();

//       if (leadErr) throw leadErr;
//       if (!lead?.phone) {
//         setError('phone', { message: 'Could not verify phone for this ID.' });
//         setIsLoading(false);
//         return;
//       }

//       if (cleanPhone(lead.phone) !== cleanPhone(trimmedData.phone)) {
//         setError('phone', { message: 'Phone number does not match our records.' });
//         setIsLoading(false);
//         return;
//       }

//       // 3) limit check (client_onborading_details: personal_email count < 2)
//       // const { count, error: cntErr } = await supabase
//       //   .from('client_onborading_details')
//       //   .select('id', { count: 'exact', head: true })
//       //   .eq('personal_email', trimmedData.email);

//       // if (cntErr) throw cntErr;
//       // if ((count ?? 0) >= 2) {
//       //   setError('email', { message: 'You have already submitted this form twice.' });
//       //   setIsLoading(false);
//       //   return;
//       // }


//       // 3) limit check based on lead_id and no_of_times_form_filled < 3
// const { data: existingForm, error: formErr } = await supabase
//   .from('client_onborading_details')
//   .select('no_of_times_form_filled')
//   .eq('lead_id', trimmedData.applywizz_id)
//   .maybeSingle();

// if (formErr) throw formErr;

// if (existingForm && existingForm.no_of_times_form_filled >= 2) {
//   setError('applywizz_id', { message: 'You have reached the form submission limit (2 times).' });
//   setIsLoading(false);
//   return;
// }

//       // 4) All good → authorize the user and go to onboarding
//       authorize(); // Set the user as authorized
//       navigate('/onboarding', {
//         state: {
//           verified: {
//             applywizz_id: trimmedData.applywizz_id,
//             email: trimmedData.email,
//             phone: trimmedData.phone,
//           },
//         },
//         replace: true,
//       });
//     } catch (err: any) {
//       console.error(err);
//       setError('applywizz_id', { message: 'Something went wrong. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
//       <div className="relative w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center space-x-2 mb-4">
//             <img 
//               src="/applywizz_logo-with_text.png" 
//               alt="Applywizz Logo" 
//               className="h-16 w-auto"
//             />
//           </div>
//           <p className="text-muted-foreground">Access your personalized onboarding experience</p>
//         </div>

//         <div className="glass-card p-6 space-y-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <h5 className='text-slate-500'>Enter the details you used while subscribing.</h5>
//             <div>
//               <Label htmlFor="applywizz_id">Applywizz ID <span className='text-red-700'>*</span></Label>
//               <Input
//                 id="applywizz_id"
//                 placeholder="e.g : AWL-XXX"
//                 {...register('applywizz_id')}
//                 required
//                 className="mt-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-ring"
//               />
//               {errors.applywizz_id && <p className="text-sm text-destructive mt-1">{errors.applywizz_id.message}</p>}
//             </div>

//             <div>
//               <Label htmlFor="email">Email used at subscribing <span className='text-red-700'>*</span></Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="your@email.com"
//                 {...register('email')}
//                 required
//                 className="mt-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-ring"
//               />
//               {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
//             </div>

//             <div>
//               <Label htmlFor="phone">Phone number used at subscribing <span className='text-red-700'>*</span></Label>
//               <Input
//                 id="phone"
//                 placeholder="+1 6xxxx xxxxx"
//                 {...register('phone')}
//                 required
//                 className="mt-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-ring"
//               />
//               {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
//             </div>

//             <Button type="submit" disabled={isLoading} className="w-full btn-primary">
//               {isLoading ? (
//                 <div className="flex items-center space-x-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
//                   <span>Validating…</span>
//                 </div>
//               ) : (
//                 <>
//                   <Send className="w-4 h-4 mr-2" />
//                   Continue
//                 </>
//               )}
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Landing;









// src/pages/Landing.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Send, Mail, Hash, AlertCircle, Loader2, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Controller } from 'react-hook-form';

const step1Schema = z.object({
  applywizz_id: z.string().min(1, 'Applywizz ID is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number')
});

type FormVals = z.infer<typeof step1Schema>;

const Landing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [idTooltipOpen, setIdTooltipOpen] = useState(false);
  const [emailTooltipOpen, setEmailTooltipOpen] = useState(false);
  const [phoneTooltipOpen, setPhoneTooltipOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authorize, isAuthorized, videoUrl, setVideoUrl } = useAuth(); // Use the authorize function

  // Auto-redirect if already authorized
  useEffect(() => {
    if (isAuthorized) {
      if (videoUrl) {
        navigate('/resume-upload', { replace: true });
      } else {
        navigate('/video-validation', { replace: true });
      }
    }
  }, [isAuthorized, videoUrl, navigate]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormVals>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      applywizz_id: 'AWL-',
      phone: '',
    }
  });

  // --- Render Server Wakeup Logic ---
  const hasWokenUp = React.useRef(false);
  const handleWakeup = () => {
    if (hasWokenUp.current) return;
    hasWokenUp.current = true;
    
    const parserUrl = import.meta.env.VITE_RESUME_PARSER_URL || "http://localhost:8000/parse";
    const baseUrl = parserUrl.replace('/parse', '');
    
    fetch(baseUrl, { mode: 'no-cors' }).catch(() => {
      // Ignore errors, we just want to trigger the server wakeup
    });
  };

  // Normalize phone: strip all non-digit chars, then remove a leading "1" (US country code) if 11 digits
  const normalizePhone = (s: string) => {
    const digits = s.replace(/\D/g, ''); // keep only digits
    return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  };

  // Normalize AWL ID: trim surrounding spaces and remove all internal spaces
  const normalizeAwlId = (s: string) => s.trim().replace(/\s+/g, '');

  // Normalize email: trim, remove all spaces, and lowercase
  const normalizeEmail = (s: string) => s.trim().replace(/\s+/g, '').toLowerCase();

  const onSubmit = async (data: FormVals) => {
    setIsLoading(true);
    clearErrors();

    // Normalize all three fields before comparison
    const normalizedData = {
      ...data,
      applywizz_id: normalizeAwlId(data.applywizz_id),
      email: normalizeEmail(data.email),
      phone: normalizePhone(data.phone),
    };

    try {
      // console.log('Normalized Data:', normalizedData);
      // 1) sales_closure match — fetch by lead_id only, then compare email in JS (case-insensitive)
      const { data: sc, error: scErr } = await supabase
        .from('sales_closure')
        .select('id, lead_id, email')
        .eq('lead_id', normalizedData.applywizz_id)
        .limit(1)
        .maybeSingle();

      if (scErr) throw scErr;
      if (!sc || normalizeEmail(sc.email) !== normalizedData.email) {
        setError('applywizz_id', { message: 'No sale found for this ID & email.' });
        setIsLoading(false);
        return;
      }

      // 2) leads phone match (business_id === applywizz_id) — normalize DB phone the same way
      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .select('phone, name')
        .eq('business_id', normalizedData.applywizz_id)
        .limit(1)
        .maybeSingle();

      if (leadErr) throw leadErr;
      if (!lead?.phone) {
        setError('phone', { message: 'Could not verify phone for this ID.' });
        setIsLoading(false);
        return;
      }

      if (normalizePhone(lead.phone) !== normalizedData.phone) {
        setError('phone', { message: 'Phone number does not match our records.' });
        setIsLoading(false);
        return;
      }

      // 3) limit check (client_onborading_details: personal_email count < 2)
      // const { count, error: cntErr } = await supabase
      //   .from('client_onborading_details')
      //   .select('id', { count: 'exact', head: true })
      //   .eq('personal_email', trimmedData.email);

      // if (cntErr) throw cntErr;
      // if ((count ?? 0) >= 2) {
      //   setError('email', { message: 'You have already submitted this form twice.' });
      //   setIsLoading(false);
      //   return;
      // }


      // 3) limit check based on lead_id and no_of_times_form_filled < 3
      const { data: existingForm, error: formErr } = await supabase
        .from('client_onborading_details')
        .select('no_of_times_form_filled, video_url')
        .eq('lead_id', normalizedData.applywizz_id)
        .maybeSingle();

      if (formErr) throw formErr;

      if (existingForm && existingForm.no_of_times_form_filled >= 2) {
        setError('applywizz_id', { message: 'You have reached the form submission limit (2 times).' });
        setIsLoading(false);
        return;
      }

      // 4) All good → authorize the user and go to onboarding
      authorize({
        applywizz_id: normalizedData.applywizz_id,
        email: normalizedData.email,
        phone: normalizedData.phone,
        name: lead?.name || "",
      }); // Set the user as authorized and persist their info

      const finalVideoUrl = existingForm?.video_url || localStorage.getItem('onboarding_video_url');
      if (finalVideoUrl) {
        setVideoUrl(finalVideoUrl);
        navigate('/resume-upload', { replace: true });
      } else {
        navigate('/video-validation', { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError('applywizz_id', { message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      
      {/* Blurry decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1F4096]/5 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00D2C4]/5 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden relative">
          
          {/* Top Gradient Bar */}
          <div className="h-[4px] w-full bg-gradient-to-r from-[#1F4096] via-[#1F4096] to-[#00D2C4]" />

          <div className="p-8">
            {/* Logo and Header */}
            <div className="flex flex-col items-center mb-6">
              <img
                src="/applywizz_logo-with_text.png"
                alt="Applywizz Logo"
                className="h-14 w-auto object-contain hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                <span className="w-1.5 h-1.5 bg-[#1F4096] rounded-full animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-wider text-[#1F4096] uppercase">Secure Access Portal</span>
              </div>
            </div>

            <div className="space-y-1 mb-6 text-center">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Onboarding Verification</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                Enter your subscription details to start or resume your personalized onboarding.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Applywizz ID Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="applywizz_id" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Applywizz ID <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip open={idTooltipOpen} onOpenChange={setIdTooltipOpen}>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        onMouseEnter={() => setIdTooltipOpen(true)}
                        onMouseLeave={() => setIdTooltipOpen(false)}
                        onClick={() => setIdTooltipOpen(!idTooltipOpen)}
                        className="flex items-center justify-center bg-slate-950 text-white rounded-full w-4 h-4 shadow-sm hover:bg-[#1F4096] hover:scale-105 active:scale-95 transition-all duration-200 cursor-help outline-none border border-slate-800"
                      >
                        <span className="text-[9px] font-extrabold leading-none font-sans relative -top-[0.5px]">i</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      align="center" 
                      className="bg-slate-950 text-slate-100 border border-slate-800 p-3 max-w-[280px] shadow-2xl rounded-lg text-xs leading-relaxed z-[100]"
                      sideOffset={6}
                    >
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-[#00D2C4] mt-0.5 flex-shrink-0" />
                        <p>Enter the Applywizz ID from your welcome/subscription confirmation email (starts with AWL-).</p>
                      </div>
                      <TooltipPrimitive.Arrow className="fill-slate-950" width={10} height={5} />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1F4096] transition-colors">
                    <Hash className="h-4 w-4" />
                  </div>
                  <Input
                    id="applywizz_id"
                    placeholder="e.g. AWL-12345"
                    {...register('applywizz_id')}
                    onFocus={() => {
                      handleWakeup();
                      setIdTooltipOpen(true);
                    }}
                    onBlur={() => setIdTooltipOpen(false)}
                    onKeyDown={handleWakeup}
                    required
                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1F4096] focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
                {errors.applywizz_id && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errors.applywizz_id.message}</span>
                  </div>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="email" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip open={emailTooltipOpen} onOpenChange={setEmailTooltipOpen}>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        onMouseEnter={() => setEmailTooltipOpen(true)}
                        onMouseLeave={() => setEmailTooltipOpen(false)}
                        onClick={() => setEmailTooltipOpen(!emailTooltipOpen)}
                        className="flex items-center justify-center bg-slate-950 text-white rounded-full w-4 h-4 shadow-sm hover:bg-[#1F4096] hover:scale-105 active:scale-95 transition-all duration-200 cursor-help outline-none border border-slate-800"
                      >
                        <span className="text-[9px] font-extrabold leading-none font-sans relative -top-[0.5px]">i</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      align="center" 
                      className="bg-slate-950 text-slate-100 border border-slate-800 p-3 max-w-[280px] shadow-2xl rounded-lg text-xs leading-relaxed z-[100]"
                      sideOffset={6}
                    >
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-[#00D2C4] mt-0.5 flex-shrink-0" />
                        <p>Enter the exact email address you used when subscribing to Applywizz.</p>
                      </div>
                      <TooltipPrimitive.Arrow className="fill-slate-950" width={10} height={5} />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1F4096] transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    onFocus={() => setEmailTooltipOpen(true)}
                    onBlur={() => setEmailTooltipOpen(false)}
                    required
                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1F4096] focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="phone" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip open={phoneTooltipOpen} onOpenChange={setPhoneTooltipOpen}>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        onMouseEnter={() => setPhoneTooltipOpen(true)}
                        onMouseLeave={() => setPhoneTooltipOpen(false)}
                        onClick={() => setPhoneTooltipOpen(!phoneTooltipOpen)}
                        className="flex items-center justify-center bg-slate-950 text-white rounded-full w-4 h-4 shadow-sm hover:bg-[#1F4096] hover:scale-105 active:scale-95 transition-all duration-200 cursor-help outline-none border border-slate-800"
                      >
                        <span className="text-[9px] font-extrabold leading-none font-sans relative -top-[0.5px]">i</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      align="center" 
                      className="bg-slate-950 text-slate-100 border border-slate-800 p-3 max-w-[280px] shadow-2xl rounded-lg text-xs leading-relaxed z-[100]"
                      sideOffset={6}
                    >
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-[#00D2C4] mt-0.5 flex-shrink-0" />
                        <p>Enter the phone number you registered during subscription.</p>
                      </div>
                      <TooltipPrimitive.Arrow className="fill-slate-950" width={10} height={5} />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="phone-input-container">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        country={'us'}
                        value={value}
                        onChange={onChange}
                        enableSearch={true}
                        placeholder="Enter phone number"
                        onFocus={() => setPhoneTooltipOpen(true)}
                        onBlur={() => setPhoneTooltipOpen(false)}
                      />
                    )}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errors.phone.message}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 bg-gradient-to-r from-[#1F4096] to-[#15327c] hover:from-[#15327c] hover:to-[#102760] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] select-none flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Validating credentials…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </Button>
            </form>

            {/* Secure connection notice */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span>SSL Secured Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

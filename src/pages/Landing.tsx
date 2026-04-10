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
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const step1Schema = z.object({
  applywizz_id: z.string().min(1, 'Applywizz ID is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number')
});

type FormVals = z.infer<typeof step1Schema>;

const Landing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authorize } = useAuth(); // Use the authorize function

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormVals>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      applywizz_id: 'AWL-', // Set default value to "AWL-"
    }
  });

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
      console.log('Normalized Data:', normalizedData);
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
        .select('no_of_times_form_filled')
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
      }); // Set the user as authorized and persist their info
      navigate('/onboarding', {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);
      setError('applywizz_id', { message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <img
              src="/applywizz_logo-with_text.png"
              alt="Applywizz Logo"
              className="h-16 w-auto"
            />
          </div>
          <p className="text-muted-foreground">Access your personalized onboarding experience</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h5 className='text-slate-500'>Enter the details you used while subscribing.</h5>
            <div>
              <Label htmlFor="applywizz_id">Applywizz ID <span className='text-red-700'>*</span></Label>
              <Input
                id="applywizz_id"
                placeholder="e.g : AWL-XXX"
                {...register('applywizz_id')}
                required
                className="mt-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-ring"
              />
              {errors.applywizz_id && <p className="text-sm text-destructive mt-1">{errors.applywizz_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email used at subscribing <span className='text-red-700'>*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                required
                className="mt-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-ring"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone number used at subscribing <span className='text-red-700'>*</span></Label>
              <Input
                id="phone"
                placeholder="+1 6xxxx xxxxx"
                {...register('phone')}
                required
                className="mt-2 border-slate-300 focus:border-primary focus:ring-2 focus:ring-ring"
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full btn-primary">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  <span>Validating…</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Continue
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;

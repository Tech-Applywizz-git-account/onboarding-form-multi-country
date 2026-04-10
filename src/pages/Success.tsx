import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import successIcon from '@/assets/success-icon.png';

const Success: React.FC = () => {
  console.log('--- MOUNTING SUCCESS COMPONENT ---');
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1s' }} />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="glass-card p-8 text-center space-y-6">
          {/* Success Icon Section */}
          <div className="flex justify-center mb-2">
            <div className="relative group cursor-default">
              {/* Background Glows */}
              <div className="absolute inset-0 bg-success/20 blur-2xl rounded-full scale-150 animate-pulse" />
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-125 animate-bounce-subtle" />

              {/* The 3D Icon */}
              <div className="relative z-10 animate-float">
                <img
                  src={successIcon}
                  alt="Success"
                  className="w-32 h-32 object-contain rounded-full mix-blend-multiply filter drop-shadow-xl animate-in zoom-in-50 duration-700 ease-out-back"
                />
              </div>

              {/* Decorative Sparkles */}
              <div className="absolute -top-4 -right-4 animate-bounce-slow">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div className="absolute -bottom-2 -left-4 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>

              {/* Enhanced Confetti Dots */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-2 h-2 bg-success rounded-full absolute -top-2 left-1/4 animate-ping" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 -right-4 animate-ping" style={{ animationDelay: '0.4s' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full absolute -bottom-2 right-1/4 animate-ping" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>

          {/* APPLYWIZZ Branding */}
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              APPLYWIZZ
            </h1>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Onboarding Complete! 🎉
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information has been successfully submitted to APPLYWIZZ.
              Our team will review your profile and reach out to you with
              personalized job opportunities.
            </p>
          </div>

          {/* What's Next */}
          <div className="glass-card p-4 bg-primary/5 border-primary/20 text-left space-y-3">
            <h3 className="font-semibold text-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              What's Next?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                <span>You'll receive a confirmation email within 24 hours</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-success flex-shrink-0" />
                <span>Our team will review your profile and match you with relevant jobs</span>
              </li>
              <li className="flex items-start">
                <Calendar className="w-4 h-4 mr-2 mt-0.5 text-prismary flex-shrink-0" />
                <span>Expect to hear back from us within 3-5 business days</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button asChild className="btn-primary w-full">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Questions? Contact us at{' '}
              <a
                href="mailto:support@applywizz.com"
                className="text-primary hover:text-primary-glow transition-colors"
              >
                support@applywizz.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
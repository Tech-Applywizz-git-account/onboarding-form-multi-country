import React from 'react';
import { Mail, Send, CheckCircle, Sparkles, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimationType = 'mail-send' | 'confetti' | 'data-send' | 'glow' | 'float';

interface AnimatedIconProps {
  type: AnimationType;
  className?: string;
  size?: number;
  playing?: boolean;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  type, 
  className, 
  size = 24, 
  playing = false 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'mail-send':
        return <Send className={cn('text-primary', playing && 'animate-mail-send')} size={size} />;
      case 'confetti':
        return <Sparkles className={cn('text-success', playing && 'animate-confetti')} size={size} />;
      case 'data-send':
        return <Database className={cn('text-accent', playing && 'animate-data-send')} size={size} />;
      case 'glow':
        return <CheckCircle className={cn('text-success', playing && 'animate-glow')} size={size} />;
      case 'float':
        return <Mail className={cn('text-primary', playing && 'animate-float')} size={size} />;
      default:
        return <Send size={size} />;
    }
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {getIcon()}
    </div>
  );
};

export default AnimatedIcon;
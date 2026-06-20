"use client";

import { 
  User, Shield, FileText, CreditCard, Database, Bell, Gavel, Scale, ArrowLeft, CheckCircle2,
  Eye, Lock, Share2, Cookie, UserCheck, RefreshCw, Mail, HelpCircle, Phone, Calendar, Clock,
  Video, Headphones, MessageSquare, MessageCircle, AlertCircle, ChevronDown, Award, ExternalLink
} from "lucide-react";

export default function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ComponentType<any>> = {
    User, Shield, FileText, CreditCard, Database, Bell, Gavel, Scale, ArrowLeft, CheckCircle2,
    Eye, Lock, Share2, Cookie, UserCheck, RefreshCw, Mail, HelpCircle, Phone, Calendar, Clock,
    Video, Headphones, MessageSquare, MessageCircle, AlertCircle, ChevronDown, Award, ExternalLink
  };
  const IconComponent = icons[name] || FileText;
  return <IconComponent className={className} />;
}

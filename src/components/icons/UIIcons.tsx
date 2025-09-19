// src/components/icons/UIIcons.tsx
import {
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Plus,
    Minus,
    Search,
    Menu,
    User,
    Settings,
    LogOut,
    Shield,
    Lock,
    Unlock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    DollarSign,
    CreditCard,
    Send,
    Clock,
    Calendar,
    Mail,
    Copy,
    ExternalLink,
    Download,
    Upload,
    FileText,
    Users,
    Bell,
    Home,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    Edit3,
    Filter,
    MoreHorizontal,
    MoreVertical,
    HelpCircle,
    type LucideIcon
  } from 'lucide-react';
  
  // Re-export all Lucide icons with consistent sizing
  export {
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Plus,
    Minus,
    Search,
    Menu,
    User,
    Settings,
    LogOut,
    Shield,
    Lock,
    Unlock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    DollarSign,
    CreditCard,
    Send,
    Clock,
    Calendar,
    Mail,
    Copy,
    ExternalLink,
    Download,
    Upload,
    FileText,
    Users,
    Bell,
    Home,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    Edit3,
    Filter,
    MoreHorizontal,
    MoreVertical,
    HelpCircle
  };
  
  export type { LucideIcon };
  
  // Custom status icons with EscrowHaven styling
  export const StatusIcons = {
    pending: (props: any) => (
      <Clock className="text-warning" size={20} {...props} />
    ),
    funded: (props: any) => (
      <DollarSign className="text-primary" size={20} {...props} />
    ),
    released: (props: any) => (
      <CheckCircle className="text-success" size={20} {...props} />
    ),
    cancelled: (props: any) => (
      <XCircle className="text-danger" size={20} {...props} />
    ),
    expired: (props: any) => (
      <Clock className="text-text-tertiary" size={20} {...props} />
    )
  };
  
  // Loading spinner component
  export const Spinner = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <Loader2 size={size} className={`animate-spin ${className}`} />
  );
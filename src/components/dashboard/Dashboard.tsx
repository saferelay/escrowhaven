// src/components/dashboard/Dashboard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateEscrowWizard } from '@/components/escrow/CreateEscrowWizard';
import { EscrowDetailPanel } from '@/components/escrow/EscrowDetailPanel';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

type ViewType = 'marketing' | 'dashboard' | 'transparency' | 'escrow' | 'login' | 'help';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

// TradingView-style wireframe SVG icons - clean, crisp, functional
const Icons = {
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  inbox: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M21 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2v-2" strokeLinecap="round"/>
      <path d="M3 10h5.5a2 2 0 011.5.7l1.5 2.3a2 2 0 001.5.7h8" strokeLinecap="round"/>
    </svg>
  ),
  send: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dollar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  checkCircle: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  barChart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  helpCircle: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  book: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  x: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// WRAPPER COMPONENTS TO ENSURE PANELS STAY CONTAINED
function CreateEscrowWizardWrapper({ isOpen, onClose, onEscrowCreated }: any) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CreateEscrowWizard 
        isOpen={isOpen} 
        onClose={onClose}
        onEscrowCreated={onEscrowCreated}
      />
    </div>
  );
}

function EscrowDetailPanelWrapper({ escrowId, isOpen, onClose, onUpdate }: any) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <EscrowDetailPanel
        escrowId={escrowId}
        isOpen={isOpen}
        onClose={onClose}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, supabase, loading: authLoading, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<'all' | 'sent' | 'received' | 'active' | 'completed'>('all');
  const [rightPanelView, setRightPanelView] = useState<'detail' | 'create' | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [urlEscrowProcessed, setUrlEscrowProcessed] = useState(false);
  
  // Column widths state - DESCRIPTION LARGEST BY DEFAULT
  const [columnWidths, setColumnWidths] = useState({
    party: 25,
    description: 35,
    status: 10,
    amount: 10,
    action: 10,
    time: 10
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle URL parameter for escrow selection
  useEffect(() => {
    const escrowId = searchParams.get('escrow');
    console.log('Dashboard: URL escrow param:', escrowId);
    
    if (escrowId && !urlEscrowProcessed && escrows.length > 0) {
      console.log('Dashboard: Looking for escrow in list...');
      const targetEscrow = escrows.find(e => e.id === escrowId);
      
      if (targetEscrow) {
        console.log('Dashboard: Found escrow, auto-selecting:', targetEscrow.id);
        setSelectedEscrowId(escrowId);
        setRightPanelView('detail');
        setRightPanelOpen(true);
        setUrlEscrowProcessed(true);
        
        // Remove the parameter from URL without reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else {
        console.log('Dashboard: Escrow not found in user\'s list');
      }
    }
  }, [searchParams, escrows, urlEscrowProcessed]);
  
  // Reset URL processing flag when user changes
  useEffect(() => {
    setUrlEscrowProcessed(false);
  }, [user?.email]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      return;
    } else if (user && supabase) {
      fetchEscrows();
      
      const channel = supabase
        .channel('dashboard-escrows')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'escrows' },
          () => fetchEscrows()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase, authLoading]);

  // Keyboard shortcuts - UPDATED TO CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleCreateNew();
      }
      // CMD+K or CTRL+K for search
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape') {
        handleCloseRightPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resize functionality for right panel
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 380;
      const maxWidth = window.innerWidth * 0.7;
      
      setRightPanelWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Column resize functionality
  useEffect(() => {
    const handleColumnMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) return;
      
      const diff = e.clientX - startX;
      const percentDiff = (diff / window.innerWidth) * 100;
      const newWidth = Math.max(5, Math.min(50, startWidth + percentDiff));
      
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    };

    const handleColumnMouseUp = () => {
      setResizingColumn(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleColumnMouseMove);
      document.addEventListener('mouseup', handleColumnMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleColumnMouseMove);
      document.removeEventListener('mouseup', handleColumnMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);

  const startColumnResize = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column as keyof typeof columnWidths]);
  };

  const fetchEscrows = async () => {
    if (!supabase || !user) return;
    
    console.log('Dashboard: Fetching escrows for user:', user.email);
    
    const { data, error } = await supabase
      .from('escrows')
      .select('*')
      .or(`client_email.eq.${user.email},freelancer_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (data && !error) {
      console.log('Dashboard: Fetched escrows:', data.length);
      setEscrows(data);
    } else if (error) {
      console.error('Dashboard: Error fetching escrows:', error);
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 172800) return '1d';
    
    const days = Math.floor(seconds / 86400);
    if (days < 30) return `${days}d`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredEscrows = escrows.filter(escrow => {
    const isReceiver = user?.email === escrow.freelancer_email;
    
    if (activeFolder === 'sent' && isReceiver) return false;
    if (activeFolder === 'received' && !isReceiver) return false;
    if (activeFolder === 'active' && !['INITIATED', 'ACCEPTED', 'FUNDED'].includes(escrow.status)) return false;
    if (activeFolder === 'completed' && escrow.status !== 'RELEASED') return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        escrow.client_email?.toLowerCase().includes(query) ||
        escrow.freelancer_email?.toLowerCase().includes(query) ||
        escrow.description?.toLowerCase().includes(query) ||
        escrow.id?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleCreateNew = () => {
    setSelectedEscrowId(null);
    setRightPanelView('create');
    setRightPanelOpen(true);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleSelectEscrow = (escrowId: string) => {
    console.log('Dashboard: Selecting escrow:', escrowId);
    setSelectedEscrowId(escrowId);
    setRightPanelView('detail');
    setRightPanelOpen(true);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleEscrowCreated = (escrowId: string) => {
    fetchEscrows();
    setSelectedEscrowId(escrowId);
    setRightPanelView('detail');
    setRightPanelOpen(true);
  };

  const handleCloseRightPanel = () => {
    setRightPanelOpen(false);
    setTimeout(() => {
      setRightPanelView(null);
      setSelectedEscrowId(null);
    }, 300);
  };

  const getFolderCount = (folder: string) => {
    switch (folder) {
      case 'sent':
        return escrows.filter(e => user?.email === e.client_email).length;
      case 'received':
        return escrows.filter(e => user?.email === e.freelancer_email).length;
      case 'active':
        return escrows.filter(e => ['INITIATED', 'ACCEPTED', 'FUNDED'].includes(e.status)).length;
      case 'completed':
        return escrows.filter(e => e.status === 'RELEASED').length;
      default:
        return escrows.length;
    }
  };

  const needsAction = (escrow: any) => {
    const isReceiver = user?.email === escrow.freelancer_email;
    const isInitiator = escrow.initiator_email === user?.email;
    
    if (escrow.status === 'INITIATED') {
      if (isInitiator) {
        return { action: 'Waiting', isPrimary: false };
      } else {
        return { action: 'Accept', isPrimary: true };
      }
    }
    if (escrow.status === 'ACCEPTED' && !isReceiver) {
      return { action: 'Fund', isPrimary: true };
    }
    if (escrow.status === 'FUNDED') {
      if (isReceiver && !escrow.freelancer_approved) {
        return { action: 'Approve', isPrimary: true };
      }
      if (!isReceiver && !escrow.client_approved) {
        return { action: 'Approve', isPrimary: true };
      }
      if ((isReceiver && escrow.freelancer_approved) || (!isReceiver && escrow.client_approved)) {
        return { action: 'Waiting', isPrimary: false };
      }
    }
    return null;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E0E2E7] border-t-[#2962FF]"></div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex h-screen bg-white relative">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-[#E0E2E7] md:hidden"
          style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}
        >
          {mobileMenuOpen ? Icons.x : Icons.menu}
        </button>

        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    );
  }

  // Desktop view - UPDATED WITH YOUR REQUIREMENTS
  return (
    <div className="h-screen bg-white flex overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, "Segoe UI", Ubuntu, sans-serif' }}>
      <div className="flex w-full h-full">
        
        {/* LEFT SECTION: Sidebar + Content */}
        <div 
          className="flex min-w-0"
          style={{
            width: rightPanelOpen ? `calc(100% - ${rightPanelWidth}px)` : '100%',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Sidebar */}
          <aside className="w-72 bg-white border-r border-[#E0E2E7] flex flex-col flex-shrink-0">
            {/* Logo section */}
            <div className="h-24 px-6 flex items-center">
              <button 
                onClick={() => onNavigate('marketing')}
                className="flex items-center space-x-3"
              >
                <div className="w-11 h-11 bg-[#2962FF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium text-2xl">S</span>
                </div>
                <span className="text-xl font-medium text-[#000000]">SafeRelay</span>
              </button>
            </div>

            {/* Create escrow button - TRANSPARENT WITH BLACK BORDER */}
            <div className="px-6 pb-8">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#000000] border-2 border-[#000000] rounded-lg hover:bg-[#000000] hover:text-white transition-all text-base font-medium"
              >
                {Icons.plus}
                Create escrow
              </button>
            </div>

            {/* Folders - WITH VISIBLE CURVED BORDERS */}
            <nav className="flex-1 px-4 overflow-y-auto">
              {[
                { id: 'all', label: 'All escrows', icon: Icons.inbox },
                { id: 'sent', label: 'Sent', icon: Icons.send },
                { id: 'received', label: 'Received', icon: Icons.dollar },
                { id: 'active', label: 'Active', icon: Icons.clock },
                { id: 'completed', label: 'Completed', icon: Icons.checkCircle },
              ].map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id as any)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-1',
                    activeFolder === folder.id 
                      ? 'bg-white border-2 border-[#000000] text-[#000000]' 
                      : 'text-[#787B86] hover:text-[#000000] border-2 border-transparent'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={activeFolder === folder.id ? 'text-[#000000]' : ''}>
                      {folder.icon}
                    </span>
                    {folder.label}
                  </span>
                  {getFolderCount(folder.id) > 0 && (
                    <span className={clsx(
                      "text-xs",
                      activeFolder === folder.id ? 'text-[#000000]' : 'text-[#B2B5BE]'
                    )}>
                      {getFolderCount(folder.id)}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Resources Section */}
            <div className="px-6 py-6 border-t border-[#E0E2E7]">
              <div className="space-y-2">
                <button 
                  onClick={() => onNavigate('transparency')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#787B86] hover:text-[#000000] rounded-lg transition-colors text-left"
                >
                  {Icons.barChart}
                  Transparency
                </button>
                <button 
                  onClick={() => onNavigate('help')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#787B86] hover:text-[#000000] rounded-lg transition-colors text-left"
                >
                  {Icons.helpCircle}
                  Help center
                </button>
              </div>
            </div>

            {/* User section */}
            <div className="px-6 py-6 border-t border-[#E0E2E7]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#F8F9FD] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[#000000]">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#000000] truncate">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-[#B2B5BE]">Free plan</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#787B86] hover:text-[#000000] rounded-lg transition-colors text-left"
              >
                {Icons.logout}
                Sign out
              </button>
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Top toolbar - SEARCH BAR WITH WELCOME BELOW */}
            <div className="px-8 pt-6 pb-4 border-b border-[#E0E2E7]">
              <div className="flex items-center gap-6 mb-3">
                {/* Smaller search bar */}
                <div className="w-80">
                  <div className="relative">
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search... (⌘K)"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8F9FD] border border-transparent rounded-lg text-sm text-[#000000] placeholder-[#B2B5BE] focus:outline-none focus:bg-white focus:border-[#2962FF] transition-all"
                      style={{ boxShadow: searchQuery ? '0 0 0 3px rgba(41, 98, 255, 0.1)' : 'none' }}
                    />
                    <span className="absolute left-3 top-2.5 text-[#B2B5BE]">
                      {Icons.search}
                    </span>
                  </div>
                </div>

                {/* Refresh button */}
                <button 
                  onClick={() => fetchEscrows()}
                  className="p-2 hover:bg-[#F0F2F5] rounded-lg transition-colors"
                  title="Refresh (R)"
                >
                  <span className="text-[#787B86] hover:text-[#000000]">{Icons.refresh}</span>
                </button>

                {/* Stats - pushed to the right */}
                <div className="ml-auto text-sm text-[#B2B5BE]">
                  <span>{filteredEscrows.length} escrows</span>
                </div>
              </div>
              
              {/* Welcome message BELOW search - LARGER TEXT */}
              <div className="text-xl font-medium text-[#000000]">
                Welcome, {user?.email?.split('@')[0]}!
              </div>
            </div>

            {/* TABLE HEADERS */}
            <div className="h-12 flex items-center px-8 border-b border-[#E0E2E7] bg-white relative">
              <div className="flex items-center text-xs font-medium text-[#B2B5BE] uppercase tracking-wider w-full">
                <div className="relative" style={{ width: `${columnWidths.party}%` }}>
                  PARTY
                  <div 
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-[#E0E2E7] opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startColumnResize('party', e)}
                  >
                    <div className="absolute right-1.5 top-0 h-full w-px bg-[#E0E2E7]" />
                  </div>
                </div>
                <div className="relative overflow-hidden" style={{ width: `${columnWidths.description}%` }}>
                  DESCRIPTION
                  <div 
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-[#E0E2E7] opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startColumnResize('description', e)}
                  >
                    <div className="absolute right-1.5 top-0 h-full w-px bg-[#E0E2E7]" />
                  </div>
                </div>
                <div className="relative" style={{ width: `${columnWidths.status}%` }}>
                  STATUS
                  <div 
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-[#E0E2E7] opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startColumnResize('status', e)}
                  >
                    <div className="absolute right-1.5 top-0 h-full w-px bg-[#E0E2E7]" />
                  </div>
                </div>
                <div className="relative text-right" style={{ width: `${columnWidths.amount}%` }}>
                  AMOUNT
                  <div 
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-[#E0E2E7] opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startColumnResize('amount', e)}
                  >
                    <div className="absolute right-1.5 top-0 h-full w-px bg-[#E0E2E7]" />
                  </div>
                </div>
                <div className="relative text-center" style={{ width: `${columnWidths.action}%` }}>
                  ACTION
                  <div 
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-[#E0E2E7] opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startColumnResize('action', e)}
                  >
                    <div className="absolute right-1.5 top-0 h-full w-px bg-[#E0E2E7]" />
                  </div>
                </div>
                <div className="text-right" style={{ width: `${columnWidths.time}%` }}>
                  TIME
                </div>
              </div>
            </div>

            {/* Space before rows */}
            <div className="h-6 bg-white" />

            {/* Escrow list */}
            <div className="flex-1 overflow-y-auto bg-white">
              {filteredEscrows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-2xl font-normal mb-2 text-[#000000]">No escrows found</p>
                  <p className="text-base text-[#787B86] mb-8">Create your first escrow to get started</p>
                  <button
                    onClick={handleCreateNew}
                    className="px-8 py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] font-medium transition-colors"
                  >
                    Create escrow
                  </button>
                </div>
              ) : (
                <div className="px-8">
                  {/* Escrow rows - WITH VISIBLE ROUNDED BORDERS */}
                  {filteredEscrows.map((escrow) => {
                    const isReceiver = user?.email === escrow.freelancer_email;
                    const otherParty = isReceiver ? escrow.client_email : escrow.freelancer_email;
                    const amount = (escrow.amount_cents / 100).toFixed(2);
                    const time = getRelativeTime(escrow.created_at);
                    
                    const statusStyles: Record<string, { text: string; bg: string; color: string }> = {
                      'INITIATED': { text: 'New', bg: 'bg-[#F0F2F5]', color: 'text-[#787B86]' },
                      'ACCEPTED': { text: 'Accepted', bg: 'bg-[#FEF3C7]', color: 'text-[#F7931A]' },
                      'FUNDED': { text: 'Funded', bg: 'bg-[#E3EFFD]', color: 'text-[#2962FF]' },
                      'RELEASED': { text: 'Complete', bg: 'bg-[#D1FAE5]', color: 'text-[#26A69A]' },
                      'DECLINED': { text: 'Declined', bg: 'bg-[#FEE2E2]', color: 'text-[#EF5350]' },
                    };
                    const status = statusStyles[escrow.status] || { text: escrow.status, bg: 'bg-[#F0F2F5]', color: 'text-[#787B86]' };
                    const actionInfo = needsAction(escrow);
                    
                    return (
                      <div
                        key={escrow.id}
                        className={clsx(
                          "group px-4 py-4 mb-2 rounded-lg cursor-pointer transition-all flex items-center",
                          selectedEscrowId === escrow.id 
                            ? "bg-white border-2 border-[#000000]" 
                            : "bg-white border-2 border-transparent hover:border-[#E0E2E7]"
                        )}
                        onClick={() => handleSelectEscrow(escrow.id)}
                      >
                        {/* Party */}
                        <div style={{ width: `${columnWidths.party}%` }} className="pr-2">
                          <p className="text-sm font-medium text-[#000000] truncate">
                            {isReceiver ? 'From: ' : 'To: '}{otherParty}
                          </p>
                        </div>

                        {/* Description - PREVENT OVERFLOW */}
                        <div style={{ width: `${columnWidths.description}%` }} className="px-2 overflow-hidden">
                          <p className="text-sm text-[#787B86] truncate">
                            {escrow.description || `Escrow #${escrow.id.slice(0, 8)}`}
                          </p>
                        </div>

                        {/* Status */}
                        <div style={{ width: `${columnWidths.status}%` }}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.text}
                          </span>
                        </div>

                        {/* Amount */}
                        <div style={{ width: `${columnWidths.amount}%` }} className="text-right">
                          <span className="text-sm font-medium text-[#000000]">${amount}</span>
                        </div>

                        {/* Action */}
                        <div style={{ width: `${columnWidths.action}%` }} className="flex justify-center">
                          {actionInfo && actionInfo.isPrimary && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEscrow(escrow.id);
                              }}
                              className="px-3 py-1.5 bg-[#2962FF] text-white text-xs font-medium rounded-md hover:bg-[#1E53E5] transition-colors"
                            >
                              {actionInfo.action}
                            </button>
                          )}
                          {actionInfo && !actionInfo.isPrimary && (
                            <span className="text-xs text-[#B2B5BE]">{actionInfo.action}</span>
                          )}
                        </div>

                        {/* Time */}
                        <div style={{ width: `${columnWidths.time}%` }} className="text-right">
                          <span className="text-sm text-[#B2B5BE]">{time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DRAGGABLE DIVIDER */}
        {rightPanelOpen && (
          <div
            className="w-px bg-[#E0E2E7] hover:bg-[#2962FF] cursor-col-resize relative group transition-colors"
            onMouseDown={() => setIsResizing(true)}
            style={{
              backgroundColor: isResizing ? '#2962FF' : undefined
            }}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {/* RIGHT PANEL */}
        {rightPanelOpen && (
          <div 
            className="bg-white flex flex-col relative border-l border-[#E0E2E7]"
            style={{ 
              width: `${rightPanelWidth}px`,
              minWidth: '380px',
              maxWidth: '70%',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="absolute inset-0 overflow-hidden flex flex-col">
              {rightPanelView === 'create' ? (
                <CreateEscrowWizardWrapper
                  isOpen={true} 
                  onClose={handleCloseRightPanel}
                  onEscrowCreated={handleEscrowCreated}
                />
              ) : rightPanelView === 'detail' && selectedEscrowId ? (
                <EscrowDetailPanelWrapper
                  escrowId={selectedEscrowId}
                  isOpen={true}
                  onClose={handleCloseRightPanel}
                  onUpdate={fetchEscrows}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
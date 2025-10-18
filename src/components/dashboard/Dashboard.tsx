// src/components/dashboard/Dashboard.tsx
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { CreateEscrowWizard } from '@/components/escrow/CreateEscrowWizard';
import { EscrowDetailPanel } from '@/components/escrow/EscrowDetailPanel';
import { DepositModal } from '@/components/dashboard/DepositModal';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import Image from 'next/image';

// Icons
import {
  Search as SearchIcon,
  RefreshCw,
  Plus,
  FileText,
  AlertCircle,
  Send,
  Download,
  DollarSign,
  CheckCircle,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronDown,
} from '@/components/icons/UIIcons';

type ViewType = 'marketing' | 'dashboard' | 'transparency' | 'escrow' | 'login' | 'help';
type SortColumn = 'party' | 'amount' | 'action' | 'updated';
type SortOrder = 'asc' | 'desc';
type Folder = 'all' | 'needs' | 'sent' | 'received' | 'active' | 'completed';
type RightPanelView = 'detail' | 'create' | 'transfer' | null;

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

interface FolderCounts {
  all: number;
  needs: number;
  sent: number;
  received: number;
  active: number;
  completed: number;
}

const btn = {
  primary:
    'inline-flex items-center justify-center rounded-md px-3 py-2 bg-[#2962FF] text-white hover:bg-[#1E53E5] transition shadow-sm',
  outlineSmall:
    'inline-flex items-center justify-center rounded-md px-2.5 py-1.5 border border-[#D0D5DD] text-[13px] text-[#0F172A] bg-transparent hover:bg-[#F8F9FD] transition',
  linkBlue: 'text-[#2962FF] hover:underline inline-flex items-center gap-1',
};

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';
const PAGE_SIZE = 20;

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, supabase, loading: authLoading, signOut } = useAuth();
  const searchParams = useSearchParams();

  // Data
  const [escrows, setEscrows] = useState<any[]>([]);
  const [totalEscrowCount, setTotalEscrowCount] = useState(0);
  const [folderCounts, setFolderCounts] = useState<FolderCounts>({
    all: 0,
    needs: 0,
    sent: 0,
    received: 0,
    active: 0,
    completed: 0,
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);

  // Filters
  const [activeFolder, setActiveFolder] = useState<Folder>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort
  const [sortBy, setSortBy] = useState<SortColumn>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Right panel
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number | null>(null);
  const [userSetWidth, setUserSetWidth] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);

  // Layout
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [transferDropdownOpen, setTransferDropdownOpen] = useState(false);
  const transferRef = useRef<HTMLDivElement>(null);

  // Feedback
  const [showFeedbackForEscrow, setShowFeedbackForEscrow] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState({
    protectedInEscrow: 0,
    totalEarnings: 0,
    availableToWithdraw: 0,
    totalWithdrawn: 0,
    activeEscrows: 0,
    completedCount: 0,
    refundedCount: 0,
  });

  const [moonPayData, setMoonPayData] = useState<{
    vaultAddress: string;
    amount: number;
    escrowId: string;
  } | null>(null);

  // Other state
  const [urlEscrowProcessed, setUrlEscrowProcessed] = useState(false);
  const [showOffRampModal, setShowOffRampModal] = useState(false);
  const [currentWithdrawalId, setCurrentWithdrawalId] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositSuggestedAmount, setDepositSuggestedAmount] = useState<number | undefined>();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Add after the state declaration
  const fetchPromises = useRef<Map<string, Promise<any>>>(new Map());

  // Helper to deduplicate concurrent requests
  const dedupeFetch = useCallback(async (key: string, fetchFn: () => Promise<any>) => {
    const existing = fetchPromises.current.get(key);
    if (existing) return existing;
    
    const promise = fetchFn().finally(() => {
      fetchPromises.current.delete(key);
    });
    
    fetchPromises.current.set(key, promise);
    return promise;
  }, []);

  // Helper function
  const needsAction = (escrow: any) => {
    const isReceiver = user?.email === escrow.freelancer_email;
    const isPayer = user?.email === escrow.client_email;
    const isInitiator = escrow.initiator_email === user?.email;
  
    // Handle cancelled/declined first
    if (['CANCELLED', 'DECLINED'].includes(escrow.status)) {
      return { label: 'Closed', primary: false };
    }

    if (escrow.status === 'INITIATED') {
      if (isInitiator) {
        return { label: 'Waiting', primary: false };
      }
      return { label: 'Accept', primary: true };
    }
    
    if (escrow.status === 'ACCEPTED') {
      if (isPayer) {
        return { label: 'Fund', primary: true };
      }
      if (isReceiver) {
        return { label: 'Waiting', primary: false };
      }
    }
    
    if (escrow.status === 'FUNDED') {
      if (escrow.settlement_client_approved !== null || escrow.settlement_freelancer_approved !== null) {
        if (isPayer && escrow.settlement_client_approved === false) {
          return { label: 'Approve', primary: true };
        }
        if (isReceiver && escrow.settlement_freelancer_approved === false) {
          return { label: 'Approve', primary: true };
        }
        return { label: 'Waiting', primary: false };
      }
      return { label: 'Approve', primary: true };
    }
    
    if (['RELEASED', 'SETTLED', 'REFUNDED', 'COMPLETED'].includes(escrow.status)) {
      return { label: 'Complete', primary: false };
    }
    
    return { label: 'Waiting', primary: false };
  };

  // Fetch folder counts
  const fetchFolderCounts = useCallback(async () => {
    if (!supabase || !user?.email) return;
    
    return dedupeFetch('folder-counts', async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_folder_counts_cached', {
            user_email: user.email,
            env: isProduction ? 'production' : 'development'
          });
        
        if (error) {
          console.error('Error fetching folder counts:', error?.message || error?.code || 'Unknown error');
          setFolderCounts({
            all: 0,
            needs: 0,
            sent: 0,
            received: 0,
            active: 0,
            completed: 0,
          });
          return;
        }
        
        if (data && data.length > 0) {
          const counts = data[0];
          setFolderCounts({
            all: Number(counts.all_count || 0),
            needs: Number(counts.needs_count || 0),
            sent: Number(counts.sent_count || 0),
            received: Number(counts.received_count || 0),
            active: Number(counts.active_count || 0),
            completed: Number(counts.completed_count || 0),
          });
        }
      } catch (err: any) {
        console.error('Error in fetchFolderCounts:', err?.message || 'Failed to fetch folder counts');
        setFolderCounts({
          all: 0,
          needs: 0,
          sent: 0,
          received: 0,
          active: 0,
          completed: 0,
        });
      }
    });
  }, [supabase, user?.email, isProduction, dedupeFetch]);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    if (!supabase || !user?.email) return;
    
    try {
      const { data: metricsResult, error: metricsError } = await supabase
        .rpc('get_user_metrics', { 
          p_user_email: user.email,
          p_env: isProduction ? 'production' : 'development'
        });
      
      if (metricsError) {
        console.warn('Metrics fetch failed, using defaults:', metricsError);
        setMetrics({
          protectedInEscrow: 0,
          totalEarnings: 0,
          availableToWithdraw: 0,
          totalWithdrawn: 0,
          activeEscrows: 0,
          completedCount: 0,
          refundedCount: 0,
        });
        return;
      }
      
      if (metricsResult && metricsResult.length > 0) {
        const m = metricsResult[0];
        
        const sentInEscrow = parseFloat(m.sent_in_escrow_cents || '0');
        const receivingInEscrow = parseFloat(m.receiving_in_escrow_cents || '0');
        const totalEarnings = parseFloat(m.total_earnings_cents || '0');
        const availableToWithdraw = parseFloat(m.available_to_withdraw_cents || '0');
        const activeCount = parseInt(m.active_count || '0', 10);
        const completedCount = parseInt(m.completed_count || '0', 10);
        const refundedCount = parseInt(m.refunded_count || '0', 10);
        
        setMetrics({
          protectedInEscrow: (sentInEscrow + receivingInEscrow) / 100,
          totalEarnings: totalEarnings / 100,
          availableToWithdraw: availableToWithdraw / 100,
          totalWithdrawn: 0,
          activeEscrows: activeCount,
          completedCount: completedCount,
          refundedCount: refundedCount,
        });
      } else {
        setMetrics({
          protectedInEscrow: 0,
          totalEarnings: 0,
          availableToWithdraw: 0,
          totalWithdrawn: 0,
          activeEscrows: 0,
          completedCount: 0,
          refundedCount: 0,
        });
      }
    } catch (err) {
      console.warn('Metrics fetch error:', err);
      setMetrics({
        protectedInEscrow: 0,
        totalEarnings: 0,
        availableToWithdraw: 0,
        totalWithdrawn: 0,
        activeEscrows: 0,
        completedCount: 0,
        refundedCount: 0,
      });
    }
  }, [supabase, user?.email, isProduction]);

  // Fetch escrows
  const fetchEscrows = useCallback(async (reset = false, folder: Folder = activeFolder) => {
    if (!supabase || !user?.email) return;
    
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;
    
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    try {
      const pageToLoad = reset ? 0 : currentPage;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: escrowsResult, error } = await supabase
        .rpc('get_folder_items_cached', {
          p_user_email: user.email,
          p_folder: folder,
          p_limit: PAGE_SIZE,
          p_offset: pageToLoad * PAGE_SIZE,
          p_env: isProduction ? 'production' : 'development'
        });
      
      if (error) {
        console.error('Escrows fetch error:', error);
        setHasMore(false);
        return;
      }
      
      if (escrowsResult) {
        if (reset) {
          setEscrows(escrowsResult);
          setCurrentPage(1);
          setHasMore(escrowsResult.length === PAGE_SIZE);
        } else {
          setEscrows(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newEscrows = escrowsResult.filter(e => !existingIds.has(e.id));
            if (newEscrows.length === 0) {
              setHasMore(false);
            }
            return [...prev, ...newEscrows];
          });
          setCurrentPage(prev => prev + 1);
          setHasMore(escrowsResult.length === PAGE_SIZE);
        }
      }
      
      if (reset || isInitialLoad) {
        await Promise.all([
          fetchMetrics(),
          fetchFolderCounts()
        ]);
        setIsInitialLoad(false);
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [supabase, user?.email, isProduction, currentPage, hasMore, activeFolder, isInitialLoad, fetchMetrics, fetchFolderCounts]);

  const fetchWithdrawals = useCallback(async () => {
    if (!user?.email || !supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching withdrawals:', error);
        return;
      }
      
      if (data) setWithdrawals(data);
    } catch (err: any) {
      console.error('Error fetching withdrawals:', err?.message || err);
    }
  }, [supabase, user?.email]);

  // Handle folder change
  const handleFolderChange = useCallback((folder: Folder) => {
    setActiveFolder(folder);
    setEscrows([]);
    setCurrentPage(0);
    setHasMore(true);
    loadingRef.current = false;
    fetchEscrows(true, folder);
  }, [fetchEscrows]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    loadingRef.current = false;
    
    try {
      await Promise.all([
        fetchEscrows(true, activeFolder),
        fetchWithdrawals(),
        fetchMetrics(),
        fetchFolderCounts()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [fetchEscrows, fetchWithdrawals, fetchMetrics, fetchFolderCounts, isRefreshing, activeFolder]);

  // Handle withdraw
  const handleWithdraw = async () => {
    if (metrics.availableToWithdraw === 0 || !supabase || !user?.email) return;
    
    try {
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', user.email)
        .single();
        
      if (!walletData?.wallet_address) {
        alert('Wallet not found. Please connect your wallet first.');
        return;
      }
      
      const { data: withdrawal, error } = await supabase
        .from('withdrawals')
        .insert({
          user_email: user.email,
          amount_cents: Math.floor(metrics.availableToWithdraw * 100),
          wallet_address: walletData.wallet_address,
          status: 'PENDING',
          provider: 'onramp',
        })
        .select()
        .single();
        
      if (error) {
        alert('Failed to initiate withdrawal: ' + error.message);
        return;
      }
      
      if (withdrawal && withdrawal.id) {
        setCurrentWithdrawalId(String(withdrawal.id));
        setShowOffRampModal(true);
      }
    } catch (e) {
      console.error('Withdrawal error:', e);
      alert('Failed to process withdrawal');
    }
  };

  const handleShowMoonPay = useCallback((data: { vaultAddress: string; amount: number; escrowId: string }) => {
    console.log('Opening MoonPay modal with:', data);
    setMoonPayData(data);
  }, []);
  
  const handleMoonPayClose = useCallback(() => {
    setMoonPayData(null);
  }, []);
  
  const handleMoonPaySuccess = useCallback(() => {
    console.log('MoonPay funding successful!');
    setMoonPayData(null);
    handleRefresh();
  }, [handleRefresh]);

  // Initial load
  useEffect(() => {
    if (!authLoading && user?.email && supabase && isInitialLoad) {
      const initFetch = async () => {
        await fetchEscrows(true, activeFolder);
        await fetchWithdrawals();
      };
      initFetch();
    }
  }, [authLoading, user?.email, supabase, isInitialLoad]);

  // Check for feedback needed
  useEffect(() => {
    const checkForFeedback = async () => {
      if (!user?.email || !supabase) return;
      
      const { data: completedEscrows } = await supabase
        .from('escrows')
        .select('id')
        .or(`client_email.eq.${user.email},freelancer_email.eq.${user.email}`)
        .eq('status', 'RELEASED')
        .is('feedback_given', null)
        .limit(1);
      
      if (completedEscrows?.length > 0) {
        setShowFeedbackForEscrow(completedEscrows[0].id);
      }
    };
    
    const timer = setTimeout(() => {
      checkForFeedback();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [user?.email, supabase]);
  
  // Reset when user changes
  useEffect(() => {
    if (user?.email) {
      setEscrows([]);
      setCurrentPage(0);
      setHasMore(true);
      setIsInitialLoad(true);
      loadingRef.current = false;
    }
  }, [user?.email]);

  // Intersection Observer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && !isLoadingMore) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            if (!loadingRef.current && hasMore) {
              fetchEscrows(false, activeFolder);
            }
          }, 500);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    );
    
    const currentTarget = observerTarget.current;
    if (currentTarget && hasMore && !isLoadingMore) {
      observer.observe(currentTarget);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, activeFolder]);

  // Real-time subscription
  useEffect(() => {
    if (!supabase || !user?.email) return;
    
    let updateTimeout: NodeJS.Timeout;
    let metricsTimeout: NodeJS.Timeout;
    
    const channel = supabase
      .channel(`dashboard-${user.email}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'escrows'
        },
        (payload) => {
          const escrow = payload.new;
          if (escrow.client_email === user.email || escrow.freelancer_email === user.email) {
            setEscrows(prev => {
              const index = prev.findIndex(e => e.id === escrow.id);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = escrow;
                return updated;
              }
              return prev;
            });
            
            clearTimeout(updateTimeout);
            clearTimeout(metricsTimeout);
            
            updateTimeout = setTimeout(() => {
              fetchFolderCounts();
            }, 1000);
            
            metricsTimeout = setTimeout(() => {
              fetchMetrics();
            }, 2000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'escrows'
        },
        (payload) => {
          const escrow = payload.new;
          if (escrow.client_email === user.email || escrow.freelancer_email === user.email) {
            if (activeFolder === 'all') {
              setEscrows(prev => [escrow, ...prev]);
              setTotalEscrowCount(prev => prev + 1);
            }
            
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
              fetchFolderCounts();
              fetchMetrics();
            }, 1000);
          }
        }
      )
      .subscribe();
    
    return () => {
      clearTimeout(updateTimeout);
      clearTimeout(metricsTimeout);
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.email, activeFolder]);

  // Mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Deep link handling
  useEffect(() => {
    const id = searchParams.get('escrow');
    if (!id || urlEscrowProcessed || escrows.length === 0) return;
    const target = escrows.find((e) => e.id === id);
    if (target) {
      openDetail(id);
      setUrlEscrowProcessed(true);
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
    }
  }, [searchParams, escrows, urlEscrowProcessed]);

  useEffect(() => setUrlEscrowProcessed(false), [user?.email]);

  // Resize handler
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing || !gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      const min = 340;
      const max = rect.width * 0.75;
      const finalWidth = Math.min(Math.max(newWidth, min), max);
      setRightPanelWidth(finalWidth);
      setUserSetWidth(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    if (isResizing) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  // Withdrawal redirect handling
  useEffect(() => {
    const withdrawalStatus = searchParams.get('withdrawal');
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    
    if (withdrawalStatus === 'complete' && orderId && currentWithdrawalId && supabase) {
      const updateWithdrawal = async () => {
        try {
          if (status === 'success') {
            await supabase
              .from('withdrawals')
              .update({ 
                status: 'COMPLETED',
                completed_at: new Date().toISOString(),
                external_order_id: orderId 
              })
              .eq('id', currentWithdrawalId);
              
            alert('Withdrawal successful! Funds will be sent to your bank account.');
          } else if (status === 'pending') {
            await supabase
              .from('withdrawals')
              .update({ 
                status: 'PROCESSING',
                external_order_id: orderId 
              })
              .eq('id', currentWithdrawalId);
              
            alert('Withdrawal is being processed. You will receive an update soon.');
          }
          
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          
          await fetchWithdrawals();
        } catch (error) {
          console.error('Error updating withdrawal:', error);
        }
      };
      
      updateWithdrawal();
    }
  }, [searchParams, currentWithdrawalId, supabase, fetchWithdrawals]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Click outside to close transfer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (transferRef.current && !transferRef.current.contains(event.target as Node)) {
        setTransferDropdownOpen(false);
      }
    };
    
    if (transferDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [transferDropdownOpen]);

  // Actions
  const openCreate = () => {
    setRightPanelView('create');
    setRightPanelOpen(true);
    if (!isMobile && gridRef.current && !userSetWidth) {
      const w = gridRef.current.getBoundingClientRect().width;
      setRightPanelWidth(Math.max(420, Math.floor(w * 0.5)));
    }
  };

  const openDetail = (id: string) => {
    setSelectedEscrowId(id);
    setRightPanelView('detail');
    setRightPanelOpen(true);
    if (!isMobile && gridRef.current && !userSetWidth) {
      const w = gridRef.current.getBoundingClientRect().width;
      setRightPanelWidth(Math.max(420, Math.floor(w * 0.5)));
    }
  };

  const closePanel = () => {
    setRightPanelOpen(false);
    setTimeout(() => {
      setRightPanelView(null);
      setSelectedEscrowId(null);
    }, 150);
  };

  const onEscrowCreated = (id: string) => {
    handleRefresh();
    openDetail(id);
  };

  // Helper functions
  const getRelativeTime = (date: string) => {
    const now = Date.now();
    const then = new Date(date).getTime();
    const s = Math.floor((now - then) / 1000);
    if (s < 60) return 'now';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 172800) return '1d';
    const d = Math.floor(s / 86400);
    if (d < 30) return `${d}d`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getFolderCount = (id: Folder) => {
    return folderCounts[id] || 0;
  };

  const filteredEscrows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return escrows;
    
    return escrows.filter((e) => {
      return (
        e.client_email?.toLowerCase().includes(q) ||
        e.freelancer_email?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.id?.toLowerCase().includes(q)
      );
    });
  }, [escrows, searchQuery]);

  const sortedEscrows = useMemo(() => {
    const arr = [...filteredEscrows];
    arr.sort((a, b) => {
      let v = 0;
      if (sortBy === 'party') {
        const aParty = user?.email === a.client_email ? a.freelancer_email : a.client_email;
        const bParty = user?.email === b.client_email ? b.freelancer_email : b.client_email;
        v = String(aParty).localeCompare(String(bParty));
      } else if (sortBy === 'amount') {
        v = a.amount_cents - b.amount_cents;
      } else if (sortBy === 'action') {
        const aAct = needsAction(a)?.label || 'zzz';
        const bAct = needsAction(b)?.label || 'zzz';
        v = aAct.localeCompare(bAct);
      } else {
        const aDate = new Date(a.updated_at || a.created_at).getTime();
        const bDate = new Date(b.updated_at || b.created_at).getTime();
        v = aDate - bDate;
      }
      return sortOrder === 'asc' ? v : -v;
    });
    return arr;
  }, [filteredEscrows, sortBy, sortOrder, user, needsAction]);

  // Render transaction row
  const renderTransactionRow = (e: any) => {
    const isReceiver = user?.email === e.freelancer_email;
    const otherParty = isReceiver ? e.client_email : e.freelancer_email;
    const amount = (e.amount_cents / 100).toFixed(2);
    const time = getRelativeTime(e.updated_at || e.created_at);
    const action = needsAction(e);
    const isInactive = ['CANCELLED', 'DECLINED'].includes(e.status);
  
    const statusText: Record<string, string> = {
      INITIATED: 'New',
      ACCEPTED: 'Accepted',
      FUNDED: 'Funded',
      RELEASED: 'Complete',
      SETTLED: 'Settled',
      COMPLETED: 'Complete',
      DECLINED: 'Declined',
      REFUNDED: 'Refunded',
      CANCELLED: 'Cancelled',
    };
  
    return (
      <div
        key={e.id}
        onClick={() => openDetail(e.id)}
        className={clsx(
          'group flex cursor-pointer items-start border-b border-[#E5E7EB] px-4 py-2.5 transition min-h-[52px]',
          rightPanelView === 'detail' && e.id === selectedEscrowId ? 'bg-[#F7F8FB]' : 'hover:bg-[#F8FAFC]',
          isInactive && 'opacity-60'
        )}
      >
        <div className="min-w-0 flex-[3.5]">
          <div className="flex items-center">
            <span className="w-10 flex-shrink-0 text-[11px] text-[#64748B]">
              {isReceiver ? 'From' : 'To'}
            </span>
            <span className="truncate text-[13px] font-medium flex-1">{otherParty}</span>
          </div>
          {e.description && (
            <div className="pl-10 text-[11px] text-[#64748B] truncate">
              {e.description}
            </div>
          )}
        </div>
  
        <div className="hidden lg:block flex-[0.8] flex items-start">
          <span className={clsx(
            "inline-flex items-center h-5 px-1.5 py-0.5 text-[11px] rounded whitespace-nowrap",
            e.status === 'CANCELLED' || e.status === 'DECLINED' 
              ? "border border-gray-200 text-gray-400 bg-gray-50"
              : "border border-[#E2E8F0] text-[#475569]"
          )}>
            {statusText[e.status] ?? e.status}
          </span>
        </div>

        <div className="hidden md:block flex-[1.2] text-right font-mono text-[13px]">${amount}</div>
  
        <div className="hidden xl:flex flex-[2] justify-center">
          {action?.primary ? (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                openDetail(e.id);
              }}
              className="inline-flex items-center justify-center rounded-md w-[72px] h-[28px] bg-[#2962FF] text-white hover:bg-[#1E53E5] transition shadow-sm text-[11px] font-medium"
            >
              {action.label}
            </button>
          ) : action ? (
            <span className="inline-flex items-center justify-center w-[72px] text-[11px] text-[#94A3B8]">
              {action.label}
            </span>
          ) : (
            <span className="text-[11px] text-[#94A3B8]">—</span>
          )}
        </div>
  
        <div className="flex xl:hidden flex-[1] justify-center">
          {action?.primary && (
            <div className="w-2 h-2 bg-[#2962FF] rounded-full mt-1" />
          )}
        </div>
  
        <div className="hidden sm:block flex-[1.5] text-right text-[11px] text-[#94A3B8]">
          {time}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2962FF]" />
      </div>
    );
  }

  const displayCount = getFolderCount(activeFolder);
  const totalInEscrowHaven = metrics.protectedInEscrow + metrics.availableToWithdraw;

  return (
    <div
      className="h-screen w-full overflow-hidden bg-white text-[14px] text-[#0F172A] flex flex-col"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Inter, system-ui, sans-serif' }}
    >
      {/* Header */}
      <header className="h-14 w-full border-b border-[#E5E7EB] bg-white flex-shrink-0">
        <div className="hidden md:grid h-full w-full" style={{ gridTemplateColumns: '15rem 1fr' }}>
        <div className="flex items-center px-6">
  <button onClick={() => onNavigate('marketing')} className="hover:opacity-80 transition-opacity">
    <div className="flex items-center gap-2">
      <Image 
        src="/logo.svg" 
        alt="EscrowHaven Logo" 
        width={32} 
        height={32}
        className="w-8 h-8"
      />
      <span className="text-xl md:text-2xl font-medium tracking-tight text-black">
        escrowhaven<span className="text-[#2962FF]">.io</span>
      </span>
    </div>
  </button>
</div>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2 pl-6">
              <div className="relative w-[320px]">
                <input
                  id="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vaults…"
                  className="w-full rounded-md border border-[#E2E8F0] bg-white pl-9 pr-3 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
                <span className="pointer-events-none absolute left-2.5 top-1.5 text-[#94A3B8]">
                  <SearchIcon size={18} />
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={clsx(btn.outlineSmall, 'gap-1', isRefreshing && 'opacity-50')}
                title="Refresh"
                aria-label="Refresh"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {!isProduction && (
                <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  {isStaging ? 'STAGING' : 'TEST'} MODE
                </div>
              )}
              
{/* Transfer Dropdown */}
<div className="relative" ref={transferRef}>
  <button
    onClick={() => setTransferDropdownOpen(!transferDropdownOpen)}
    className={clsx(
      "inline-flex items-center justify-center rounded-md px-3 py-1.5 transition shadow-sm gap-1.5",
      "bg-[#2962FF] text-white hover:bg-[#1E53E5]"
    )}
  >
    {/* Bidirectional arrow icon */}
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M7 16V4m0 0L3 8m4-4l4 4m10 0v12m0 0l4-4m-4 4l-4-4" 
      />
    </svg>
    <span>Transfer</span>
    <ChevronDown size={14} className={clsx('transition-transform', transferDropdownOpen && 'rotate-180')} />
  </button>
  
  {transferDropdownOpen && (
    <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E0E2E7] rounded-lg shadow-lg py-1 z-50">
      <button
        onClick={() => {
          setTransferDropdownOpen(false);
          setShowDepositModal(true);
        }}
        className="w-full text-left px-4 py-2 text-[13px] text-[#0F172A] hover:bg-[#F8F9FD] transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Deposit Cash
      </button>
      <button
        onClick={() => {
          setTransferDropdownOpen(false);
          setShowWithdrawModal(true);
        }}
        className="w-full text-left px-4 py-2 text-[13px] text-[#0F172A] hover:bg-[#F8F9FD] transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l-4-4m4 4l4-4" />
        </svg>
        Withdraw Cash
      </button>
    </div>
  )}
</div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#F8F9FD] transition-colors"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F3F4F6]">
                    <span className="text-[13px] font-medium">{user?.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <ChevronDown size={16} className={clsx('text-[#64748B] transition-transform', profileDropdownOpen && 'rotate-180')} />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#E2E8F0]">
                      <div className="text-[13px] font-medium text-black truncate">{user?.email}</div>
                    </div>
                    <button
                      onMouseDown={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sign out mousedown');
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#787B86] hover:bg-[#F8F9FD] hover:text-black transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="md:hidden flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              className="-ml-1 p-2 rounded-md hover:bg-[#F3F4F6]"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={20} />
            </button>
            <button onClick={() => onNavigate('marketing')} className="hover:opacity-80 transition-opacity">
              <span className="text-lg font-medium tracking-tight text-black">
                escrowhaven<span className="text-[#2962FF]">.io</span>
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {!isProduction && (
              <div className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px] font-medium">
                {isStaging ? 'STG' : 'TEST'}
              </div>
            )}
            
            
            {/* Mobile Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-[#F8F9FD] transition-colors"
              >
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-[#F3F4F6]">
                  <span className="text-[11px] font-medium">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <ChevronDown size={14} className={clsx('text-[#64748B] transition-transform', profileDropdownOpen && 'rotate-180')} />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#E2E8F0]">
                    <div className="text-[12px] font-medium text-black truncate">{user?.email}</div>
                  </div>
                  <button
                  onMouseDown={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Sign out mousedown');
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-[#787B86] hover:bg-[#F8F9FD] hover:text-black transition-colors"
                >
                  Sign Out
                </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 w-full overflow-hidden min-h-0">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 flex-shrink-0 border-r border-[#E5E7EB] bg-white flex-col min-h-0">
          <div className="p-3">
            <button onClick={openCreate} className={btn.primary + ' w-full gap-2'}>
              <Plus size={16} />
              New Vault
            </button>
          </div>
          <nav className="px-3 flex-1 min-h-0 overflow-y-auto">
          {(
  [
    { id: 'all', label: 'All Vaults', icon: FileText },
    { id: 'needs', label: 'Action Required', icon: AlertCircle },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'received', label: 'Received', icon: Download },
    { id: 'active', label: 'In Progress', icon: DollarSign },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
  ] as { id: Folder; label: string; icon: React.ComponentType<any> }[]
).map((f) => {
              const Icon = f.icon;
              const active = activeFolder === f.id;
              const count = getFolderCount(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => handleFolderChange(f.id)}
                  className={clsx(
                    'mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] transition',
                    active ? 'bg-[#EFF6FF] text-[#2962FF]' : 'text-[#334155] hover:bg-[#F8FAFC]'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className={active ? 'text-[#2962FF]' : 'text-[#475569]'} />
                    {f.label}
                  </span>
                  {count > 0 && (
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-[11px]',
                        active ? 'bg-[#2962FF] text-white' : 'bg-[#E2E8F0] text-[#475569]'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="border-t border-[#E5E7EB] px-3 py-3 space-y-1.5">
            <button 
              onClick={() => onNavigate('transparency')} 
              className="w-full text-left text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors py-1.5"
            >
              Transparency
            </button>
            <button 
              onClick={() => window.open('/help', '_blank')}
              className="w-full text-left text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors py-1.5"
            >
              Help
            </button>
            <button 
              onClick={() => {
                const message = prompt('Found a bug or have feedback?');
                if (message) {
                  supabase.from('feedback').insert({
                    user_email: user?.email,
                    feedback: message,
                    type: 'manual_feedback',
                    url: window.location.href
                  }).then(() => {
                    alert('Thanks for the feedback!');
                  });
                }
              }}
              className="w-full text-left text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors py-1.5"
            >
              Feedback
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col min-h-0 bg-white">
{/* Metrics - 2 CARDS (Active First) */}
<div className="border-b border-[#E5E7EB] bg-white px-4 md:px-6 pt-3 pb-3 flex-shrink-0">
            <div className="hidden md:grid grid-cols-2 gap-3">
              <div className="rounded-md border border-[#E2E8F0] p-3">
                <div className="text-[12px] text-[#64748B]">Active Vaults</div>
                <div className="mt-1 text-[20px] font-semibold">
                  ${metrics.protectedInEscrow.toFixed(2)}
                  {!isProduction && metrics.protectedInEscrow > 0 && (
                    <span className="ml-1 text-[10px] text-yellow-600 font-normal">(TEST)</span>
                  )}
                </div>
                <div className="mt-0.5 text-[12px] text-[#26A69A]">{metrics.activeEscrows} in progress</div>
              </div>
              
              <div className="rounded-md border border-[#E2E8F0] p-3">
                <div className="text-[12px] text-[#64748B]">Cash*</div>
                <div className="mt-1 text-[20px] font-semibold">
                  ${metrics.availableToWithdraw.toFixed(2)}
                  {!isProduction && metrics.availableToWithdraw > 0 && (
                    <span className="ml-1 text-[10px] text-yellow-600 font-normal">(TEST)</span>
                  )}
                </div>
                <div className="mt-0.5 text-[12px] text-[#2962FF]">Ready to withdraw</div>
              </div>
            </div>

            {/* Mobile metrics - 2 CARDS */}
            <div className="md:hidden grid grid-cols-2 gap-2">
              <div className="rounded-md border border-[#E2E8F0] p-2">
                <div className="text-[10.5px] text-[#64748B]">Active</div>
                <div className="text-[14px] font-semibold leading-snug">${metrics.protectedInEscrow.toFixed(2)}</div>
                <div className="text-[10.5px] text-[#26A69A]">{metrics.activeEscrows} in progress</div>
              </div>
              <div className="rounded-md border border-[#E2E8F0] p-2">
                <div className="text-[10.5px] text-[#64748B]">Cash*</div>
                <div className="text-[14px] font-semibold leading-snug">${metrics.availableToWithdraw.toFixed(2)}</div>
                <div className="text-[10.5px] text-[#2962FF]">Ready to withdraw</div>
              </div>
            </div>
          </div>

          {/* List + Right panel */}
          <div
            ref={gridRef}
            className="grid min-h-0 flex-1"
            style={{ 
              gridTemplateColumns: rightPanelOpen && !isMobile 
                ? `minmax(0,1fr) ${rightPanelWidth || Math.floor((gridRef.current?.getBoundingClientRect().width || 1200) * 0.33)}px`
                : '1fr' 
            }}
          >
            {/* List */}
            <div className="min-w-0 min-h-0 flex flex-col">
              {/* Column headings */}
              <div className="hidden md:flex items-center border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC]">
                <div className="flex-[3.5] text-[11px] font-medium text-[#64748B]">
                  Party / Description
                </div>
                <div className="hidden lg:block flex-[0.8] text-[11px] font-medium text-[#64748B]">
                  Status
                </div>
                <div className="hidden md:block flex-[1.2] text-right text-[11px] font-medium text-[#64748B]">
                  Amount
                </div>
                <div className="hidden xl:block flex-[2] text-center text-[11px] font-medium text-[#64748B]">
                  Action
                </div>
                <div className="xl:hidden flex-[1]"></div>
                <div className="hidden sm:block flex-[1.5] text-right text-[11px] font-medium text-[#64748B]">
                  Last Update
                </div>
              </div>

              {/* Mobile list header */}
              <div className="md:hidden h-9 border-b border-[#E5E7EB] bg-white px-4 flex items-center text-[12px] text-[#64748B]">
                Vaults ({displayCount})
              </div>

              {/* List */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-white">
                {sortedEscrows.length === 0 && !isLoadingMore ? (
                  <div className="flex h-full flex-col items-center justify-center px-4">
                    <div className="mb-1 text-[16px]">No vaults found</div>
                    <div className="mb-4 text-[13px] text-[#64748B] text-center">
                      {activeFolder !== 'all' 
                        ? `No vaults in "${activeFolder}" folder`
                        : isProduction 
                          ? 'Start your first vault to get going' 
                          : 'Create a test vault to try it out'}
                    </div>
                    <button onClick={openCreate} className={btn.primary + ' gap-2'}>
                      <Plus size={16} />
                      Create a Vault
                    </button>
                  </div>
                ) : (
                  <div className="md:bg-white">
                    {sortedEscrows.map((e) => renderTransactionRow(e))}
                    
                    {isLoadingMore && (
                      <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2962FF]" />
                      </div>
                    )}
                    
                    {hasMore && !isLoadingMore && (
                      <div ref={observerTarget} className="h-10" />
                    )}
                    
                    {!hasMore && sortedEscrows.length > 0 && (
                      <div className="text-center py-4 text-[13px] text-[#64748B]">
                        All {sortedEscrows.length} vaults loaded
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

              {/* Right panel - Desktop */}
              {rightPanelOpen && !isMobile && (
                <div className="relative border-l border-[#E5E7EB] bg-white min-h-0 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 w-1 cursor-col-resize hover:bg-[#2962FF] z-10"
                    onMouseDown={() => setIsResizing(true)}
                  />
                  <div className="h-full overflow-hidden">
                    {rightPanelView === 'create' ? (
                      <CreateEscrowWizard isOpen onClose={closePanel} onEscrowCreated={onEscrowCreated} />
                    ) : rightPanelView === 'detail' && selectedEscrowId ? (
                      <EscrowDetailPanel
                        escrowId={selectedEscrowId}
                        isOpen
                        onClose={closePanel}
                        onUpdate={handleRefresh}
                        onShowMoonPay={handleShowMoonPay}
                        onShowDeposit={(amount) => {
                          setRightPanelOpen(false);
                          setDepositSuggestedAmount(amount);
                          setShowDepositModal(true);
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Dashboard Footer - USDC Disclaimer */}
      <div className="border-t border-[#E5E7EB] bg-white px-4 md:px-6 py-2 flex-shrink-0">
        <p className="text-[11px] text-[#94A3B8] text-center">
          * Cash balances are held in USDC, a fully collateralized stablecoin
        </p>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[82vw] max-w-[300px] bg-white shadow-xl flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
              <div className="flex items-center">
                <span className="text-xl font-medium tracking-tight text-black">
                  escrowhaven<span className="text-[#2962FF]">.io</span>
                </span>
              </div>
              <button className="p-2 rounded-md hover:bg-[#F3F4F6]" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="p-3">
              <button onClick={() => { setMobileNavOpen(false); openCreate(); }} className={btn.primary + ' w-full gap-2'}>
                <Plus size={16} />
                Create a Vault
              </button>
            </div>
            <nav className="px-3 flex-1 min-h-0 overflow-y-auto">
            {(
                [
                  { id: 'all', label: 'All Vaults', icon: FileText },
                  { id: 'needs', label: 'Action Required', icon: AlertCircle },
                  { id: 'sent', label: 'Sent', icon: Send },
                  { id: 'received', label: 'Received', icon: Download },
                  { id: 'active', label: 'In Progress', icon: DollarSign },
                  { id: 'completed', label: 'Completed', icon: CheckCircle },
                ] as { id: Folder; label: string; icon: React.ComponentType<any> }[]
              ).map((f) => {
                const Icon = f.icon;
                const active = activeFolder === f.id;
                const count = getFolderCount(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => { handleFolderChange(f.id); setMobileNavOpen(false); }}
                    className={clsx(
                      'mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-[14px] transition',
                      active ? 'bg-[#EFF6FF] text-[#2962FF]' : 'text-[#334155] hover:bg-[#F8FAFC]'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} className={active ? 'text-[#2962FF]' : 'text-[#475569]'} />
                      {f.label}
                    </span>
                    {count > 0 && (
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-[12px]',
                          active ? 'bg-[#2962FF] text-white' : 'bg-[#E2E8F0] text-[#475569]'
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Mobile sidebar footer */}
            <div className="border-t border-[#E5E7EB] px-3 py-3 space-y-1.5">
              <button 
                onClick={() => { setMobileNavOpen(false); onNavigate('transparency'); }} 
                className="w-full text-left text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors py-1.5"
              >
                Transparency
              </button>
              <button 
                onClick={() => { setMobileNavOpen(false); window.open('/help', '_blank'); }}
                className="w-full text-left text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors py-1.5"
              >
                Help
              </button>
              <button 
                onClick={() => {
                  const message = prompt('Found a bug or have feedback?');
                  if (message) {
                    supabase.from('feedback').insert({
                      user_email: user?.email,
                      feedback: message,
                      type: 'manual_feedback',
                      url: window.location.href
                    }).then(() => {
                      alert('Thanks for the feedback!');
                    });
                  }
                  setMobileNavOpen(false);
                }}
                className="w-full text-left text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors py-1.5"
              >
                Feedback
              </button>
            </div>
          </div>
        </div>
      )}

{/* Mobile panel */}
{rightPanelOpen && isMobile && (
  <div className="fixed inset-0 z-50 bg-white flex flex-col">
    {rightPanelView === 'create' ? (
      <CreateEscrowWizard isOpen onClose={closePanel} onEscrowCreated={onEscrowCreated} />
    ) : rightPanelView === 'detail' && selectedEscrowId ? (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <EscrowDetailPanel
          escrowId={selectedEscrowId}
          isOpen
          onClose={closePanel}
          onUpdate={handleRefresh}
          onShowMoonPay={handleShowMoonPay}
          onShowDeposit={(amount) => {
            setRightPanelOpen(false);
            setDepositSuggestedAmount(amount);
            setShowDepositModal(true);
          }}
        />
      </div>
    ) : null}
  </div>
)}

      {/* NPS Feedback Modal */}
      {showFeedbackForEscrow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Quick question</h3>
            <p className="text-sm text-gray-600 mb-4">
              How likely are you to recommend escrowhaven to a friend or colleague?
            </p>
            
            <div className="flex justify-between mb-2 gap-1">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScore(i)}
                  className={clsx(
                    "w-9 h-9 rounded text-sm font-medium transition-all",
                    selectedScore === i 
                      ? "bg-[#2962FF] text-white" 
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-4">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
            
            {selectedScore !== null && (
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg text-sm mb-4"
                rows={2}
                placeholder={
                  selectedScore <= 6 
                    ? "What would need to change for you to recommend us?"
                    : selectedScore <= 8
                    ? "What could we improve?"
                    : "What do you love about escrowhaven?"
                }
                id="feedback-text"
              />
            )}
            
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (selectedScore !== null) {
                    const feedbackText = (document.getElementById('feedback-text') as HTMLTextAreaElement)?.value;
                    await supabase.from('feedback').insert({
                      user_email: user?.email,
                      nps_score: selectedScore,
                      feedback: feedbackText || null,
                      type: 'nps',
                      escrow_id: showFeedbackForEscrow
                    });
                    
                    await supabase
                      .from('escrows')
                      .update({ feedback_given: true })
                      .eq('id', showFeedbackForEscrow);
                    
                    setShowFeedbackForEscrow(null);
                    setSelectedScore(null);
                    
                    if (selectedScore >= 9) {
                      alert('Thanks! Glad you love escrowhaven!');
                    } else {
                      alert('Thanks for the honest feedback!');
                    }
                  }
                }}
                disabled={selectedScore === null}
                className={clsx(
                  "flex-1 py-2 rounded-lg transition-colors",
                  selectedScore !== null 
                    ? "bg-[#2962FF] text-white hover:bg-[#1E53E5]" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Submit
              </button>
              <button
                onClick={async () => {
                  await supabase
                    .from('escrows')
                    .update({ feedback_given: true })
                    .eq('id', showFeedbackForEscrow);
                  setShowFeedbackForEscrow(null);
                  setSelectedScore(null);
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setDepositSuggestedAmount(undefined);
        }}
        suggestedAmount={depositSuggestedAmount}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />

    </div>
  );
}
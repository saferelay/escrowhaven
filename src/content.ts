// src/content.ts
export const content = {
    nav: {
      logo: 'MERCURY',
      links: [
        { label: 'Products', href: '#products' },
        { label: 'Solutions', href: '#solutions' },
        { label: 'Resources', href: '#resources' },
        { label: 'About', href: '#about' },
        { label: 'Pricing', href: '#pricing' },
      ],
      actions: [
        { label: 'Log In', href: '/login', variant: 'ghost' },
        { label: 'Open Account', href: '/signup', variant: 'primary' },
      ],
    },
    hero: {
      title: 'Powerful banking.',
      subtitle: 'Simplified finances.',
      description: 'Apply in 10 minutes for online business banking* that transforms how you operate.',
      cta: {
        primary: { label: 'Open Account', href: '/signup' },
        secondary: { label: 'Contact Sales', href: '/contact' },
      },
      email: {
        placeholder: 'Enter your email',
        button: 'Open Account',
      },
      dashboard: {
        balance: '$12,582,210.37',
        lastDays: 'Last 30 Days',
        change: '+$2.3M',
        changePercent: '+1.4M',
        accounts: [
          { label: 'Payroll', amount: '$1,149,268.21' },
          { label: 'Operating Expenses', amount: '$1,823,321.78' },
          { label: 'Treasury', amount: '$8,038,617.24' },
          { label: 'Accounts Payable', amount: '$226,737.82' },
          { label: 'Accounts Receivable', amount: '$0.00' },
        ],
      },
    },
    operatorSection: {
      title: 'Let banking power your financial operations',
      subtitle: 'Banking should do more for your business. Now, it can.',
      cta: { label: 'Explore Demo', href: '/demo' },
    },
    features: {
      title: 'Complete any banking task in just a few clicks',
      subtitle: '"An operator\'s dream. Mercury combines the speed, simplicity, and smarts that I need to get back to running my business. Switch for data or actions, all at your fingertips."',
      author: 'Lindsay Liu',
      authorTitle: 'CEO & Co-founder, Super',
      items: [
        {
          title: 'Send and receive payments seamlessly',
          description: 'Set auto-transfer rules and send free USD wires.',
          cta: 'Checking & Savings',
          image: '/images/placeholder-payments-01.png',
        },
        {
          title: 'Unlock credit cards earlier with industry-low deposit minimums',
          description: 'Unlimited 1.5% cashback¹ on all spend.',
          cta: 'Explore Cards',
          image: '/images/placeholder-cards-02.png',
        },
      ],
    },
    confidence: {
      title: 'Bank with complete confidence',
      tabs: [
        { label: 'FDIC insurance', value: 'fdic' },
        { label: 'Regulated partners', value: 'partners' },
        { label: 'Fraud monitoring', value: 'fraud' },
        { label: 'Account security', value: 'security' },
      ],
      fdic: {
        amount: '$5M',
        label: 'Mercury',
        standard: '$250K',
        standardLabel: 'Industry standard',
        description: 'Get up to 20× the industry standard² in FDIC insurance through our partner banks and sweep networks.',
        cta: 'How Mercury Works',
      },
    },
    billPay: {
      title: 'Handle all your bills with precision',
      subtitle: 'Explore Bill Pay',
      features: [
        'Hold your money for longer by eliminating third-party processing',
        'Harness AI to populate bill details for you',
        'Set multi-layered approvals and approve payments instantly via Slack',
        'Never overpay with duplicate bill detection',
      ],
      video: '/images/placeholder-billpay-03.mp4',
    },
    invoicing: {
      title: 'Seamless invoicing for you and your customers',
      subtitle: 'Explore Invoicing',
      features: [
        'Generate polished invoices in minutes',
        'Get paid by credit card, Apple Pay, Google Pay, wire, ACH transfer, and ACH debit for subscribers',
        'Easily send recurring invoices and payment reminders',
        'Simplify reconciliation with automatically matched payments and invoices',
      ],
      image: '/images/placeholder-invoice-04.png',
    },
    expenses: {
      title: 'Control spend effortlessly at any size',
      subtitle: 'Manage Expenses',
      cards: [
        'Issue corporate cards and reimburse expenses',
        'Tailor permissions to each team member',
        'Lock cards to specific merchants',
        'Easily spot duplicate subscriptions',
        'Set company-wide spend policies in minutes',
      ],
      image: '/images/placeholder-expenses-05.png',
    },
    accounting: {
      title: 'Close the books quickly and accurately',
      subtitle: 'Explore Accounting Automations',
      features: [
        'Sync transactions to QuickBooks, NetSuite, or Xero',
        'Create rules to code card transactions and expenses',
        'See all your bills, cards, employee expenses, and incoming transactions in one place',
        'Easily review transactions with in-line receipts and notes',
      ],
      image: '/images/placeholder-accounting-06.png',
    },
    treasury: {
      title: 'Your gateway to a longer runway',
      subtitle: 'Accelerate your growth with Mercury Treasury³ and financing options integrated directly with your account.',
      stats: {
        yield: 'Earn up to 4.27% yield⁴ on your idle cash with portfolios powered by J.P. Morgan Asset Management and Morgan Stanley',
        portfolios: [
          { name: 'J.P. Morgan', percentage: '75%' },
          { name: 'Morgan Stanley', percentage: '25%' },
        ],
      },
      cta: 'Start Earning with Treasury',
      amount: '$9.6M',
      actions: [
        { label: 'Balance', active: true },
        { label: 'Draw Request', active: false },
      ],
      signature: {
        label: 'Post-Money SAFE to John Marnie',
        amount: '$250,000.00',
        date: 'Signed on Feb 7',
      },
    },
    ventureFunding: {
      title: 'Fuel your growth with startup-friendly Venture Debt',
      cta: 'Grow with Venture Debt',
      image: '/images/placeholder-venture-07.png',
    },
    safes: {
      title: 'Speed up your fundraise with free SAFEs',
      cta: 'Create a SAFE',
      image: '/images/placeholder-safes-08.png',
    },
    resources: [
      {
        title: 'Building trust as a finance leader',
        cta: 'Read the Story',
        image: '/images/placeholder-trust-09.png',
      },
      {
        title: 'Carolynn Levy, inventor of the SAFE',
        cta: 'Read the Story',
        image: '/images/placeholder-levy-10.png',
      },
      {
        title: 'Sending international wires through SWIFT',
        cta: 'Read the Story',
        image: '/images/placeholder-swift-11.png',
      },
    ],
    pricing: {
      title: 'Pricing that scales with you',
      subtitle: 'Access powerful banking⁵ for free, and advanced financial workflows starting at $35/mo.',
      plans: [
        {
          name: 'Mercury',
          price: '$0/mo.',
          description: 'Powerful business banking and finance essentials',
          cta: 'Open Account',
          features: {
            banking: [
              'FDIC-insured checking and savings accounts¹',
              'Online ACH, wires,⁶ & checks',
              'Corporate debit & credit cards⁷',
              'Up to 4.27% yield⁸ ($500K minimum balance)',
            ],
            billPay: ['∞ Unlimited bill payments'],
            invoicing: ['∞ Unlimited invoice generation'],
            reimbursements: ['Reimburse up to 5 users/month'],
          },
          highlight: false,
        },
        {
          name: 'Mercury Plus',
          price: '$35/mo.',
          description: 'Everything Mercury offers, with more reimbursements and invoicing power.',
          cta: 'Get Started',
          features: {
            banking: [
              'FDIC-insured checking and savings accounts¹',
              'Online ACH, wires,⁶ & checks',
              'Corporate debit & credit cards⁷',
              'Up to 4.27% yield⁸ ($500K minimum balance)',
            ],
            billPay: ['∞ Unlimited bill payments'],
            invoicing: [
              '∞ Unlimited invoice generation',
              '✓ Recurring invoicing',
              '✓ ACH debit + $10/ACH debit transaction',
            ],
            reimbursements: ['Reimburse up to 20 users/month + $5/additional active user'],
          },
          highlight: true,
        },
        {
          name: 'Mercury Pro',
          price: '$350/mo.',
          description: 'Everything Mercury Plus offers, with advanced workflows and dedicated support.',
          cta: 'Get Started',
          features: {
            banking: [
              'FDIC-insured checking and savings accounts¹',
              'Online ACH, wires,⁶ & checks',
              'Corporate debit & credit cards⁷',
              'Up to 4.27% yield⁸ ($500K minimum balance)',
            ],
            billPay: ['∞ Unlimited bill payments'],
            invoicing: [
              '∞ Unlimited invoice generation',
              '✓ Recurring invoicing',
              '✓ ACH debit + $10/ACH debit transaction',
            ],
            reimbursements: ['Reimburse up to 250 users/month + $5/additional active user'],
          },
          highlight: false,
        },
      ],
      comparison: [
        { feature: 'Xero', basic: true, plus: true, pro: true },
        { feature: 'QuickBooks', basic: false, plus: true, pro: true },
        { feature: 'NetSuite', basic: false, plus: false, pro: true },
      ],
      expertise: {
        title: 'Tap into expertise',
        description: 'Relationship manager Also partnered at $100K+ balance',
      },
    },
    testimonial: {
      quote: 'Mercury enables over 200K startups of all sizes to operate at their highest level.',
      cta: 'Open Account',
    },
    footer: {
      sections: [
        {
          title: 'Banking',
          links: [
            'Business Checking & Savings',
            'Treasury',
            'Business Credit Cards',
            'Working Capital',
            'Venture Debt',
            'Personal Banking',
          ],
        },
        {
          title: 'Finance Ops',
          links: [
            'Financial Workflows',
            'Bill Pay',
            'Invoicing',
            'Expense Management',
            'Accounting Automations',
            'SAFEs',
          ],
        },
        {
          title: 'Platform',
          links: [
            'Pricing',
            'Switch to Mercury',
            'Security',
            'APIs',
            'Perks',
          ],
        },
        {
          title: 'Solutions',
          links: [
            'Ecommerce',
            'Agencies & Consultants',
            'SaaS',
            'Life Science',
            'US Funds',
            'Crypto',
            'Climate',
            'LLCs',
            'Accounting Firms',
          ],
        },
        {
          title: 'Resources',
          links: [
            'Help Center',
            'Meridian',
            'Blog',
            'Tools',
            'Events',
          ],
        },
        {
          title: 'Mercury Raise',
          links: [
            'Raise Overview',
            'Investor Database',
            'Investor Connect',
            'Founder Community',
            'Summit Series',
          ],
        },
        {
          title: 'About',
          links: [
            'How Mercury Works',
            'Our Story',
            'Careers',
            'Partnerships',
            'Contact',
            'Legal',
            'Privacy Policy',
          ],
        },
      ],
      social: {
        title: 'Follow Us',
        links: [
          { name: 'X', href: 'https://twitter.com/mercury' },
          { name: 'LinkedIn', href: 'https://linkedin.com/company/mercury' },
          { name: 'YouTube', href: 'https://youtube.com/mercury' },
          { name: 'Instagram', href: 'https://instagram.com/mercury' },
          { name: 'TikTok', href: 'https://tiktok.com/@mercury' },
        ],
      },
      account: {
        title: 'Account',
        links: [
          'Open Account',
          'Log In',
          'iOS',
          'Android',
        ],
      },
      disclaimers: [
        '1. The Mercury Debit Mastercard® is issued by Choice Financial Group, Member FDIC, pursuant to a license from Mastercard. Check card and ACH/electronic wire withdrawals and transfers of $250K+...',
        '2. You must have an account with Mercury and meet deposit minimums to become eligible for FDIC...',
        '3. The IO Cards Treasury Prime Bank, Member FDIC, pursuant to a license from Mastercard. Cashback is automatically credited to your linked checking account when your monthly statement is processed...',
        '4. Mercury Treasury via Mercury Advisors, LLC, an SEC-registered investment adviser, earns interest claiming up to a 4.27% annualized year rate cash. Net yield excludes any of 20TBD% annual Mercury Advisors of $250K+...',
        '5. Treasury accounts are offered by Mercury Advisors LLC, an SEC-registered investment adviser ("Mercury Advisors"), and are custodied by Apex Clearing Corporation, a registered broker-dealer...',
        '6. New USD international wires are subject to a flat 1% currency exchange fee. Non-USD transactions made with business debit cards and ATG credit cards are also subject to an international transaction fee.',
      ],
    },
  };
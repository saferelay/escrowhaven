// components/Seo.tsx
import Head from 'next/head';
import { BRAND_NAME } from '@/lib/constants';

interface SeoProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}

export function Seo({ 
  title = `${BRAND_NAME} – 98% Payouts, No Chargebacks`,
  description = `${BRAND_NAME} lets freelancers keep 98% of every invoice while clients pay risk-free through escrow. No crypto wallet needed.`,
  ogImage = '/og-image.png',
  canonical = 'https://saferelay.com'
}: SeoProps) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is escrow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Escrow is a financial arrangement where funds are held by a neutral third party (in our case, a smart contract) until both parties fulfill their obligations. The money is locked and only released when both the payer and recipient agree."
        }
      },
      {
        "@type": "Question",
        "name": "Who pays the 1.99% fee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The recipient does. When funds are released, the recipient receives 98.01% of the total amount, and SafeRelay takes 1.99% as a platform fee."
        }
      },
      {
        "@type": "Question",
        "name": "How long do card payments take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Typically minutes after approval. Once both parties approve the release, the smart contract automatically sends funds to the recipient's wallet, which can then be withdrawn to their bank account."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if there's a dispute?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Funds stay locked in the escrow vault until both parties agree. Arbitration features are coming soon to help resolve disputes fairly when parties can't reach an agreement."
        }
      }
    ]
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": BRAND_NAME,
            "url": canonical,
            "logo": `${canonical}/logo.png`,
            "description": description
          })
        }}
      />
      
      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData)
        }}
      />
    </Head>
  );
}
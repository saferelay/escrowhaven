// src/components/marketing/sections/Testimonial.tsx
'use client';

export function Testimonial() {
  const testimonials = [
    {
      quote: "Finally sent a payment link my client didn't question. Funds locked in minutes.",
      name: "Ana G.",
      role: "Brand Designer",
      avatar: "AG"
    },
    {
      quote: "Escrow saved a $25K project when the client tried to ghost. Worth every penny.",
      name: "Marcus Chen",
      role: "Full-Stack Dev",
      avatar: "MC"
    },
    {
      quote: "No more chasing payments or eating chargebacks. This should be industry standard.",
      name: "Sarah Williams",
      role: "Content Strategist",
      avatar: "SW"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Real people, real protection
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            Join clients and freelancers who trust EscrowHaven to secure their payments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 border border-[#E0E2E7]"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full border border-[#E0E2E7] bg-[#F8F9FD] flex items-center justify-center text-[#787B86] font-medium text-sm">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <div className="font-medium text-[#000000] text-sm">{testimonial.name}</div>
                  <div className="text-xs text-[#787B86]">{testimonial.role}</div>
                </div>
              </div>
              
              <p className="text-[#787B86] text-sm leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Star rating */}
              <div className="mt-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#F7931A] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof stats - Dashboard style */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-[#E0E2E7]">
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#26A69A]">100%</div>
            <div className="text-xs text-[#787B86] mt-1">Secure</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#000000]">Instant</div>
            <div className="text-xs text-[#787B86] mt-1">Settlements</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#000000]">0%</div>
            <div className="text-xs text-[#787B86] mt-1">Hidden Fees</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#000000]">24/7</div>
            <div className="text-xs text-[#787B86] mt-1">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
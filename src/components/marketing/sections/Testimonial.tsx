// src/components/marketing/sections/Testimonial.tsx
'use client';

export function Testimonial() {
  const testimonials = [
    {
      quote: "Client disappeared after I delivered the logo files. With escrowhaven, the money was already locked. Got paid in full.",
      name: "Ana G.",
      role: "Brand Designer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
    },
    {
      quote: "No more 'I'll pay when it's done' anxiety. Client funded escrow upfront, I coded in peace. Game changer.",
      name: "Marcus Chen",
      role: "Full-Stack Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    },
    {
      quote: "Lost $900 to chargebacks last year. Now every client goes through escrowhaven. Sleep better at night.",
      name: "Sarah Williams",
      role: "Content Writer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Sellers who stopped chasing payments
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            Join Sellers who get paid without the stress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 border border-[#E0E2E7]"
            >
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border border-[#E0E2E7] object-cover"
                />
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
            <div className="text-2xl font-normal text-[#26A69A]">$0</div>
            <div className="text-xs text-[#787B86] mt-1">Lost to ghosting</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#000000]">100%</div>
            <div className="text-xs text-[#787B86] mt-1">Payment guaranteed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#000000]">1.99%</div>
            <div className="text-xs text-[#787B86] mt-1">Only fee</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#E0E2E7]">
            <div className="text-2xl font-normal text-[#000000]">Instant</div>
            <div className="text-xs text-[#787B86] mt-1">When approved</div>
          </div>
        </div>
      </div>
    </section>
  );
}
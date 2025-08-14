'use client';

export function Resources() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-12">
            <h3 className="text-2xl font-normal text-gray-900 mb-4">
              Fuel your growth with startup-friendly Venture Debt
            </h3>
            <a href="#" className="text-purple-600 font-medium">
              Grow with Venture Debt →
            </a>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12">
            <h3 className="text-2xl font-normal text-gray-900 mb-4">
              Speed up your fundraise with free SAFEs
            </h3>
            <a href="#" className="text-purple-600 font-medium">
              Create a SAFE →
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              Building trust as a finance leader
            </h3>
            <a href="#" className="text-purple-600 font-medium text-sm">
              Read the Story →
            </a>
          </div>

          <div className="group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              Carolynn Levy, inventor of the SAFE
            </h3>
            <a href="#" className="text-purple-600 font-medium text-sm">
              Read the Story →
            </a>
          </div>

          <div className="group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-xl mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              Sending international wires through SWIFT
            </h3>
            <a href="#" className="text-purple-600 font-medium text-sm">
              Read the Story →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

export function BillPay() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-normal text-gray-900 mb-8">
              Handle all your bills with precision
            </h2>
            <a href="#" className="text-purple-600 font-medium inline-block mb-8">
              Explore Bill Pay →
            </a>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="mr-3 text-purple-600">→</span>
                Hold your money for longer by eliminating third-party processing
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-purple-600">→</span>
                Harness AI to populate bill details for you
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-purple-600">→</span>
                Set multi-layered approvals and approve payments instantly via Slack
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-purple-600">→</span>
                Never overpay with duplicate bill detection
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl aspect-video flex items-center justify-center">
            <span className="text-gray-400">Bill Pay Demo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

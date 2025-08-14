'use client';

import { createElement as h } from 'react';

export function Testimonial() {
  return h('div', { className: 'py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white' },
    h('div', { className: 'max-w-4xl mx-auto px-6 lg:px-8 text-center' },
      h('h2', { className: 'text-3xl lg:text-4xl font-bold mb-8' },
        'Mercury enables over 200K startups of all sizes to operate at their highest level.'
      ),
      h('a', {
        href: '#',
        className: 'inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
      }, 'Open Account')
    )
  );
}

import React from 'react';
import { MessageSquare, Users, BarChart3, Shield, Zap, Globe } from 'lucide-react';

const features = [
  {
    name: 'Real-time Chat',
    description: 'Connect with visitors instantly using the widget we just integrated.',
    icon: MessageSquare,
  },
  {
    name: 'Customer Profiles',
    description: 'See who you are talking to with detailed user enrichment data.',
    icon: Users,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Track response times, resolution rates, and customer satisfaction scores.',
    icon: BarChart3,
  },
  {
    name: 'Enterprise Security',
    description: 'Bank-grade encryption ensures your customer conversations remain private.',
    icon: Shield,
  },
  {
    name: 'Instant Deployment',
    description: 'As you can see, integrating our solution takes less than 2 minutes.',
    icon: Zap,
  },
  {
    name: 'Global CDN',
    description: 'Our widget loads fast anywhere in the world, ensuring no lag for users.',
    icon: Globe,
  },
];

export const Features: React.FC = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to support
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 lg:mx-auto">
            Test the CRM widget on this page. Interact with the features below to simulate a real user session.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <feature.icon size={24} aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-slate-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-slate-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
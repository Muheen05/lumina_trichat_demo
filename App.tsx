import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { IntegrationGuide } from './components/IntegrationGuide';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <IntegrationGuide />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
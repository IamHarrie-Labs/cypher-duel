import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import CardShowcase from '../components/CardShowcase';
import DocsSection from '../components/DocsSection';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#F0EDDA' }}>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <CardShowcase />
      <DocsSection />
      <Footer />
    </div>
  );
};

export default Index;

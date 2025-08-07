// App.js
import React from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import HelpSection from './components/HelpSection';
import ProductCategories from './components/ProductCategories';
import FeaturedProducts from './components/FeaturedProducts';
import Footer from './components/Footer';
import { ThemeProvider } from './ThemeContext';
import { ThemeEffect } from './ThemeEffect';




function AppContent() {
  ThemeEffect();
  
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <HelpSection />
        <ProductCategories />
        <FeaturedProducts />
   
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
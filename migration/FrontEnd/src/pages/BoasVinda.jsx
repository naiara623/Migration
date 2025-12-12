import React from 'react';
import './BoasVindas.css';
import Header from '../components/Header'
import Hero from '../components/Hero';
import HelpSection from '../components/HelpSection';
import ProductCategories from '../components/ProductCategories';
import Footer from '../components/Footer';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Featured from '../components/Featured';


function BoasVindasContent() {
  ThemeEffect();
  
  return (


    <div className="App">
      <Header/>
      <main>
        <Hero />
        <HelpSection />
        <ProductCategories />
        {/* <Featured /> */}
   
      </main>
      <Footer />

    </div>
  )
}


function BoasVindas() {
  return (
    <ThemeProvider>
      <BoasVindasContent />
    </ThemeProvider>
  );
}

export default BoasVindas;

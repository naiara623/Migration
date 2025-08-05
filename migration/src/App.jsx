import React from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import HelpSection from './components/HelpSection'; // Novo componente
import ProductCategories from './components/ProductCategories';
import FeaturedProducts from './components/FeaturedProducts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <HelpSection /> {/* Adicione esta linha */}
        <ProductCategories />
        <FeaturedProducts />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
import React from 'react'
import Header from './components/Header';
import Hero from './components/Hero';
import HelpSection from './components/HelpSection';
import ProductCategories from './components/ProductCategories';
import FeaturedProducts from './components/FeaturedProducts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function BoasVinda() {
  return (
    <div className='app'>
        <Header />
        <main>
            <Hero />
            <HelpSection />
            <ProductCategories />
            <FeaturedProducts />
            <Newsletter />
        </main>
        <Footer />
      
    </div>
  )
}

export default BoasVinda

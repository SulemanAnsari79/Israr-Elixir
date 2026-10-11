import React from 'react'
import Navbar from '../../components/Navbar.jsx'
import Hero from '../../components/Hero.jsx'
import Footer from '../../components/Footer.jsx'

const Home = () => {
  return (
    <div className="store-page min-h-screen">
      {/* Navbar stays at the top */}
      <Navbar />
      <Hero /> 
      <Footer />
    </div>
  )
}

export default Home;

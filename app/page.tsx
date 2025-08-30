"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useDataCache } from '@/lib/DataCacheContext';
import ChatInterface from '@/components/ChatInterface';
import FertilizerTool from '@/components/FertilizerTool';
import MarketData from '@/components/MarketData';
import WeatherForecast from '@/components/WeatherForecast';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/lib/AuthContext';
import Login from '@/components/Login';
import Signup from '@/components/Signup';
import Link from 'next/link';

type AuthView = 'home' | 'login' | 'signup';

export default function Page() {
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { clearAllCache } = useDataCache();
  const [activeTab, setActiveTab] = useState<'chat' | 'market' | 'weather' | 'fertilizer'>('chat');
  const [authView, setAuthView] = useState<AuthView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check for redirect tab when user becomes authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const redirectToTab = sessionStorage.getItem('redirectToTab');
      if (redirectToTab && ['chat', 'market', 'weather', 'fertilizer'].includes(redirectToTab)) {
        setActiveTab(redirectToTab as any);
        sessionStorage.removeItem('redirectToTab');
      }
    }
  }, [isAuthenticated]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'login') {
      return <Login onSwitchToSignup={() => setAuthView('signup')} />;
    }
    return (
      <main className="min-h-screen">
                 

        {/* Full Screen Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
        )}

        {/* Northern River Menu (Full Screen) */}
        <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 h-full flex flex-col text-white">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-green-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1">
              <div className="space-y-8">
                {/* Navigation Section */}
                <div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        scrollToSection('home');
                        setIsMenuOpen(false);
                      }} 
                      className="block w-full text-left text-white hover:text-green-300 transition-colors py-3 text-lg"
                    >
                      <span className="text-sm text-gray-400 mr-3">01</span> Home
                    </button>
                    <button 
                      onClick={() => {
                        scrollToSection('weather');
                        setIsMenuOpen(false);
                      }} 
                      className="block w-full text-left text-white hover:text-green-300 transition-colors py-3 text-lg"
                    >
                      <span className="text-sm text-gray-400 mr-3">02</span> Weather Forecasting
                    </button>
                    <button 
                      onClick={() => {
                        scrollToSection('chatbot');
                        setIsMenuOpen(false);
                      }} 
                      className="block w-full text-left text-white hover:text-green-300 transition-colors py-3 text-lg"
                    >
                      <span className="text-sm text-gray-400 mr-3">03</span> DR. Fasal Chatbot
                    </button>
                    <button 
                      onClick={() => {
                        scrollToSection('market');
                        setIsMenuOpen(false);
                      }} 
                      className="block w-full text-left text-white hover:text-green-300 transition-colors py-3 text-lg"
                    >
                      <span className="text-sm text-gray-400 mr-3">04</span> Market Dashboard
                    </button>
                    <button 
                      onClick={() => {
                        scrollToSection('fertilizer');
                        setIsMenuOpen(false);
                      }} 
                      className="block w-full text-left text-white hover:text-green-300 transition-colors py-3 text-lg"
                    >
                      <span className="text-sm text-gray-400 mr-3">05</span> Fertilizer Tools
                    </button>
                  </div>
                </div>
                
                {/* Customer Support Section */}
                <div className="border-t border-gray-700 pt-8">
                  <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
                  <div className="space-y-3">
                    <a href="tel:888.888.8888" className="block text-gray-300 hover:text-green-300 transition-colors">888.888.8888</a>
                    <a href="mailto:Support@AgriSewa.com" className="block text-gray-300 hover:text-green-300 transition-colors">Support@AgriSewa.com</a>
                  </div>
                </div>
                
                {/* Account Section */}
                <div className="border-t border-gray-700 pt-8">
                  <h3 className="text-lg font-semibold mb-4">Account</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setAuthView('login');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-300 hover:text-green-300 transition-colors"
                    >
                      Log in
                    </button>
                    <button 
                      onClick={() => {
                        setAuthView('signup');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-300 hover:text-green-300 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">AgriSewa 2025 All Rights Reserved</p>
              <p className="text-sm text-gray-400">Site Made By Team sbwh</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/images/cows-20nehalem-20river-20ranch-poster-00001.jpg"
          >
            <source src="/images/cows-20nehalem-20river-20ranch-transcode.webm" type="video/webm" />
            <source src="/images/cows-20nehalem-20river-20ranch-transcode.mp4" type="video/mp4" />
          </video>
          
          {/* Dark Overlay for Black Clouds Effect */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>
          
          {/* Top Middle - AgriSewa Title */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 text-center text-white">
            <h1 className="text-3xl font-bold drop-shadow-2xl">AgriSewa</h1>
          </div>
          
          {/* Top Right Icons */}
          <div className="absolute top-8 right-8 z-20 flex items-center gap-4">
            {/* Person/Profile Icon */}
            <button className="p-2 text-white hover:text-green-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1 p-2 text-white hover:text-green-300 transition-colors"
            >
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </button>
          </div>
          
          {/* Centered Title - Blended with Video */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center text-white">
            <h1 className="text-6xl md:text-8xl font-light mb-8 drop-shadow-2xl">Smart Farming, <br/>Simple Living</h1>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <img 
              src="/images/down-20arrow-20white.png" 
              alt="Scroll down" 
              className="w-12 h-12 animate-bounce"
            />
          </div>
        </section>

        {/* Weather Forecasting Section */}
        <section id="weather" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">Live Weather Forecasting</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Stay one step ahead of nature with <strong>real-time weather insights</strong> tailored for your region. 
                  AgriSewa provides accurate, hyperlocal forecasts to help farmers plan irrigation, protect crops, 
                  and prepare for sudden weather changes. With timely alerts on rainfall, temperature, and humidity, 
                  farmers can reduce risks, save resources, and increase yield.
                </p>
                <button
                  onClick={() => {
                    setAuthView('signup');
                    // Set a flag to indicate user wants to go to weather tab after login
                    sessionStorage.setItem('redirectToTab', 'weather');
                  }}
                  className="bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all transform hover:scale-105"
                >
                  Check Out
                </button>
              </div>
              <div className="relative">
                <img 
                  src="/images/download-20-1-.jpeg" 
                  alt="Weather Forecasting Dashboard" 
                  className="w-full h-96 object-cover rounded-lg shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-800/20 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Chatbot Section */}
        <section id="chatbot" className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img 
                  src="/images/a-20simple-20bangladeshi-20farmer.jpeg" 
                  alt="DR. Fasal Chatbot" 
                  className="w-full h-96 object-cover rounded-lg shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-800/30 to-transparent rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-light mb-4">DR. Fasal Chatbot</h3>
                    <button
                      onClick={() => {
                        setAuthView('signup');
                        sessionStorage.setItem('redirectToTab', 'chat');
                      }}
                      className="bg-white text-green-800 px-6 py-3 rounded-full font-medium hover:bg-green-100 transition-all transform hover:scale-105"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">AI-Powered Agricultural Assistant</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Get instant answers to your farming questions with our intelligent chatbot. 
                  From crop diseases to best practices, our AI assistant provides expert guidance 
                  to help you make informed decisions for your farm.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Disease identification and treatment
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Crop management advice
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Seasonal farming tips
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Market Analytics Section */}
        <section id="market" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">Crop Price Analytics Dashboard</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Maximize profits with <strong>AgriSewa's intelligent price dashboard</strong>. 
                  Farmers can access <strong>real-time mandi prices, current arrivals, and quantity trends</strong> 
                  all in one place. Interactive <strong>price and quantity charts</strong> make it easy to track 
                  fluctuations and predict the best time to sell. With transparent pricing data and clear market 
                  signals, farmers gain the confidence to negotiate better, reduce losses, and secure fair value 
                  for their produce.
                </p>
                <button
                  onClick={() => {
                    setAuthView('signup');
                    sessionStorage.setItem('redirectToTab', 'market');
                  }}
                  className="bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all transform hover:scale-105"
                >
                  Check Out
                </button>
              </div>
              <div className="relative">
                <img 
                  src="/images/f-20shit.png" 
                  alt="Market Analytics Dashboard" 
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Fertilizer Section */}
        <section id="fertilizer" className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img 
                  src="/images/what-20grows-20well-20in-20sandy-20soil_-20-5bplants-20that-20like-20sandy-20conditions-5d.jpeg" 
                  alt="Fertilizer Recommendation System" 
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">Fertilizer Recommender</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Ensure <strong>healthy crops and balanced soil</strong> with AgriSewa's smart fertilizer advisor. 
                  Farmers simply enter details like <strong>nitrogen, phosphorus, potassium levels, organic content 
                  percentage, state, district, and crop type</strong>. Based on these inputs, AgriSewa suggests 
                  the most suitable fertilizer at the right time. This helps avoid overuse, cut costs, and improve 
                  soil health.
                </p>
                <button
                  onClick={() => {
                    setAuthView('signup');
                    sessionStorage.setItem('redirectToTab', 'fertilizer');
                  }}
                  className="bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all transform hover:scale-105"
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-800 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-8">Better Yields, Brighter Future</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using AgriSewa to improve their farming practices and increase their yields.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setAuthView('signup')}
                className="bg-white text-green-800 px-8 py-4 rounded-full font-medium hover:bg-green-100 transition-all transform hover:scale-105"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setAuthView('login')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-green-800 transition-all transform hover:scale-105"
              >
                Already a Member? Log In
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Explore</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => scrollToSection('home')} className="hover:text-green-400 transition-colors">Home</button></li>
                  <li><button onClick={() => scrollToSection('weather')} className="hover:text-green-400 transition-colors">Weather</button></li>
                  <li><button onClick={() => scrollToSection('chatbot')} className="hover:text-green-400 transition-colors">Chatbot</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-green-400 transition-colors">Support</a></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
                <p className="text-gray-400 mb-4">Sign up for monthly specials, discounts and more.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAuthView('signup')}
                    className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => setAuthView('login')}
                    className="border border-white text-white px-6 py-2 rounded-full font-medium hover:bg-white hover:text-gray-900 transition-colors"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>AgriSewa 2025 All Rights Reserved | Site Made By Team sbwh</p>
            </div>
          </div>
        </footer>
      </main>
    );  
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'market':
        return <MarketData />;
      case 'weather':
        return <WeatherForecast />;
      case 'fertilizer':
        return <FertilizerTool />;
      case 'chat':
      default:
        return <ChatInterface />;
    }
  };

  return (
    <main className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Agri Sahayak Logo" 
                className="h-12 w-12 rounded-full shadow-lg transform hover:rotate-12 transition-transform"
              />
              <h1 className="text-2xl font-bold text-white text-shadow">{t('title')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link href="/profile" className="p-2 rounded-full hover:bg-green-700/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button
                onClick={() => {
                  clearAllCache();
                  logout();
                }}
                className="btn-primary text-sm bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

             {/* Navigation Tabs */}
       <div className="flex-shrink-0 border-b">
         <nav className="mx-auto max-w-7xl px-4">
           <div className="flex space-x-8">
             {[
               { id: 'chat', label: 'Chat' },
               { id: 'market', label: 'Market Prices' },
               { id: 'weather', label: 'Weather Forecast' },
               { id: 'fertilizer', label: 'Fertilizer Tool' },
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`py-4 px-1 border-b-2 font-medium text-sm text-shadow ${
                   activeTab === tab.id
                     ? 'border-white text-white'
                     : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                 } transition-colors`}
               >
                 {tab.label}
               </button>
             ))}
           </div>
         </nav>
       </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-hidden p-6">
        <div className="mx-auto h-full max-w-7xl card">
          <div className="h-full overflow-y-auto fade-in">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
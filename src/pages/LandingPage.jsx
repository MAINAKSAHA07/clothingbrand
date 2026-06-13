import React, { useState, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Icon3dCubeSphere, 
  IconPalette, 
  IconTypography, 
  IconUsers, 
  IconDownload, 
  IconBuildingStore,
  IconPlayerPlay,
  IconArrowRight,
  IconCheck,
  IconBrandX,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconShirt
} from '@tabler/icons-react';

import state from '../store';
import HeroCanvas from '../canvas/HeroCanvas';
import ShowcaseCanvas from '../canvas/ShowcaseCanvas';
import TeaserCanvas from '../canvas/TeaserCanvas';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const snap = useSnapshot(state);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState('spin');
  const [isAnnual, setIsAnnual] = useState(true);
  const [shutterOpen, setShutterOpen] = useState(false);
  
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);

  // Monitor scroll for sticky navbar class shifts
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shutter ScrollTrigger control
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#showcase',
      start: 'top 60%',
      end: 'bottom 20%',
      onEnter: () => setShutterOpen(true),
      onEnterBack: () => setShutterOpen(true),
      onLeave: () => setShutterOpen(false),
      onLeaveBack: () => setShutterOpen(false),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // GSAP animations for sections on mount/scroll
  useEffect(() => {
    // Fade-in features
    const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
    if (featureCards) {
      gsap.fromTo(featureCards, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // How It Works step animation
    const stepCards = howItWorksRef.current?.querySelectorAll('.step-card');
    const timelineLine = howItWorksRef.current?.querySelector('.timeline-line');
    
    if (stepCards) {
      if (timelineLine) {
        gsap.fromTo(timelineLine, 
          { scaleX: 0 },
          { 
            scaleX: 1, 
            duration: 1.0, 
            ease: 'none',
            scrollTrigger: {
              trigger: howItWorksRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      gsap.fromTo(stepCards, 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }, []);

  const brands = ["ThreadCo", "UrbanStitch", "NovaWear", "StitchLab", "EcoThread", "VelocityFit", "Loom&Weave", "AuraWear"];

  const features = [
    {
      icon: <Icon3dCubeSphere className="w-6 h-6 text-blue-500" />,
      title: "3D Live Preview",
      desc: "Give customers a realistic 3D preview of their customization instantly with high detail."
    },
    {
      icon: <IconPalette className="w-6 h-6 text-purple-500" />,
      title: "Fabric & Color Picker",
      desc: "Allow customers to choose from solid hex values or high-fidelity fabric textures."
    },
    {
      icon: <IconTypography className="w-6 h-6 text-pink-500" />,
      title: "Logo & Text Placement",
      desc: "Customers can upload, resize, position, and rotate decals on front and back panels."
    },
    {
      icon: <IconUsers className="w-6 h-6 text-green-500" />,
      title: "Multi-Model Fitting",
      desc: "Simulate fit on various body types to increase client confidence and decrease returns."
    },
    {
      icon: <IconDownload className="w-6 h-6 text-orange-500" />,
      title: "Export & Order Ready",
      desc: "Download high-res baked graphics, texture maps, and print-ready files with one click."
    },
    {
      icon: <IconBuildingStore className="w-6 h-6 text-indigo-500" />,
      title: "Brand White-Labeling",
      desc: "Match your domain, branding guidelines, colors, and layout directly on your custom domain."
    }
  ];

  const showcaseModes = [
    { id: 'spin', label: 'Spin & Inspect', desc: 'Rotate the shirt in any direction. Hover or drag to inspect the fabric texture and detail.' },
    { id: 'walk', label: 'See It Worn', desc: 'Preview your design on men\'s and women\'s body types — average, athletic, and plus sizes with live shirt fitting.' },
    { id: 'wind', label: 'Feel the Fabric', desc: 'Wind simulation ripples the mesh fabric. Observe how the material behaves under wind flow.' }
  ];

  const steps = [
    { number: "01", title: "Upload Your Design", desc: "Drag and drop your brand graphics, logos, or texts. Supported formats include PNG, SVG, and JPEG." },
    { number: "02", title: "Customize in 3D", desc: "Interact with fabric presets, base color palettes, sizing parameters, and model profiles in real-time." },
    { number: "03", title: "Publish & Sell", desc: "Embed the configurator widget directly into Shopify, WooCommerce, or share a standalone link to collect orders." }
  ];

  const teaserColors = [
    { name: 'Warm Gold', hex: '#EFBD48' },
    { name: 'Ocean Blue', hex: '#3b82f6' },
    { name: 'Crimson Red', hex: '#ef4444' },
    { name: 'Forest Green', hex: '#10b981' },
    { name: 'Grape Purple', hex: '#8b5cf6' },
    { name: 'Carbon Dark', hex: '#1f2937' }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPrice: 23,
      models: "1 Custom Model",
      previews: "500 previews / mo",
      features: ["Standard 3D Customizer", "Email Support", "No Custom Branding", "Vite/React Integration Embed"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      monthlyPrice: 79,
      annualPrice: 63,
      models: "5 Custom Models",
      previews: "5,000 previews / mo",
      features: ["Full White-Labeling", "Priority support (24h)", "Custom Domain Embed", "Decal Scale & Placement Editor", "Baked Texture File Exports"],
      cta: "Get Pro Access",
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      models: "Unlimited Models",
      previews: "Unlimited previews",
      features: ["Dedicated CSM Handler", "Direct API integration support", "Custom geometry importing", "SLA guarantees", "Custom lighting rigs"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      initials: "JD",
      name: "Jack Dawson",
      brand: "Aura Apparel",
      stars: 5,
      quote: "Integrating this 3D preview tool on our store saved us 40% in design revision time. Customers know exactly what they are getting, reducing returns to near zero."
    },
    {
      initials: "ML",
      name: "Maria Lopez",
      brand: "UrbanStitch Co.",
      stars: 5,
      quote: "The visual fidelity is absolutely stunning. The cloth ripples and direct decals make it feel like a high-end application. Highly recommended SaaS!"
    },
    {
      initials: "SK",
      name: "Sean K.",
      brand: "NovaWear Group",
      stars: 5,
      quote: "Our conversion rates skyrocketed by 25% within the first month of offering custom design embedding. The white-labeling is seamless."
    }
  ];

  return (
    <div className="w-full bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/85 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer font-bold text-xl tracking-tight text-black" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center">
              <IconShirt className="w-5 h-5" />
            </div>
            <span>Stitch3D</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#showcase" className="hover:text-black transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#teaser" className="hover:text-black transition-colors">Interactive Demo</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => state.intro = false}
              className="text-sm font-medium text-gray-700 hover:text-black px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => state.intro = false}
              className="text-sm font-medium text-white bg-black hover:bg-gray-800 px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden grid-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Block */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/5 rounded-full text-xs font-semibold text-black mb-6 w-fit border border-black/5 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              Now Supporting V2.0 PBR Texturing
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-gray-900 mb-6">
              Let Your Customers <br/>
              <span className="text-gradient-purple">Wear Their Imagination</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
              Give your clothing brand a 3D customizer that converts. No code, no friction — just your design, their way.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={() => state.intro = false}
                className="bg-black text-white hover:bg-gray-800 text-base font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-black/10 active:scale-95"
              >
                Start Building Free <IconArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#showcase"
                className="border border-gray-200 bg-white/50 text-gray-800 hover:bg-gray-50 text-base font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <IconPlayerPlay className="w-4 h-4 text-black fill-black" /> Watch Demo
              </a>
            </div>
          </div>
          
          {/* Right Hero 3D Canvas */}
          <div className="lg:col-span-5 h-[400px] md:h-[550px] relative rounded-3xl bg-gradient-to-tr from-gray-50 to-gray-100 border border-gray-200/50 shadow-2xl p-4 overflow-hidden">
            <HeroCanvas />
          </div>

        </div>
      </section>

      {/* 3. LOGOS / SOCIAL PROOF BAR */}
      <section className="py-12 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Trusted by 200+ clothing brands worldwide
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
            {[...brands, ...brands, ...brands].map((brand, index) => (
              <span key={index} className="text-gray-300 font-extrabold text-2xl tracking-widest uppercase select-none hover:text-gray-400 transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-20 md:py-28" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
              Features
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-gray-900">
              Everything your brand needs to scale customization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="feature-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. "SEE IT IN ACTION" SHOWCASE (DARK BACKGROUND) */}
      <section id="showcase" className="py-20 md:py-28 bg-[#0A0A0A] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Controls */}
            <div className="lg:col-span-5 flex flex-col text-left">
              <h2 className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-3">
                See It In Action
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
                High-fidelity 3D animations, custom fit, and cloth physics
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Toggle through different pre-baked visual simulations and interactive environments. Observe texture stretching and rendering details.
              </p>

              {/* Mode Toggles */}
              <div className="flex flex-col gap-4">
                {showcaseModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveShowcase(mode.id)}
                    className={`text-left p-5 rounded-xl border transition-all duration-300 ${
                      activeShowcase === mode.id
                        ? 'bg-white/10 border-white/20 shadow-lg'
                        : 'border-transparent bg-transparent hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <h4 className="font-bold text-white mb-1">{mode.label}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column Showcase 3D Canvas */}
            <div className="lg:col-span-7 h-[400px] md:h-[500px] glow-card rounded-2xl">
              <ShowcaseCanvas mode={activeShowcase} shutterOpen={shutterOpen} />
            </div>

          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-20 md:py-28" ref={howItWorksRef}>
        <div className="max-w-7xl mx-auto px-6 how-it-works-container">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
              Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-gray-900">
              Integrate in three simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connector Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gray-100 origin-left scaleX-0 timeline-line z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="step-card flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mb-6 shadow-lg border-4 border-white">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE DEMO TEASER */}
      <section id="teaser" className="py-20 md:py-28 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-3">
              Try It Live
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">
              Mini 3D Customizer Teaser
            </h3>
            <p className="text-sm text-gray-500 mt-3">
              Pick a color below and watch the 3D shirt update instantly. Drag to rotate the shirt.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xl">
            {/* Canvas Block */}
            <div className="lg:col-span-7 h-[350px] md:h-[450px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              <TeaserCanvas />
            </div>

            {/* Config Block */}
            <div className="lg:col-span-5 flex flex-col p-4 text-left">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Preset Fabrics & Colors</h4>
              <p className="text-lg font-bold text-gray-900 mb-6">Select shirt dye color:</p>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {teaserColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => state.color = color.hex}
                    className={`flex flex-col items-center p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      snap.color === color.hex 
                        ? 'border-black bg-gray-50 ring-2 ring-black/5 font-semibold text-black' 
                        : 'border-gray-200 bg-white text-gray-500'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mb-2 border border-black/10 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] whitespace-nowrap">{color.name}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Want to add custom decals, edit text overlays, upload your brand files, or change models? Try the full interactive editor.
                </p>
                <button
                  onClick={() => state.intro = false}
                  className="w-full bg-black text-white hover:bg-gray-800 text-sm font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Try Full Customizer <IconArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">
              Pricing Plans
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
              Flexible billing for growing brands
            </h3>
            
            {/* Annual Toggle Switch */}
            <div className="inline-flex items-center gap-3 bg-gray-100 p-1.5 rounded-full border border-gray-200/50">
              <button
                onClick={() => setIsAnnual(false)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${!isAnnual ? 'bg-white text-black shadow' : 'text-gray-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-black text-white shadow' : 'text-gray-500'}`}
              >
                Yearly <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">20% OFF</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`bg-white p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? 'border-black shadow-xl ring-2 ring-black/5 lg:scale-105 relative'
                    : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{tier.name}</h4>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">
                      {typeof tier.monthlyPrice === 'number' 
                        ? `$${isAnnual ? tier.annualPrice : tier.monthlyPrice}`
                        : tier.monthlyPrice
                      }
                    </span>
                    {typeof tier.monthlyPrice === 'number' && (
                      <span className="text-xs text-gray-400 font-semibold">/mo</span>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <p className="text-xs font-bold text-gray-900 mb-1">{tier.models}</p>
                    <p className="text-xs text-gray-400 mb-6">{tier.previews}</p>
                    
                    <ul className="flex flex-col gap-3.5 text-left text-sm text-gray-600">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <IconCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => state.intro = false}
                  className={`w-full font-bold text-sm py-3.5 rounded-xl transition-all active:scale-98 mt-8 ${
                    tier.popular
                      ? 'bg-black text-white hover:bg-gray-800 shadow-md'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-purple-600 uppercase mb-3">
              Success Stories
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">
              Loved by active designers and brands
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-4 text-amber-500">
                    {Array.from({ length: test.stars }).map((_, sIdx) => (
                      <span key={sIdx} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 italic leading-relaxed mb-6">
                    "{test.quote}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                  <div className="w-10 h-10 rounded-full bg-black/5 text-black font-bold text-xs flex items-center justify-center border border-black/10 select-none">
                    {test.initials}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-gray-950">{test.name}</h4>
                    <p className="text-xs text-gray-400 font-medium">{test.brand}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
            Ready to give your brand <br/>a 3D edge?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Join 200+ brands already selling smarter with high-end, responsive 3D customization.
          </p>
          <button
            onClick={() => state.intro = false}
            className="bg-white text-black hover:bg-gray-150 font-bold px-8 py-4 rounded-full text-base shadow-xl active:scale-95 transition-all inline-flex items-center gap-2"
          >
            Start Free — No Credit Card Needed <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          <div className="md:col-span-4 flex flex-col text-left">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
                <IconShirt className="w-4 h-4" />
              </div>
              <span>Stitch3D</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
              Create and preview custom-designed 3D clothing items in real-time. Boost your brand visual experience and conversion.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors"><IconBrandX className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><IconBrandInstagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><IconBrandLinkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left text-sm">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="hover:text-white transition-colors">3D Customizer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Asset Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Embed widget</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Design Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 text-center text-xs text-gray-650 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Stitch3D Inc. All rights reserved.</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

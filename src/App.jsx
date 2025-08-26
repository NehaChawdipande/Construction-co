import React, { useState, useEffect, useRef } from 'react';
import { useForm, ValidationError } from "@formspree/react";
import { Menu, X, Phone, Mail, MapPin, HardHat, Building, Wrench, ArrowRight, CheckCircle, Lightbulb, TrendingUp, Users, Sparkles, ArrowLeft, Train ,Shield, ChevronLeft, Factory, ChevronRight, Trowel, Hammer } from 'lucide-react';

// --- Advanced Animation & Utility Components ---

/**
 * A custom React hook to track if an element is in the viewport.
 * @param {object} options - Options for the IntersectionObserver.
 * @param {number} options.threshold - A number from 0 to 1 indicating the percentage of the element that must be visible to trigger.
 * @param {boolean} options.once - If true, the hook will only trigger once.
 * @returns {[React.RefObject, boolean]} - A ref to attach to the element and a boolean indicating if it's in view.
 */
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setInView(true);
        setHasAnimated(true);
      } else if (!entry.isIntersecting && options.once === false) {
        setInView(false);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options, hasAnimated]);

  return [ref, inView];
};

/**
 * A custom React hook for parallax scrolling.
 * It calculates a transform value based on the element's position in the viewport.
 * @param {number} speed - The speed of the parallax effect. A higher number means more movement.
 * @returns {object} - An object containing the transform style.
 */
const useParallax = (speed = 0.5) => {
  const ref = useRef(null);
  const [transformY, setTransformY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const top = ref.current.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;
        const progress = (top / viewportHeight) * speed;
        setTransformY(progress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call to set position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, style: { transform: `translate3d(0, ${transformY}px, 0)` } };
};

/**
 * A component to handle staggered, animated reveals using IntersectionObserver.
 * @param {object} props
 * @param {React.ReactNode} props.children - The elements to animate.
 * @param {string} props.className - Additional class names for the wrapper div.
 * @param {number} props.delay - The base delay in milliseconds.
 * @param {boolean} props.once - If the animation should only play once.
 */
const MotionDiv = ({ children, className, delay = 0, once = true }) => {
  const [ref, inView] = useInView({ threshold: 0.1, once });

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`transition-all duration-1000 ease-out transform ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}
          style={{ transitionDelay: `${delay + index * 150}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Reusable component for section titles
const SectionTitle = ({ title, subtitle }) => {
  const [ref, inView] = useInView({ threshold: 0.2, once: true });
  return (
    <div ref={ref} className="text-center mb-16 px-4">
      <h2 className={`text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight transition-all duration-1000 ease-out transform ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
        {title}
      </h2>
      <p className={`text-gray-600 mt-4 text-lg max-w-2xl mx-auto transition-all duration-1000 delay-200 ease-out transform ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{subtitle}</p>
    </div>
  );
};

// Reusable component for call-to-action buttons
const CTAButton = ({ text, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`group bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${className}`}
  >
    {text}
    <ArrowRight className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1" size={20} />
  </button>
);

/**
 * A custom hook for animating a value smoothly over time.
 * @param {number} endValue - The final value to animate to.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {boolean} trigger - A boolean to start the animation.
 * @returns {number} - The current animated value.
 */
const useFrameAnimation = (endValue, duration, trigger) => {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!trigger) {
      setValue(0);
      startRef.current = null;
      return;
    }

    const animate = (timestamp) => {
      if (!startRef.current) {
        startRef.current = timestamp;
      }
      const progress = timestamp - startRef.current;
      const ratio = Math.min(progress / duration, 1);
      setValue(Math.floor(ratio * endValue));

      if (ratio < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [trigger, endValue, duration]);

  return value;
};

// Animated Counter component - now uses our new custom hook
const AnimatedCounter = ({ end, label }) => {
  const [ref, inView] = useInView({ threshold: 0.5, once: true });
  const animatedNumber = useFrameAnimation(end, 2000, inView);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl lg:text-7xl font-extrabold text-amber-500">
        {animatedNumber}
      </div>
      <div className="text-lg text-gray-600 mt-2">{label}</div>
    </div>
  );
};

// --- Reusable Components ---
const ServiceCard = ({ icon, title, description }) => (
  <div className="group bg-white p-8 rounded-3xl shadow-lg border h-full border-gray-100 transform hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:border-amber-500/20">
    <div className="text-amber-500 inline-block p-3 bg-amber-50 rounded-xl mb-4 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TeamMember = ({ name, title, imgSrc }) => (
  <div className="text-center group p-4 transform hover:scale-105 transition-transform duration-300">
    <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4 border-white transition-shadow duration-300 group-hover:shadow-amber-500/30">
      <img src={imgSrc} alt={name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
    </div>
    <h4 className="text-xl font-bold text-gray-900">{name}</h4>
    <p className="text-amber-600 transition-colors duration-300 group-hover:text-amber-500">{title}</p>
  </div>
);

const ProjectCard = ({ title, category, imgSrc, describe }) => (
  <div className="group relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-500 hover:scale-[1.02] hover:shadow-xl">
    <img src={imgSrc} alt={title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 aspect-[4/4] lg:aspect-[4/3]" />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex flex-col justify-end p-6 transition-colors duration-300 group-hover:from-amber-700/80">
      <p className="text-amber-300 text-sm font-bold transition-opacity duration-300 group-hover:opacity-100 opacity-100">{category}</p>
      <h3 className="text-2xl font-bold text-white mb-4 transition-transform duration-300 translate-y-2 group-hover:translate-y-0">{title}</h3>
      <p className="text-gray-100 text-md font-semibold transition-opacity duration-300 group-hover:opacity-100 opacity-100">{describe}</p>

    </div>
  </div>
);

// Main App Component - Manages page navigation
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="bg-white text-gray-800 font-sans">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .animate-spin-slow {
          animation: spin 5s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .hero-background-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease-out;
        }
        `}
      </style>
      <Header currentPage={currentPage} navigateTo={navigateTo} />
      <main className="pt-0 min-h-screen">
        {renderPage()}
      </main>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

// Header Component
const Header = ({ currentPage, navigateTo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', title: 'Home' },
    { id: 'about', title: 'About Us' },
    { id: 'services', title: 'Services' },
    { id: 'projects', title: 'Projects' },
    { id: 'contact', title: 'Contact Us' },
  ];

  const handleNavClick = (page) => {
    navigateTo(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gray-800/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => handleNavClick('home')}>
          
          <img src="logo.png" alt="logo"  style={{ height: '60px', width: '100px' }}/>
          <span className="text-2xl font-bold text-gray-100 tracking-tight">AF Skyhigh Constructions</span>
        </div>
        <nav className="hidden lg:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`text-lg font-medium transition-colors duration-300 relative group px-2 py-1
                ${currentPage === link.id ? 'text-amber-500' : 'text-gray-100 hover:text-amber-500'}`}
            >
              {link.title}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${currentPage === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
          <CTAButton text="Get a Quote" onClick={() => handleNavClick('contact')} className="ml-4 py-2 px-6 rounded-lg text-base hover:scale-100" />
        </nav>
        <button
          className="lg:hidden text-gray-100 hover:text-amber-500 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/90 border-t border-gray-200 animate-slide-down">
          <nav className="flex flex-col items-center space-y-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-lg font-medium transition-colors duration-300 ${currentPage === link.id ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                  }`}
              >
                {link.title}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

// --- Page Components ---
// Home Page
const HomePage = ({ navigateTo }) => {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(-0.2);
  const [inView, inViewRef] = useInView({ threshold: 0.1 });

  // return (
  //   <>
  //     {/* Hero Section with Parallax */}
  //     <section className="min-h-[calc(100vh-6rem)] flex items-center bg-cover bg-center relative overflow-hidden">
  //       <div
  //         ref={parallaxRef}
  //         className="hero-background-image"
  //         style={{
  //           ...parallaxStyle,
  //           backgroundImage: 'url(https://images.unsplash.com/photo-1599995903128-531fc7fb694b?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
  //           willChange: 'transform' // Performance optimization
  //         }}
  //       ></div>
  //       <div className="absolute inset-0 bg-gray-900/70"></div>
  //       <div className="container mx-auto px-6 text-center text-white z-10 py-20">
  //         <MotionDiv>
  //           <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
  //             Building Your Vision, <span className="text-amber-400">Brick by Brick</span>
  //           </h1>
  //           <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-4xl mx-auto">
  //             Your trusted partner in construction, delivering quality and excellence from foundation to finish.
  //           </p>
  //           <CTAButton text="Get a Free Quote" onClick={() => navigateTo('contact')} />
  //         </MotionDiv>
  //       </div>
  //     </section>

   const images = [
    'banner1.jpg',
    'ordnance.jpg',
    'banner3.jpg',
    'lgbanner.jpg',
    'wirebundles.jpg',
    'cctv.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);

  // Function to handle the automatic image change
  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
  };

  // Function to reset the timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    resetTimer();
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    resetTimer();
  };

  return (
    <>
      {/* Hero Section with Image Slider and Arrows */}
      <section className="relative h-screen w-full flex items-center relative overflow-hidden">
        {images.map((img, index) => (
          <div
            ref={parallaxRef}
          className="hero-background-image absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            ...parallaxStyle,
            backgroundImage: `url(${img})`,
            willChange: 'transform', // Performance optimization
              opacity: index === currentImageIndex ? 1 : 0

          }}
            key={index}
           
          ></div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevClick}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-900/50 text-white hover:bg-gray-900/70 transition z-20"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNextClick}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-900/50 text-white hover:bg-gray-900/70 transition z-20"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute inset-0 bg-gray-900/70"></div>
        <div className="container mx-auto px-6 text-center text-white z-10 py-20">
          <MotionDiv>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
              Building Your Vision, <span className="text-amber-400">Brick by Brick</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-4xl mx-auto">
              Your trusted partner in construction, delivering quality and excellence from foundation to finish.
            </p>
            <CTAButton text="Get a Free Quote" onClick={() => navigateTo('contact')} />
          </MotionDiv>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          
          <SectionTitle title="Our Core Services" subtitle="We offer a wide range of construction solutions, designed to meet your every need." />
          <MotionDiv className="grid md:grid-cols-3 gap-8">
            <ServiceCard icon={<Building size={40} />} title="Government Tender Expertise" description="We specialize in managing and executing government tenders with full compliance and professionalism. Every project is delivered on time with quality assurance." />
            <ServiceCard icon={<Shield size={40} />} title="Defence Projects" description="We undertake defence-related contracts with strict attention to standards, security protocols, and reliability in execution." />
            <ServiceCard icon={<Users size={40} />} title="Labour and Workforce Supply" description="We provide skilled and semi-skilled manpower for both government and private projects, ensuring dependable workforce support." />
          </MotionDiv>
          <div className="text-center mt-16">
            <button onClick={() => navigateTo('services')} className="text-amber-600 font-semibold text-lg hover:text-amber-700 transition group">
              View All Services <ArrowRight className="inline-block ml-1 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionTitle title="Why Choose Us?" subtitle="Experience the difference of working with a partner you can trust." />
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <MotionDiv className="lg:order-2 flex flex-col items-center">
              <img src="https://plus.unsplash.com/premium_photo-1681691912442-68c4179c530c?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Construction Team" className="rounded-2xl shadow-xl w-full max-w-lg transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl" />
            </MotionDiv>
            <div className="lg:order-1">
              <MotionDiv className="space-y-8">
                <div className="flex items-start group">
                  <CheckCircle className="text-amber-500 min-w-8 min-h-8 mt-1 mr-4 transition-transform duration-300 group-hover:scale-110" size={32} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Experienced Team</h3>
                    <p className="text-gray-600 mt-1">Our crew consists of certified professionals with decades of combined experience, ensuring flawless execution.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <Lightbulb className="text-amber-500 min-w-8 min-h-8 mt-1 mr-4 transition-transform duration-300 group-hover:scale-110" size={32} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Innovative Solutions</h3>
                    <p className="text-gray-600 mt-1">We utilize the latest technology and methods to deliver efficient and sustainable construction solutions.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <Users className="text-amber-500 min-w-8 min-h-8 mt-1 mr-4 transition-transform duration-300 group-hover:scale-110" size={32} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Client-Centric Approach</h3>
                    <p className="text-gray-600 mt-1">Your vision is our priority. We maintain open communication and a collaborative process from start to finish.</p>
                  </div>
                </div>
              </MotionDiv>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// About Page
const AboutPage = () => {
  return (
    <div className="bg-white">
      <section className="py-24">
        <div className="container mx-auto px-6 mt-10">

          <SectionTitle title="About Us" subtitle="Pioneering the future of construction with a legacy of excellence." />
          <MotionDiv className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 mb-16">
            <div className="col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4 text-lg">Founded in 2025, AF Skyhigh Constructions began with a simple mission: to deliver exceptional construction services with an unwavering commitment to quality and client satisfaction. Over the years, we've grown from a small local builder into a respected firm, tackling projects of all sizes and complexities.</p>
              <p className="text-gray-600 text-lg">Our success is built on a foundation of trust, earned through transparent communication, meticulous project management, and a skilled team that takes pride in every detail.</p>
            </div>
            <div className="lg:col-span-2">
              <img src="https://plus.unsplash.com/premium_photo-1671808062726-2a7ffcd6109e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Company History" className="rounded-2xl shadow-xl w-full transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl" />
            </div>
          </MotionDiv>
          <div className="text-center py-12">
            <SectionTitle title="Meet Our Leadership" subtitle="Our team is our greatest asset, with each member bringing expertise and passion to the table." />
            <MotionDiv className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <TeamMember name="Aamir Jada" title="Founder & Director" imgSrc="https://placehold.co/300x300/cccccc/333333?text=Aamir+J." />
              <TeamMember name="Faizan Pathan" title="Founder & Director" imgSrc="https://placehold.co/300x300/cccccc/333333?text=Faizan+P." />
              {/* <TeamMember name="Mike Johnson" title="Head of Engineering" imgSrc="https://placehold.co/300x300/cccccc/333333?text=Mike+J." /> */}
            </MotionDiv>
          </div>
        </div>
      </section>
    </div>
  );
};

// Services Page
const ServicesPage = () => {
  const services = [
    { icon: <Building size={40} />, title: "Government Tender Expertise", description: "We specialize in managing and executing government tenders with full compliance and professionalism. Every project is delivered on time with quality assurance." },
    { icon: <Shield size={40} />, title: "Defence Projects", description: "We undertake defence-related contracts with strict attention to standards, security protocols, and reliability in execution." },
    { icon: <Factory size={40} />, title: "Ordnance Factory Works", description: "Our firm handles tenders for ordnance factories, meeting technical specifications with precision and durability." },
    { icon: <Train size={40} />, title: "Railway Infrastructure Solutions", description: "We deliver railway tender projects with efficiency, ensuring long-lasting construction and supply services." },
    { icon: <Users size={40} />, title: "Labour & Workforce Supply", description: "We provide skilled and semi-skilled manpower for both government and private projects, ensuring dependable workforce support." },
    { icon: <Wrench size={40} />, title: "Supply & Procurement Services", description: "We manage procurement and supply tenders, delivering resources, materials, and equipment as per project requirements." },
  ];

  return (
    <div className="bg-gray-50">
      <section className="py-24">
        <div className="container mx-auto px-6 mt-10">
          <SectionTitle title="Our Services" subtitle="Delivering a comprehensive range of construction solutions tailored to your needs." />
          <MotionDiv className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </MotionDiv>
        </div>
      </section>
    </div>
  );
};

// Projects Page
const ProjectsPage = () => {
  const projects = [
    { title: "Ordnance Factory", category: "Industrial", imgSrc: "ord1.jpg", describe: "Supplied essential raw materials including steel rods, aluminium rods, and other construction-grade resources. Ensured strict adherence to quality standards and timely delivery to support critical defence infrastructure requirements." },
    { title: "Defense Factory", category: "Industrial", imgSrc: "https://images.unsplash.com/photo-1614493557324-02b61dc031bb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d2FyZWhvdXNlJTIwZG9tZSUyMGluZGlhfGVufDB8fDB8fHww", describe: 'Delivered a wide range of electrical equipment and raw materials for construction needs. Our contribution helped strengthen operational facilities while meeting defence-sector compliance and procurement protocols.'},
    { title: "Byculla Government Hospital", category: "Commercial", imgSrc: "https://images.unsplash.com/photo-1619070284836-e850273d69ac?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", describe:"Provided telecommunications infrastructure such as wiring, CCTV systems, inverters, and related units. The project enhanced hospital safety, connectivity, and operational efficiency through reliable technology integration"},
    { title: "Byculla Railways", category: "Commercial", imgSrc: "https://plus.unsplash.com/premium_photo-1680102982036-dcbe9a9e9a4d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", describe: 'Executed supply of telecommunications materials including wires, CCTV systems, inverters, and associated units. The work supported improved security and communication systems within the railway premises.' }
  ];

  return (
    <div className="bg-white">
      <section className="py-24">
        <div className="container mx-auto px-6">
          <SectionTitle title="Our Projects" subtitle="A portfolio of our commitment to quality and craftsmanship." />
          <MotionDiv className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </MotionDiv>
        </div>
      </section>
    </div>
  );
};

// Component for animating sections on scroll
const AnimatedSection = ({ children, className, animationClass = 'animate-fade-in-up' }) => {
  const [ref, inView] = useInView({ threshold: 0.1 });
  return (
    <section ref={ref} className={`${className} transition-opacity duration-1000 transform ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </section>
  );
};

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, handleSubmit] = useForm("xandyorv");
  const [successmessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setName('');
    setEmail('');
    setMessage('');
    setSuccessMessage("Your Message has been sent! We will get back to you shortly.");
    setTimeout(() => {
      setSuccessMessage('')
    }, 7000);
  }, [state.succeeded]);


  return (
    <div className="pt-12 bg-gray-50">
      <AnimatedSection className="py-12">
        <div className="container mx-auto px-6">
          <SectionTitle title="Contact Us" subtitle="Let's build something great together. Reach out to us today." />

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
               required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
             required />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea id="message" name='message' rows="5" value={message} onChange={(e) => setMessage(e.target.value)}  className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
             required></textarea>
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                  />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-md text-lg transition duration-300 transform hover:scale-105 active:scale-95">Submit Inquiry</button>
                <div className={`mt-4 text-center text-lg ${state.succeeded ? 'text-green-600' : 'text-red-600'}`}>
                  {state.succeeded && <h1>{successmessage}</h1>}
                </div>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:w-1/2">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 animate-fade-in-up delay-100">
                    <MapPin className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg">Our Office</h3>
                      <p className="text-gray-600">Shop no. TF-S01, Third Floor, Darshani Commerical Complex 2, <br /> Masurkar Marg, Chandrashekhar Azad Chowk <br /> Nagpur, Maharashtra, 440008</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 animate-fade-in-up delay-200">
                    <Mail className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg">Email Us</h3>
                      <p className="text-gray-600"><a href="mailto: afskyhigh1529@gmail.com" className="hover:text-blue-400"> afskyhigh1529@gmail.com</a></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 animate-fade-in-up delay-300">
                    <Phone className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg">Call Us</h3>
                      <p className="text-gray-600"><a href="tel:+917507897502" className="hover:text-blue-400">+91-7507897502</a></p>
                      <p className="text-gray-600"><a href="tel:+917038630149" className="hover:text-blue-400">+91-7038630149</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

// Footer Component
const Footer = ({ navigateTo }) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
             <img src="logo.png" alt="logo"  style={{ height: '60px', width: '100px' }}/>
              <h3 className="text-1xl font-bold">AF Skyhigh Constructions</h3>
            </div>
            <p className="text-gray-400 text-sm">Building the future, restoring the past. Your trusted construction partner. <br/> GSTIN : 27ABCCA9829P1ZW</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-200">Quick Links</h3>
            <ul className="space-y-4">
              <li><button onClick={() => navigateTo('about')} className="text-gray-400 hover:text-amber-400 transition text-sm">About Us</button></li>
              <li><button onClick={() => navigateTo('services')} className="text-gray-400 hover:text-amber-400 transition text-sm">Services</button></li>
              <li><button onClick={() => navigateTo('projects')} className="text-gray-400 hover:text-amber-400 transition text-sm">Projects</button></li>
              <li><button onClick={() => navigateTo('contact')} className="text-gray-400 hover:text-amber-400 transition text-sm">Contact</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-200">Contact</h3>
            <ul className="space-y-4 text-gray-400 text-sm">

              <li className="flex items-center"><MapPin size={16} className="mr-2 text-amber-400" /><p>Shop no. TF-S01, Third Floor, <br /> Darshani Commerical Complex 2, <br />
                Masurkar Marg, <br /> Chandrashekhar Azad Chowk,
                <br />
                Nagpur, Maharashtra, 440008</p></li>
              <li className="flex items-center"><Mail size={16} className="mr-2 text-amber-400" /><a href="mailto: afskyhigh1529@gmail.com" className="hover:text-blue-400"> afskyhigh1529@gmail.com</a></li>
              <li className="flex items-center"><Phone size={16} className="mr-2 text-amber-400" /><a href="tel:+917507897502" className="hover:text-blue-400">+91-7507897502</a></li>
              <li className="flex items-center"><Phone size={16} className="mr-2 text-amber-400" /><a href="tel:+917038630149" className="hover:text-blue-400">+91-7038630149</a></li>
            </ul>
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-200">Get a Quote</h3>
            <p className="text-gray-400 mb-4 text-sm">Ready to start your project? Contact us for a free, no-obligation quote.</p>
            <CTAButton text="Request a Quote" onClick={() => navigateTo('contact')} className="py-2 px-6 rounded-md text-sm" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AF Skyhigh Constructions. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default App;

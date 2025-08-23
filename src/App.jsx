import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, Mail, MapPin, HardHat, Building, Wrench, ArrowRight, CheckCircle, Lightbulb, TrendingUp, Users, Sparkles } from 'lucide-react';

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

const ProjectCard = ({ title, category, imgSrc }) => (
  <div className="group relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-500 hover:scale-[1.02] hover:shadow-xl">
    <img src={imgSrc} alt={title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 aspect-[4/3]" />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex flex-col justify-end p-6 transition-colors duration-300 group-hover:from-amber-700/80">
      <p className="text-amber-400 text-sm font-semibold transition-opacity duration-300 group-hover:opacity-100 opacity-80">{category}</p>
      <h3 className="text-2xl font-bold text-white mb-2 transition-transform duration-300 translate-y-2 group-hover:translate-y-0">{title}</h3>
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
      <main className="pt-24 min-h-screen">
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
    <header className="bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => handleNavClick('home')}>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">AF Constructions</span>
        </div>
        <nav className="hidden lg:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`text-lg font-medium transition-colors duration-300 relative group px-2 py-1
                ${currentPage === link.id ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              {link.title}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${currentPage === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
          <CTAButton text="Get a Quote" onClick={() => handleNavClick('contact')} className="ml-4 py-2 px-6 rounded-lg text-base hover:scale-100" />
        </nav>
        <button
          className="lg:hidden text-gray-700 hover:text-amber-500 transition-colors"
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

  return (
    <>
      {/* Hero Section with Parallax */}
      <section className="min-h-[calc(100vh-6rem)] flex items-center bg-cover bg-center relative overflow-hidden">
        <div
          ref={parallaxRef}
          className="hero-background-image"
          style={{
            ...parallaxStyle,
            backgroundImage: 'url(https://images.unsplash.com/photo-1599995903128-531fc7fb694b?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            willChange: 'transform' // Performance optimization
          }}
        ></div>
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
            <ServiceCard icon={<Building size={40} />} title="Commercial Construction" description="From office buildings to retail centers, we build spaces for businesses to thrive." />
            <ServiceCard icon={<HardHat size={40} />} title="Industrial Projects" description="Specialized construction for manufacturing plants, warehouses, and industrial facilities." />
            <ServiceCard icon={<Wrench size={40} />} title="Renovation & Remodeling" description="Transforming existing structures with modern designs and improved functionality." />
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
          <SectionTitle title="Why Choose AF Constructions?" subtitle="Experience the difference of working with a partner you can trust." />
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

      {/* Achievements Section with Animated Counter */}
      {/* <section className="bg-amber-500 py-24 text-white">
        <div className="container mx-auto px-6">
          <SectionTitle title="Our Achievements" subtitle="A testament to our dedication and success in the industry." />
          <MotionDiv className="grid md:grid-cols-3 gap-8">
            <AnimatedCounter end={350} label="Projects Completed" />
            <AnimatedCounter end={180} label="Satisfied Clients" />
            <AnimatedCounter end={20} label="Years of Experience" />
          </MotionDiv>
        </div>
      </section> */}
    </>
  );
};

// About Page
const AboutPage = () => {
  return (
    <div className="bg-white">
      <section className="py-24">
        <div className="container mx-auto px-6">
          
          <SectionTitle title="About AF Constructions" subtitle="Pioneering the future of construction with a legacy of excellence." />
         <MotionDiv className="grid grid-cols-1 lg:grid-cols-2 items-top gap-6 mb-16">
    <div className="col-span-1">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
        <p className="text-gray-600 mb-4 text-lg">Founded in 2025, AF Constructions began with a simple mission: to deliver exceptional construction services with an unwavering commitment to quality and client satisfaction. Over the years, we've grown from a small local builder into a respected firm, tackling projects of all sizes and complexities.</p>
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
    { icon: <Building size={40} />, title: "Commercial Construction", description: "Comprehensive services for commercial buildings, including retail spaces, offices, and hospitality venues. We handle everything from site preparation to final inspection." },
    { icon: <HardHat size={40} />, title: "Industrial & Civil", description: "Specialized construction for industrial facilities, warehouses, and public infrastructure projects. We have the expertise to manage large-scale, complex builds." },
    { icon: <Wrench size={40} />, title: "Renovation & Remodeling", description: "Breathe new life into your space. We offer full-service renovation for both residential and commercial properties, focusing on quality and modern design." },
    { icon: <Lightbulb size={40} />, title: "Design-Build", description: "A streamlined approach where we manage both the design and construction phases, ensuring a cohesive process and a single point of responsibility." },
    { icon: <TrendingUp size={40} />, title: "Project Management", description: "Our experienced project managers oversee every aspect of your project, ensuring it stays on schedule, on budget, and meets all quality standards." },
    { icon: <CheckCircle size={40} />, title: "General Contracting", description: "As your general contractor, we take full responsibility for the daily oversight of the construction site, management of vendors, and communication of information to all involved parties." },
  ];

  return (
    <div className="bg-gray-50">
      <section className="py-24">
        <div className="container mx-auto px-6">
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
    { title: "Downtown Office Tower", category: "Commercial", imgSrc: "https://plus.unsplash.com/premium_photo-1678903963276-8437f57a0f2e?q=80&w=674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "City Logistics Warehouse", category: "Industrial", imgSrc: "https://images.unsplash.com/photo-1614493557324-02b61dc031bb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d2FyZWhvdXNlJTIwZG9tZSUyMGluZGlhfGVufDB8fDB8fHww" },
    { title: "Heritage Building Restoration", category: "Renovation", imgSrc: "https://images.unsplash.com/photo-1600316217446-94fb90887956?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RvcmF0aW9uJTIwaG9tZSUyMGluZGlhfGVufDB8fDB8fHww" },
    { title: "Suburban Retail Plaza", category: "Commercial", imgSrc: "https://plus.unsplash.com/premium_photo-1724766574079-a652075b281b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UmV0YWlsJTIwcGxhemElMjBjb25zdHJ1Y3Rpb24lMjBpbmRpYXxlbnwwfHwwfHx8MA%3D%3D" },
    { title: "Community Sports Complex", category: "Civil", imgSrc: "https://images.unsplash.com/photo-1529281364569-1b33a05ae85e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3BvcnRzJTIwY29tcGxleHxlbnwwfHwwfHx8MA%3D%3D" },
    { title: "Modern Home Extension", category: "Renovation", imgSrc: "https://media.istockphoto.com/id/2175161902/photo/exterior-of-incomplete-building-with-scaffolding-at-construction-site.webp?a=1&b=1&s=612x612&w=0&k=20&c=vFVruYuayiV7fpM6-GGMrkVX8qF6K2Br_RcPNqLmTmk=" },
  ];

  return (
    <div className="bg-white">
      <section className="py-24">
        <div className="container mx-auto px-6">
          <SectionTitle title="Our Projects" subtitle="A portfolio of our commitment to quality and craftsmanship." />
          <MotionDiv className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  const [status, setStatus] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus('Sending...');
      const apiEndpoint = '/api/contact'; // This would be your backend endpoint
  
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });
  
        if (response.ok) {
          setStatus('Message sent successfully! We will get back to you shortly.');
          setName('');
          setEmail('');
          setMessage('');
        } else {
          setStatus('Failed to send message. Please try again later.');
        }
      } catch (error) {
        console.error('Submission error:', error);
        setStatus('An error occurred. Please check your network connection.');
      }
    };

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
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea id="message" rows="5" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" required></textarea>
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-md text-lg transition duration-300 transform hover:scale-105 active:scale-95">Submit Inquiry</button>
                {status && (
                  <div className={`mt-4 text-center text-sm ${status.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {status}
                  </div>
                )}
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
                      <p className="text-gray-600">Nagpur, Maharashtra, India</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 animate-fade-in-up delay-200">
                    <Mail className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg">Email Us</h3>
                      <p className="text-gray-600">contact@afconstructions.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 animate-fade-in-up delay-300">
                    <Phone className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-semibold text-lg">Call Us</h3>
                      <p className="text-gray-600">(+91) 999-9999</p>
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
              <HardHat className="text-amber-500" size={32} />
              <h3 className="text-1xl font-bold">AF Constructions</h3>
            </div>
            <p className="text-gray-400 text-sm">Building the future, restoring the past. Your trusted construction partner.</p>
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
              <li className="flex items-center"><MapPin size={16} className="mr-2 text-amber-400" /> Nagpur, Maharashtra, India</li>
              <li className="flex items-center"><Mail size={16} className="mr-2 text-amber-400" /> contact@afConstructions.com</li>
              <li className="flex items-center"><Phone size={16} className="mr-2 text-amber-400" /> (+91) 999-9999</li>
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
        <p>&copy; {new Date().getFullYear()} AF Constructions Construction. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default App;

import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 80px 0px' });
    
    els.forEach(e => io.observe(e));

    // Safety net: fire reveal after 400ms for anything in/near view
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) el.classList.add('in');
      });
    }, 400);

    // Scroll safety net: on any scroll, sweep for near-viewport reveals
    let scrollRaf = null;
    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        document.querySelectorAll('.reveal:not(.in)').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight + 200) {
            el.classList.add('in');
            io.unobserve(el);
          }
        });
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      io.disconnect();
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);
}

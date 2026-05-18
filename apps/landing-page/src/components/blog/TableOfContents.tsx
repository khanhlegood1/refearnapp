import React, { useState, useEffect } from 'react';
import { List, X } from 'lucide-react';
import PricingCTA from './PricingCTA';

interface Heading {
  slug: string;
  text: string;
  level: number;
}

interface ToCProps {
  sections: Heading[];
}

const TableOfContents: React.FC<ToCProps> = ({ sections:initialSections }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<Heading[]>(initialSections || []);

  useEffect(() => {
    // If Astro didn't provide headings, parse the actual DOM nodes dynamically
    if (!initialSections || initialSections.length === 0) {
      const elements = document.querySelectorAll('main article h2, main article h3');
      const parsedHeadings: Heading[] = Array.from(elements).map((el) => {
        // Ensure elements have a fallback slug ID if missing in markup
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
        }
        return {
          slug: el.id,
          text: el.textContent || '',
          level: parseInt(el.tagName.replace('H', ''), 10)
        };
      });
      setSections(parsedHeadings);
    }
  }, [initialSections]);

  useEffect(() => {
    if (sections.length === 0) return;

    const observerOptions = {
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('main article h2, main article h3');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-32 flex h-[calc(100vh-10rem)] flex-col">
          <div className="mb-6 shrink-0">
            <PricingCTA variant="sidebar" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-[0.5rem] border border-slate-200 p-4">
            <p className="mb-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              On this page
            </p>

            <nav className="custom-scrollbar overflow-y-auto pr-2">
              <ul className="space-y-1">
                {sections.map((s) => {
                  const isActive = activeId === s.slug;
                  const isSubsection = s.level === 3; // Check if it's an H3

                  return (
                    <li
                      key={s.slug}
                      style={{ marginLeft: isSubsection ? '1rem' : '0' }}
                    >
                      <a
                        href={`#${s.slug}`}
                        onClick={(e) => handleClick(e, s.slug)}
                        className={`group flex items-center justify-between rounded-xl px-3 py-1.5 text-sm transition-all ${
                          isActive
                            ? 'bg-indigo-50/50 text-indigo-600'
                            : 'text-slate-500 hover:text-indigo-600'
                        } ${isSubsection ? 'ml-2 border-l border-slate-100 text-xs' : 'font-medium'}`}
                      >
                        <span className={isActive ? 'font-bold' : ''}>
                          {s.text}
                        </span>
                        {isActive && !isSubsection && (
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* --- MOBILE FLOATING MENU --- */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition-transform active:scale-90"
        >
          {isOpen ? <X size={24} /> : <List size={24} />}
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 z-90 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="animate-in fade-in zoom-in absolute right-6 bottom-24 w-[calc(100vw-3rem)] max-w-[320px] rounded-lg bg-white p-6 shadow-2xl ring-1 ring-slate-200 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-4 border-b border-slate-100 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Table of Contents
              </p>

              <div className="custom-scrollbar max-h-[60vh] space-y-1 overflow-y-auto pr-2">
                {sections.map((s) => {
                  const isSubsection = s.level === 3;
                  const isActive = activeId === s.slug;

                  return (
                    <a
                      key={s.slug}
                      href={`#${s.slug}`}
                      onClick={(e) => handleClick(e, s.slug)}
                      className={`group flex items-center justify-between rounded-xl px-3 py-1.5 text-sm transition-all ${
                        isActive
                          ? 'bg-indigo-50/50 text-indigo-600'
                          : 'text-slate-500 hover:text-indigo-600'
                      } ${
                        isSubsection
                          ? 'ml-3 border-l border-slate-100 pl-3 text-xs'
                          : 'font-medium'
                      } `}
                    >
                      <span className={isActive ? 'font-bold' : ''}>
                        {s.text}
                      </span>

                      {isActive && !isSubsection && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TableOfContents;

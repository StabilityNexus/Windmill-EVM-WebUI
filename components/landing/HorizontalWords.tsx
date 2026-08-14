'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEXT = 'On chain matchmaking for every EVM chain';

export default function HorizontalWords() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = sectionRef.current;
      if (!container) return;

      const textRef = container.querySelector('.hw__relative');
      const letters = container.querySelectorAll('.hw__letter');
      const stickers = container.querySelectorAll('.hw__sticker');
      const arrowPaths = container.querySelectorAll('.hw__arrow-svg path, .hw__arrow-end-svg path');

      const entranceDistance = window.innerHeight;
      const pinnedDistance = 2500;

      const scrollTween = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: () => `+=${entranceDistance + pinnedDistance}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      scrollTween
        .fromTo(textRef, { x: window.innerWidth }, { x: window.innerWidth * 0.5, ease: 'none', duration: entranceDistance })
        .to(textRef, { x: () => -(textRef!.scrollWidth - window.innerWidth * 0.5), ease: 'none', duration: pinnedDistance });

      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${pinnedDistance}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
      });

      letters.forEach((letter) => {
        gsap.from(letter, {
          yPercent: (Math.random() - 0.5) * 500,
          rotation: (Math.random() - 0.5) * 60,
          ease: 'elastic.out(1.2, 1)',
          scrollTrigger: {
            trigger: letter,
            containerAnimation: scrollTween,
            start: 'left 90%',
            end: 'left 50%',
            scrub: 0.5,
          },
        });
      });

      stickers.forEach((sticker) => {
        gsap.from(sticker, {
          scale: 0,
          yPercent: (Math.random() - 0.5) * 400,
          rotation: (Math.random() - 0.5) * 60,
          ease: 'elastic.out(1.2, 1)',
          scrollTrigger: {
            trigger: sticker,
            containerAnimation: scrollTween,
            start: 'left 90%',
            end: 'left 50%',
            scrub: 0.5,
          },
        });
      });

      arrowPaths.forEach((path) => {
        if ((path as SVGPathElement).getTotalLength) {
          const len = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1,
            scrollTrigger: {
              trigger: path.parentElement,
              containerAnimation: scrollTween,
              start: 'left 90%',
              end: 'left 50%',
              scrub: 0.5,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hw-section">
      <div className="hw__relative">
        <div className="hw__sticker-svg">
          <svg className="hw__arrow-svg" width="380" height="120" viewBox="0 0 380 120" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2c20 40 60 80 120 80s120-20 180-40 60-20 76-10" />
            <path d="M328 12c30 10 40 20 50 40" />
          </svg>

          <img src="/assets/HorizontalWords SVG/horizontal-words-sticker-thumps-up.svg" className="hw__sticker hw__sticker-watch" alt="" />
          <img src="/assets/HorizontalWords SVG/horizontal-words-sticker-cursor.svg" className="hw__sticker hw__sticker-cursor" alt="" />
          <img src="/assets/HorizontalWords SVG/horizontal-words-sticker-phone.svg" className="hw__sticker hw__sticker-phone" alt="" />

          <svg className="hw__arrow-end-svg" width="135" height="100" viewBox="0 0 135 100" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round">
            <path d="M2 60c20 10 40-10 60-30s30-20 50-10" />
            <path d="M72 12c10-10 30 10 40 30" />
          </svg>

          <h2 className="hw__h2" aria-label={TEXT}>
            {TEXT.split('').map((char, i) =>
              char === ' ' ? <span key={i}>&nbsp;</span> : <span key={i} className="hw__letter">{char}</span>
            )}
          </h2>
        </div>
      </div>
      <div className="hw__bottom-text">
        <p className="hw__bottom-text-l">
          Dynamic price curves, autonomous keeper matching,<br />
          and atomic settlement — <em>fully</em> on-chain, no<br />
          off-chain relayers or order books.
        </p>
      </div>
    </section>
  );
}

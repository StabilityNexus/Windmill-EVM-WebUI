'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CARDS_DATA = [
  {
    color: 'green',
    title: 'dynamic curves',
    services: [
      'Automated price curves',
      'Configurable slope & start',
      'Real-time price simulation',
      'On-chain settlement',
    ],
  },
  {
    color: 'darkblue',
    title: 'matching engine',
    services: [
      'Decentralized order matching',
      'Sweep-based settlement',
      'Continuous order books',
      'MEV-resistant design',
    ],
  },
  {
    color: 'orange',
    title: 'wallet integration',
    services: [
      'RainbowKit & Wagmi',
      'Multi-chain support',
      'Gasless meta-transactions',
      'Hardware wallet compatible',
    ],
  },
  {
    color: 'maroon',
    title: 'on-chain data',
    services: [
      'The Graph subgraph indexing',
      'Real-time order queries',
      'Historical trade analytics',
      'Open API access',
    ],
  },
  {
    color: 'pink',
    title: 'security',
    services: [
      'Audited smart contracts',
      'Timelock governance',
      'Emergency pause mechanisms',
      'Bug bounty program',
    ],
  },
];

export default function FeaturesSection() {
  useEffect(() => {
    gsap.to('.title-underline-svg path', {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.3,
      scrollTrigger: {
        trigger: '.service-cards-wrapper',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });
    initCardAnimations();
  }, []);

  return (
    <section id="features" className="bg-white section-padding border-t border-black/5 overflow-hidden">
      <div className="title-container">
        <h2 className="main-title">
          windmill <span className="italic-text">exchange:</span>
        </h2>
        <svg width="160" viewBox="0 0 159 17" fill="none" className="title-underline-svg">
          <path d="M1 12.1515C53.0771 5.7187 105.529 2.30552 158 1.93652" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30.2672 15.9461C64.1899 12.8158 98.2663 11.3583 132.33 11.5735" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="cards-wrapper service-cards-wrapper" id="cards-wrapper">
        {CARDS_DATA.map((card) => (
          <div key={card.color} className={`card card-${card.color}`}>
            <div className={`card-sticker sticker-${card.color === 'green' ? 'camera' : card.color === 'darkblue' ? 'phone' : card.color === 'orange' ? 'smiley' : card.color === 'maroon' ? 'hand' : 'heart'}`}>
              <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.2" />
                <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="card-title">{card.title}</h3>
            <svg width="100%" height="10" className="card-divider-svg" aria-hidden="true">
              <line x1="0" y1="5" x2="300" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            </svg>
            <ul className="card-list">
              {card.services.map((service) => (
                <li key={service}>
                  <svg width="13" height="16" className="services-card__bullet-svg" viewBox="0 0 13 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 14l-3-4 3-4M9 14l3-4-3-4" />
                  </svg>
                  {service}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function initCardAnimations() {
  const cards = gsap.utils.toArray('.card') as HTMLElement[];
  if (!cards.length) return;

  const originalData = [
    { rotation: 4 },
    { rotation: -5 },
    { rotation: 5 },
    { rotation: -8 },
    { rotation: 5 },
  ];

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

  if (!isMobile) {
    cards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => {
        if (leaveTimeout) {
          clearTimeout(leaveTimeout);
          leaveTimeout = null;
        }
        const hoverGap = 120;
        const clusterGap = 150;
        const cardWidth = 320;
        const hoveredLeft = cards[index].offsetLeft;
        const leftCards: { card: HTMLElement; index: number }[] = [];
        const rightCards: { card: HTMLElement; index: number }[] = [];

        cards.forEach((otherCard, otherIndex) => {
          if (otherIndex < index) leftCards.push({ card: otherCard as HTMLElement, index: otherIndex });
          else if (otherIndex > index) rightCards.push({ card: otherCard as HTMLElement, index: otherIndex });
        });

        const currentTop = cards[index].offsetTop;
        const targetCommonTop = 50;
        const moveY = targetCommonTop - currentTop;

        gsap.to(cards[index], { x: 0, y: moveY, rotation: 0, scale: 1.08, duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: true });

        if (rightCards.length) {
          const clusterStart = hoveredLeft + cardWidth + hoverGap;
          rightCards.forEach((item, i) => {
            const targetAbsLeft = clusterStart + i * clusterGap;
            const targetX = Math.max(targetAbsLeft - item.card.offsetLeft, 10);
            const angleRad = originalData[item.index].rotation * (Math.PI / 180);
            const targetY = targetX * Math.tan(angleRad);
            gsap.to(item.card, { x: targetX, y: targetY, rotation: originalData[item.index].rotation, scale: 1, duration: 1.0, ease: 'elastic.out(1, 0.5)', overwrite: true });
          });
        }

        if (leftCards.length) {
          leftCards.reverse();
          const clusterStart = hoveredLeft - hoverGap - cardWidth;
          leftCards.forEach((item, i) => {
            const targetAbsLeft = clusterStart - i * clusterGap;
            const targetX = Math.min(targetAbsLeft - item.card.offsetLeft, -10);
            const angleRad = originalData[item.index].rotation * (Math.PI / 180);
            const targetY = targetX * Math.tan(angleRad);
            gsap.to(item.card, { x: targetX, y: targetY, rotation: originalData[item.index].rotation, scale: 1, duration: 1.0, ease: 'elastic.out(1, 0.5)', overwrite: true });
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        leaveTimeout = setTimeout(() => {
          cards.forEach((c, i) => {
            gsap.to(c, { x: 0, y: 0, scale: 1, rotation: originalData[i].rotation, duration: 1.0, ease: 'elastic.out(1, 0.5)', overwrite: true, zIndex: i + 1 });
          });
        }, 80);
      });
    });
  } else {
    const scrollPerCard = window.innerHeight * 0.8;
    const navH = 60;
    const mobileRotations = [-6, 4, -8, 5, -3];

    cards.forEach((card, i) => {
      gsap.set(card, {
        position: 'absolute',
        left: '50%',
        top: '0',
        xPercent: -50,
        y: i === 0 ? 0 : window.innerHeight * 1.1,
        rotation: mobileRotations[i % mobileRotations.length],
        zIndex: i + 1,
        transformOrigin: 'center center',
      });
    });

    const wrapperH = window.innerHeight * 0.7 + scrollPerCard * (cards.length - 1);
    gsap.set('.cards-wrapper', { height: wrapperH });

    ScrollTrigger.create({
      trigger: '.cards-wrapper',
      start: `top ${navH}px`,
      end: `+=${scrollPerCard * (cards.length - 1)}`,
      pin: true,
      pinSpacing: true,
      id: 'mobile-cards-pin',
    });

    cards.forEach((card, i) => {
      if (i === 0) return;
      gsap.fromTo(
        card,
        { y: window.innerHeight * 1.1 },
        {
          y: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cards-wrapper',
            start: `top+=${(i - 1) * scrollPerCard} ${navH}px`,
            end: `top+=${i * scrollPerCard} ${navH}px`,
            scrub: 0.4,
          },
        }
      );
    });
  }
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import shopData from './shopData';
import Footer from '../footer/Footer';
import ShoppingCartModal from './ShoppingCart';

const ease = [0.16, 1, 0.3, 1];

const COLOR_DISPLAY = {
  black: '#1a1a1a',
  white: '#f0f0f0',
  pink:  '#f9a8d4',
};

const Shop = () => {
  const [products, setProducts] = useState(shopData);

  const handleChooseColor = (id, color) => {
    setProducts(prev =>
      prev.map(product => {
        if (product.id !== id) return product;
        const newCheckImg = Object.fromEntries(
          Object.keys(product.checkImg).map(k => [k, k === color])
        );
        return { ...product, checkImg: newCheckImg };
      })
    );
  };

  const activeImage = (product) =>
    Object.entries(product.checkImg).find(([, v]) => v)?.[0];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <ShoppingCartModal />

      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border-1)', padding: 'clamp(56px, 9vw, 88px) 0 clamp(36px, 5vw, 52px)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.6, display: 'inline-block' }} />
              AuraFit Gear
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: '0 0 12px', lineHeight: 1.1 }}>
              Kit built for training.<br />Not for branding.
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 420, margin: 0, lineHeight: 1.65 }}>
              Purpose-built training apparel and accessories. Clean design, functional construction, made to hold up through daily use.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────── */}
      <div className="container" style={{ padding: 'var(--sp-12) 0 var(--sp-20)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(16px, 2.5vw, 28px)' }}>
          {products.map((product, index) => {
            const activeColor = activeImage(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease }}
                className="pf-card pf-card--flush pf-card--interactive"
                style={{ overflow: 'hidden' }}
              >
                {/* Product image */}
                <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--surface-3)' }}>
                  <img
                    src={product.linkImg[activeColor]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>

                {/* Product info */}
                <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <h3 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.015em' }}>
                      {product.name}
                    </h3>
                    <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.55, margin: 0 }}>
                      {product.tagline}
                    </p>
                  </div>

                  {/* Color selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleChooseColor(product.id, color)}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: COLOR_DISPLAY[color] || color,
                          border: '1px solid var(--border-2)',
                          outline: product.checkImg[color] ? '2px solid var(--accent)' : 'none',
                          outlineOffset: '2px',
                          cursor: 'pointer',
                          transition: 'outline 0.12s, transform 0.12s',
                          padding: 0,
                          boxSizing: 'border-box',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { if (!product.checkImg[color]) e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ))}
                    <span style={{ color: 'var(--text-3)', fontSize: 11, textTransform: 'capitalize', marginLeft: 4 }}>
                      {activeColor}
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-1)', marginTop: 2 }}>
                    <span style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {product.price}
                    </span>
                    <Link to={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-secondary btn-sm">
                        View details
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;

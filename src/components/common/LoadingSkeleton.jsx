import React from 'react';
import './loadingSkeleton.css';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'text':
        return <TextSkeleton />;
      case 'product':
        return <ProductSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
    </div>
  </div>
);

const TextSkeleton = () => (
  <div className="skeleton-text-block">
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
  </div>
);

const ProductSkeleton = () => (
  <div className="skeleton-product">
    <div className="skeleton skeleton-product-image"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-price"></div>
    <div className="skeleton skeleton-button"></div>
  </div>
);

const ListSkeleton = () => (
  <div className="skeleton-list">
    {[1, 2, 3, 4, 5].map((item) => (
      <div key={item} className="skeleton-list-item">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton-list-content">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>
    ))}
  </div>
);

const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <div className="skeleton skeleton-avatar-large"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton-profile-stats">
      <div className="skeleton skeleton-stat"></div>
      <div className="skeleton skeleton-stat"></div>
      <div className="skeleton skeleton-stat"></div>
    </div>
  </div>
);

export default LoadingSkeleton;

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DraggablePanelProps {
  children: React.ReactNode;
  title?: string;
  defaultPosition?: { x: number; y: number };
  minWidth?: number;
  minHeight?: number;
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  title,
  defaultPosition = { x: 100, y: 100 },
  minWidth = 300,
  minHeight = 200,
  className = '',
  onClose,
  onMinimize,
  isMinimized = false
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.panel-header')) {
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        minWidth,
        minHeight,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      className={`jarvis-panel ${className}`}
      onMouseDown={handleMouseDown}
    >
      {/* Glassmorphism background with JARVIS cyan/blue styling */}
      <div className="panel-background">
        <div className="panel-glass" />
        <div className="panel-glow" />
      </div>

      {/* Panel content */}
      <div className="panel-content">
        {/* Header */}
        {title && (
          <div className="panel-header">
            <div className="panel-title">
              <div className="title-glow" />
              <span>{title}</span>
            </div>
            <div className="panel-controls">
              {onMinimize && (
                <button
                  onClick={onMinimize}
                  className="control-btn minimize-btn"
                  title="Minimize"
                >
                  <div className="btn-glow" />
                  <span>−</span>
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="control-btn close-btn"
                  title="Close"
                >
                  <div className="btn-glow" />
                  <span>×</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className={`panel-body ${isMinimized ? 'minimized' : ''}`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default DraggablePanel; 
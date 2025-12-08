import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="error-banner">
      <div className="error-banner-content">
        <AlertCircle size={20} className="error-icon" />
        <span className="error-message">{message}</span>
      </div>
      <button onClick={onDismiss} className="error-dismiss" aria-label="Dismiss error">
        <X size={18} />
      </button>
    </div>
  );
};

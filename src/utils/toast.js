import toast from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  success: {
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  },
  loading: {
    style: {
      background: '#3b82f6',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
    },
  },
  custom: {
    duration: 3000,
    style: {
      background: '#9d00ff',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
    },
  },
};

// Toast utility functions
export const showToast = {
  success: (message) => toast.success(message, toastConfig.success),
  
  error: (message) => toast.error(message, toastConfig.error),
  
  loading: (message) => toast.loading(message, toastConfig.loading),
  
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        success: toastConfig.success,
        error: toastConfig.error,
        loading: toastConfig.loading,
      }
    );
  },
  
  custom: (message, icon = '🎉') => {
    return toast(message, {
      ...toastConfig.custom,
      icon: icon,
    });
  },
  
  dismiss: (toastId) => toast.dismiss(toastId),
  
  dismissAll: () => toast.dismiss(),
};

export default showToast;

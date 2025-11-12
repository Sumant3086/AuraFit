const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic API call handler
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Contact API
export const contactAPI = {
  submit: (contactData) => 
    apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),
  
  getAll: () => apiCall('/contact'),
};

// Membership API
export const membershipAPI = {
  create: (membershipData) =>
    apiCall('/memberships', {
      method: 'POST',
      body: JSON.stringify(membershipData),
    }),
  
  getAll: () => apiCall('/memberships'),
  
  getByEmail: (email) => apiCall(`/memberships/user/${email}`),
};

// Classes API
export const classesAPI = {
  getAll: () => apiCall('/classes'),
  
  getById: (id) => apiCall(`/classes/${id}`),
  
  enroll: (id) =>
    apiCall(`/classes/${id}/enroll`, {
      method: 'POST',
    }),
  
  create: (classData) =>
    apiCall('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    }),
};

// Products API
export const productsAPI = {
  getAll: (category = '') => {
    const query = category ? `?category=${category}` : '';
    return apiCall(`/products${query}`);
  },
  
  getById: (id) => apiCall(`/products/${id}`),
  
  create: (productData) =>
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  
  addReview: (id, reviewData) =>
    apiCall(`/products/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// Workout Plans API
export const workoutPlansAPI = {
  generate: (planData) =>
    apiCall('/workout-plans/generate', {
      method: 'POST',
      body: JSON.stringify(planData),
    }),
  
  getByUser: (userId) => apiCall(`/workout-plans/user/${userId}`),
  
  getById: (id) => apiCall(`/workout-plans/${id}`),
};

// Nutrition Plans API
export const nutritionPlansAPI = {
  calculate: (nutritionData) =>
    apiCall('/nutrition-plans/calculate', {
      method: 'POST',
      body: JSON.stringify(nutritionData),
    }),
  
  getByUser: (userId) => apiCall(`/nutrition-plans/user/${userId}`),
};

// Progress Tracker API
export const progressTrackerAPI = {
  create: (trackerData) =>
    apiCall('/progress-tracker', {
      method: 'POST',
      body: JSON.stringify(trackerData),
    }),
  
  getByUser: (userId) => apiCall(`/progress-tracker/${userId}`),
  
  getComparison: (userId) => apiCall(`/progress-tracker/${userId}/comparison`),
};

const apiService = {
  contact: contactAPI,
  membership: membershipAPI,
  classes: classesAPI,
  products: productsAPI,
  workoutPlans: workoutPlansAPI,
  nutritionPlans: nutritionPlansAPI,
  progressTracker: progressTrackerAPI,
};

export default apiService;

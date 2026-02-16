// API Service - Handle communication with backend

export const submitFeedback = async (apiUrl, projectId, data) => {
  try {
    const formData = new FormData();
    
    formData.append('projectId', projectId);
    formData.append('description', data.description);
    formData.append('metadata', JSON.stringify(data.metadata));
    formData.append('screenshot', data.screenshot);

    const response = await fetch(`${apiUrl}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit feedback');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const validateConfig = (config) => {
  if (!config.projectId) {
    throw new Error('projectId is required');
  }
  
  if (!config.apiUrl) {
    throw new Error('apiUrl is required');
  }

  return true;
};

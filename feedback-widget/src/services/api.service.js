// API Service - Handle communication with backend

export const submitFeedback = async (apiUrl, projectId, data) => {
  const url = `${apiUrl}/api/feedback`;
  console.log("[feedback-widget] Submitting to", url, "| projectId:", projectId);
  try {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('description', data.description);
    formData.append('metadata', JSON.stringify(data.metadata));
    formData.append('screenshot', data.screenshot);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let message = 'Failed to submit feedback';
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {
        message = response.statusText || message;
      }
      console.error("[feedback-widget] API error:", response.status, message);
      throw new Error(message);
    }

    const result = await response.json();
    console.log("[feedback-widget] Submit success | screenshotFile:", result.screenshotFile);
    return result;
  } catch (error) {
    console.error("[feedback-widget] Submit failed:", error.message);
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

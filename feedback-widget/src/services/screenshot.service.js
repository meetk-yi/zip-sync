// Screenshot Service - Capture page screenshots using html2canvas

import html2canvas from 'html2canvas';

export const captureFullPage = async () => {
  try {
    // Hide the feedback widget before capturing
    const widgetButton = document.querySelector('.feedback-widget-button');
    const widgetOverlay = document.querySelector('.feedback-widget-overlay');
    
    if (widgetButton) widgetButton.style.display = 'none';
    if (widgetOverlay) widgetOverlay.style.display = 'none';

    // Capture the page
    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    });

    // Show the widget again
    if (widgetButton) widgetButton.style.display = 'flex';
    if (widgetOverlay) widgetOverlay.style.display = 'flex';

    return canvas;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
};

export const captureViewport = async () => {
  try {
    const widgetButton = document.querySelector('.feedback-widget-button');
    const widgetOverlay = document.querySelector('.feedback-widget-overlay');
    
    if (widgetButton) widgetButton.style.display = 'none';
    if (widgetOverlay) widgetOverlay.style.display = 'none';

    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX
    });

    if (widgetButton) widgetButton.style.display = 'flex';
    if (widgetOverlay) widgetOverlay.style.display = 'flex';

    return canvas;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
};

export const canvasToBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
};

export const canvasToDataURL = (canvas) => {
  return canvas.toDataURL('image/png');
};

export const blobToFile = (blob, filename = 'screenshot.png') => {
  return new File([blob], filename, { type: 'image/png' });
};

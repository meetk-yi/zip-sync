import React, { useState } from 'react';
import { formatMetadataForDisplay } from '../services/metadata.service';

const DescriptionForm = ({ metadata, screenshot, onSubmit, onBack }) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    onSubmit(description);
  };

  const metadataItems = formatMetadataForDisplay(metadata);

  return (
    <div className="feedback-widget-form">
      <div className="feedback-widget-screenshot-preview">
        <img src={screenshot} alt="Screenshot preview" />
      </div>

      <div className="feedback-widget-form-group">
        <label htmlFor="feedback-description">
          Describe the issue or feedback <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          id="feedback-description"
          placeholder="Please describe what you're seeing, what you expected, or any feedback you have..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError('');
          }}
          maxLength={2000}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '4px'
        }}>
          <span>{error && <span style={{ color: '#ef4444' }}>{error}</span>}</span>
          <span>{description.length}/2000</span>
        </div>
      </div>
    </div>
  );
};

export default DescriptionForm;

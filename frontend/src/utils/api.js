import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const submitApplicationToBackend = async (formData) => {
  try {
    console.log('Submitting application to backend...', formData);
    
    // Create FormData for multipart upload
    const form = new FormData();
    
    // Add application data as JSON string
    const applicationData = {
      fullName: formData.fullName,
      nationality: formData.nationality,
      dateOfBirth: formData.dateOfBirth,
      email: formData.email,
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      hasQatarResidence: formData.hasQatarResidence,
      qatariIdNumber: formData.qatariIdNumber,
      qatariIdExpiry: formData.qatariIdExpiry,
      passportNumber: formData.passportNumber,
      passportExpiry: formData.passportExpiry,
      workedWithProtv: formData.workedWithProtv,
      lastProjectName: formData.lastProjectName,
      preferredWorkTypes: formData.preferredWorkTypes,
      position: formData.position,
      submissionDate: new Date().toISOString()
    };
    
    form.append('application_data', JSON.stringify(applicationData));
    
    // Add files if they exist
    if (formData.files.personalPhoto) {
      form.append('personal_photo', formData.files.personalPhoto);
    }
    if (formData.files.idCopy) {
      form.append('id_copy', formData.files.idCopy);
    }
    if (formData.files.passportCopy) {
      form.append('passport_copy', formData.files.passportCopy);
    }
    if (formData.files.cv) {
      form.append('cv', formData.files.cv);
    }
    if (formData.files.portfolio) {
      form.append('portfolio', formData.files.portfolio);
    }
    
    const response = await axios.post(`${API}/applications/submit`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000 // 60 seconds timeout for file uploads
    });
    
    return {
      success: true,
      submissionId: response.data.submission_id,
      applicationId: response.data.application_id,
      message: response.data.message
    };
    
  } catch (error) {
    console.error('Application submission error:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data.detail || 'Server error occurred'
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check your connection.'
      };
    } else {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};

export const getApplication = async (applicationId) => {
  try {
    const response = await axios.get(`${API}/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    throw error;
  }
};

export const listApplications = async (skip = 0, limit = 50) => {
  try {
    const response = await axios.get(`${API}/applications?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error listing applications:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

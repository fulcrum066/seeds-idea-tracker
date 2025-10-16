import axios from "axios";

const API_URL = "";

// Upload files to a seed
const uploadSeedFiles = async (seedId, files, token) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await axios.post(
    `${API_URL}/api/media/seed/${seedId}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for large files
    }
  );
  return response.data;
};

// Delete a file from a seed
const deleteSeedFile = async (seedId, attachmentId, token) => {
  const response = await axios.delete(
    `${API_URL}/api/media/seed/${seedId}/file/${attachmentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const mediaService = {
  uploadSeedFiles,
  deleteSeedFile,
};

export default mediaService;
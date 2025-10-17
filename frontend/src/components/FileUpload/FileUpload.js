import { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { CloudUpload as CloudUploadIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';

const FileUpload = ({ onFilesSelected }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    onFilesSelected(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Box sx={{ p: 2, border: '2px dashed #6a951f', borderRadius: 1, textAlign: 'center', backgroundColor: '#f9fff4' }}>
      <CloudUploadIcon sx={{ fontSize: 48, color: '#6a951f', mb: 1 }} />
      
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
        accept="*/*"
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<AttachFileIcon />}
          sx={{ 
            backgroundColor: '#6a951f',
            '&:hover': { backgroundColor: '#5a8010' }
          }}
        >
          Choose Files
        </Button>
      </label>
      
      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Select one or more files to upload
      </Typography>
      
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#6a4026' }}>
            {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected:
          </Typography>
          {selectedFiles.map((file, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                py: 0.5,
                borderBottom: index < selectedFiles.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Typography variant="caption" sx={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </Typography>
              <Chip 
                label={formatFileSize(file.size)} 
                size="small" 
                sx={{ ml: 1, height: 18, fontSize: '10px' }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
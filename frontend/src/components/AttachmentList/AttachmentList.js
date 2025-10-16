import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import { 
  Delete as DeleteIcon, 
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon
} from '@mui/icons-material';

const AttachmentList = ({ attachments = [], onDelete, canDelete = false }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', border: '1px dashed #ddd', borderRadius: 1 }}>
        <FileIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
        <Typography variant="body2">No files attached</Typography>
      </Box>
    );
  }

  // Helper to get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon />;
    
    if (mimeType.startsWith('image/')) return <ImageIcon sx={{ color: '#4caf50' }} />;
    if (mimeType.includes('pdf')) return <PdfIcon sx={{ color: '#f44336' }} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <DocIcon sx={{ color: '#2196f3' }} />;
    if (mimeType.startsWith('video/')) return <VideoIcon sx={{ color: '#9c27b0' }} />;
    if (mimeType.startsWith('audio/')) return <AudioIcon sx={{ color: '#ff9800' }} />;
    
    return <FileIcon sx={{ color: 'text.secondary' }} />;
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Helper to check if file is an image
  const isImage = (mimeType) => mimeType && mimeType.startsWith('image/');

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ color: '#6a4026', fontWeight: 600 }}>
        {attachments.length} {attachments.length === 1 ? 'File' : 'Files'}
      </Typography>
      
      {attachments.map((attachment) => (
        <Box
          key={attachment._id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            mb: 1,
            backgroundColor: '#fff',
            '&:hover': {
              backgroundColor: '#f9f9f9',
              borderColor: '#6a951f'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            {getFileIcon(attachment.mimeType)}
            
            <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {attachment.originalName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(attachment.fileSize)}
                </Typography>
                {isImage(attachment.mimeType) && (
                  <Chip label="Image" size="small" sx={{ height: 16, fontSize: '10px' }} />
                )}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open(attachment.url, '_blank')}
              sx={{ 
                fontSize: '11px',
                minWidth: 'auto',
                px: 1.5,
                borderColor: '#6a951f',
                color: '#6a951f',
                '&:hover': {
                  borderColor: '#5a8010',
                  backgroundColor: '#f0f7e8'
                }
              }}
            >
              {isImage(attachment.mimeType) ? 'View' : 'Download'}
            </Button>
            
            {canDelete && onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(attachment._id)}
                sx={{ 
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#ffebee'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AttachmentList;
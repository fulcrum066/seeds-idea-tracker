import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import FileUpload from "../FileUpload/FileUpload";
import AttachmentList from "../AttachmentList/AttachmentList";
import { uploadSeedFiles, deleteSeedFile } from "../../features/media/mediaSlice";

const METRICS = [
  { name: "maintainingCompliance", label: "Maintaining Compliance" },
  { name: "reducingCost", label: "Reducing Cost" },
  { name: "reducingRisk", label: "Reducing Risk" },
  { name: "improvingProductivity", label: "Improving Productivity" },
  { name: "improvingProcesses", label: "Improving Processes" },
  { name: "creatingNewRevenueStreams", label: "Creating New Revenue Streams" },
];

const RATING_OPTIONS = ["very high", "high", "medium", "low", "very low"];

function IdeaEdit({ setFormData, initialSeed, onMediaUpdate }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [metrics, setMetrics] = useState({
    maintainingCompliance: "medium",
    reducingCost: "medium",
    reducingRisk: "medium",
    improvingProductivity: "medium",
    improvingProcesses: "medium",
    creatingNewRevenueStreams: "medium",
  });
  
  // Media upload states
  const [attachments, setAttachments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialSeed) {
      setTitle(initialSeed.title || "");
      setDescription(initialSeed.description ?? initialSeed.content ?? "");
      setPriority((initialSeed.priority || "low").toLowerCase());
      setAttachments(initialSeed.attachments || initialSeed.rawSeed?.attachments || []);
      setMetrics((prev) => ({
        ...prev,
        maintainingCompliance:
          initialSeed.maintainingCompliance || prev.maintainingCompliance,
        reducingCost: initialSeed.reducingCost || prev.reducingCost,
        reducingRisk: initialSeed.reducingRisk || prev.reducingRisk,
        improvingProductivity:
          initialSeed.improvingProductivity || prev.improvingProductivity,
        improvingProcesses:
          initialSeed.improvingProcesses || prev.improvingProcesses,
        creatingNewRevenueStreams:
          initialSeed.creatingNewRevenueStreams || prev.creatingNewRevenueStreams,
      }));
    }
  }, [initialSeed]);

  // Send data to SeedsHome whenever something changes
  useEffect(() => {
    setFormData({
      title,
      description,
      priority,
      ...metrics,
    });
  }, [title, description, priority, metrics, setFormData]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !initialSeed) return;

    setUploading(true);
    try {
      const result = await dispatch(
        uploadSeedFiles({
          seedId: initialSeed._id || initialSeed.id,
          files: selectedFiles,
        })
      ).unwrap();

      // Update attachments list
      if (result?.seed?.attachments) {
        setAttachments(result.seed.attachments);
        
        // Notify parent to update its state
        if (onMediaUpdate) {
          onMediaUpdate(initialSeed._id || initialSeed.id, result.seed.attachments);
        }
      }

      setSelectedFiles([]);
      setShowUpload(false);
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMsg = error?.message || error || "Failed to upload files";
      alert(`Upload error: ${errorMsg}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  // Handle file delete
  const handleDeleteFile = async (attachmentId) => {
    if (!initialSeed || !window.confirm("Delete this file?")) return;

    try {
      const result = await dispatch(
        deleteSeedFile({
          seedId: initialSeed._id || initialSeed.id,
          attachmentId,
        })
      ).unwrap();

      // Update attachments list
      if (result?.seed?.attachments) {
        setAttachments(result.seed.attachments);
        
        // Notify parent to update its state
        if (onMediaUpdate) {
          onMediaUpdate(initialSeed._id || initialSeed.id, result.seed.attachments);
        }
      }
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMsg = error?.message || error || "Failed to delete file";
      alert(`Delete error: ${errorMsg}. Please try again.`);
    }
  };

  // --- Same styles as before ---
  const containerStyle = {
    position: 'relative',
    display: 'flex',
    border: '1px solid #ccc',
    padding: '10px',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  };

  const halfStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
  };

  const leftHalfStyle = {
    ...halfStyle,
    borderRight: '1px solid #ccc',
    justifyContent: 'center',
  };

  const rightHalfStyle = {
    ...halfStyle,
    justifyContent: 'flex-start',
  };

  const headingStyle = {
    color: 'green',
    margin: 0,
    fontFamily: 'Comic Sans MS',
  };

  const labelStyle = {
    color: 'black',
    marginTop: '12px',
    marginBottom: '8px',
    fontSize: '16px',
    alignSelf: 'flex-start',
  };

  const inputStyle = {
    padding: '8px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  const uploadBoxStyle = {
    border: '2px dashed #aaa',
    borderRadius: '6px',
    padding: '20px',
    width: '100%',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#fff',
  };

  return (
    <div style={containerStyle}>
      <div style={leftHalfStyle}>
        <h2 style={headingStyle}>{initialSeed ? "Edit Idea" : "Create an Idea"}</h2>

        <label style={labelStyle}>{initialSeed ? "Update the Title" : "Give your Seed a Title!"}</label>
        <input
          type="text"
          placeholder="Enter your idea title..."
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={labelStyle}>{initialSeed ? "Update the Description" : "Describe your Seed"}</label>
        <input
          type="text"
          placeholder="Description..."
          style={inputStyle}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px', alignSelf: 'stretch' }}>
          <div style={{ width: '100%' }}>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>Priority:</label>
            <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Metric Data Fields */}
        <div style={{ width: '100%', marginTop: '12px' }}>
          {METRICS.map((metric) => (
            <div key={metric.name} style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{metric.label}</label>
              <select
                style={inputStyle}
                value={metrics[metric.name]}
                onChange={(e) =>
                  setMetrics((prev) => ({ ...prev, [metric.name]: e.target.value }))
                }
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option} value={option} style={{ textTransform: 'capitalize' }}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Right half - Media Management */}
      <div style={rightHalfStyle}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ color: '#6a4026', fontWeight: 600, fontSize: '16px' }}>
              Attachments
            </Typography>
            {initialSeed && (
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setShowUpload(!showUpload)}
                size="small"
                sx={{ 
                  borderColor: '#6a951f', 
                  color: '#6a951f',
                  fontSize: '11px',
                  '&:hover': { borderColor: '#5a8010', backgroundColor: '#f0f7e8' }
                }}
              >
                {showUpload ? 'Cancel' : 'Add Files'}
              </Button>
            )}
          </Box>

          {!initialSeed && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', border: '1px dashed #ccc', borderRadius: 1 }}>
              <Typography variant="body2">
                Save the seed first to upload files
              </Typography>
            </Box>
          )}

          {initialSeed && showUpload && (
            <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#fafafa' }}>
              <FileUpload onFilesSelected={setSelectedFiles} />
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleFileUpload}
                    disabled={uploading}
                    size="small"
                    sx={{ 
                      backgroundColor: '#6a951f',
                      fontSize: '11px',
                      '&:hover': { backgroundColor: '#5a8010' }
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedFiles([]);
                      setShowUpload(false);
                    }}
                    size="small"
                    sx={{ fontSize: '11px' }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {initialSeed && (
            <AttachmentList
              attachments={attachments}
              onDelete={handleDeleteFile}
              canDelete={true}
            />
          )}
        </Box>
      </div>
    </div>
  );
}

export default IdeaEdit;
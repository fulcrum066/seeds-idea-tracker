const asyncHandler = require("express-async-handler");
const supabase = require("../config/supabase");
const Seed = require("../models/seedModel");

// Helper to ensure bucket exists
async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'seed-attachments');
  
  if (!bucketExists) {
    // Try to create the bucket
    await supabase.storage.createBucket('seed-attachments', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
  }
}

// @desc    Upload files to a seed
// @route   POST /api/media/seed/:seedId/upload
// @access  Private
const uploadSeedFiles = asyncHandler(async (req, res) => {
  const seedId = req.params.seedId;

  console.log(`[MEDIA] Upload request for seed ${seedId}, files:`, req.files?.length || 0);

  if (!req.files || req.files.length === 0) {
    console.log('[MEDIA] No files in request');
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    // Verify seed exists
    const seed = await Seed.findById(seedId);
    if (!seed) {
      console.log(`[MEDIA] Seed ${seedId} not found`);
      return res.status(404).json({ message: "Seed not found" });
    }

    // Ensure bucket exists
    await ensureBucketExists();

    const attachments = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Simple filename with timestamp
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = `seeds/${seedId}/${fileName}`;

        console.log(`[MEDIA] Uploading ${file.originalname} to ${filePath}`);

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from('seed-attachments')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) {
          console.error(`[MEDIA] Supabase upload error for ${file.originalname}:`, error);
          errors.push({ file: file.originalname, error: error.message });
          continue;
        }

        console.log(`[MEDIA] Successfully uploaded ${file.originalname}`);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('seed-attachments')
          .getPublicUrl(filePath);

        attachments.push({
          fileName: fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          url: urlData.publicUrl,
          uploadedBy: req.user._id
        });
      } catch (fileError) {
        console.error(`[MEDIA] Error processing ${file.originalname}:`, fileError);
        errors.push({ file: file.originalname, error: fileError.message });
      }
    }

    if (attachments.length === 0) {
      console.log('[MEDIA] No files were successfully uploaded');
      return res.status(500).json({ 
        message: "All uploads failed", 
        errors 
      });
    }

    // Add to seed
    console.log(`[MEDIA] Saving ${attachments.length} attachments to database`);
    const updatedSeed = await Seed.findByIdAndUpdate(
      seedId,
      { $push: { attachments: { $each: attachments } } },
      { new: true }
    );

    console.log(`[MEDIA] Upload complete. Total attachments: ${updatedSeed.attachments.length}`);

    const response = { 
      message: "Files uploaded successfully", 
      seed: updatedSeed,
      uploadedCount: attachments.length,
      errors: errors.length > 0 ? errors : undefined
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('[MEDIA] Upload error:', error);
    res.status(500).json({ message: "Upload failed: " + error.message });
  }
});

// @desc    Delete a file from a seed
// @route   DELETE /api/media/seed/:seedId/file/:attachmentId
// @access  Private
const deleteSeedFile = asyncHandler(async (req, res) => {
  const { seedId, attachmentId } = req.params;

  try {
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({ message: "Seed not found" });
    }

    const attachment = seed.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete from Supabase (extract path from URL)
    const filePath = `seeds/${seedId}/${attachment.fileName}`;
    await supabase.storage.from('seed-attachments').remove([filePath]);

    // Remove from database
    const updatedSeed = await Seed.findByIdAndUpdate(
      seedId,
      { $pull: { attachments: { _id: attachmentId } } },
      { new: true }
    );

    res.json({ message: "File deleted", seed: updatedSeed });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = {
  uploadSeedFiles,
  deleteSeedFile
};
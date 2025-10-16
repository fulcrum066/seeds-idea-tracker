# Media Upload Integration Guide

This guide provides a quick overview of how file uploads work using Supabase. It's designed to give you the essential information without the fluff.

### Quick Gist

We use a standard React frontend and a Node.js/Express backend. When you upload a file:
1.  The **React app** sends the file to our **backend**.
2.  The **backend** pushes the file to a **Supabase Storage Bucket**.
3.  The **backend** saves the file's public URL and other info into our **MongoDB** database, inside the specific "seed" document.
4.  The UI updates instantly without a page refresh.

### Visual Flow

Here is a simple diagram of the upload process:

```
              (1) User uploads file(s)
+----------+ ------------------------> +-------------------+
|          |   (POST Request)          |                   |
|  React   |                           |   Node.js Backend |
| Frontend | <------------------------ |                   |
|          |   (4) Backend returns     |  (Express Server) |
+----------+    updated seed data      +-------------------+
                  (UI updates)                 |         ^
                                               |         |
                               (2) Stores file |         | (3) Saves file URL
                                               |         | and metadata
                                               v         |
                                       +----------+  +---------+
                                       | Supabase |  | MongoDB |
                                       | Storage  |  | Database|
                                       +----------+  +---------+
```

---

### How It Works (The Details)

1.  **Upload Request**: The frontend sends files as `multipart/form-data` to the backend. A 60-second timeout is set for large files.
2.  **File Storage**: The backend receives the files and uploads them to a public Supabase bucket named `seed-attachments`. Each file is stored in a path like `seeds/{seedId}/{timestamp}_{filename}.ext` to avoid name conflicts.
3.  **Metadata Saved**: After a successful upload, the backend gets the public URL from Supabase. It then saves this URL, along with the file name, size, and type, into an `attachments` array within the specific seed's document in MongoDB.
4.  **UI Update**: The backend responds with the fully updated seed object. The frontend uses this data to instantly update the UI, showing the new file in the list. A three-level state sync (local, parent, global) ensures the UI is always consistent.

---

### Key Code Locations

| File Path                                  | Purpose                                            |
| ------------------------------------------ | -------------------------------------------------- |
| `backend/routes/mediaRoutes.js`            | Defines the API `POST` and `DELETE` endpoints.     |
| `backend/controllers/mediaController.js`   | Contains the core logic for up/downloading.        |
| `backend/middleware/uploadMiddleware.js`   | Configures `multer` for file handling.             |
| `backend/models/seedModel.js`              | Defines the `attachments` schema in MongoDB.       |
| `frontend/src/features/media/mediaService.js` | Makes the `axios` API calls from frontend to backend. |
| `frontend/src/features/media/mediaSlice.js`   | Manages Redux state (loading, errors).             |
| `frontend/src/components/FileUpload/`      | The React component for the file selection UI.     |
| `frontend/src/components/AttachmentList/`  | The React component that displays the file list.   |

---

### API Endpoints

-   `POST /api/media/seed/:seedId/upload`
    -   Uploads up to 5 files for a given seed.
-   `DELETE /api/media/seed/:seedId/file/:attachmentId`
    -   Deletes a single file from a seed.

---

### Required Setup

You only need to do two things to get this working locally:

1.  **Add Environment Variables**: Create a `.env` file in the `backend` directory and add your Supabase credentials:
    ```bash
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    ```

2.  **Create Supabase Bucket**: In your Supabase project dashboard, go to "Storage" and create a new bucket named `seed-attachments`. Make sure to toggle **"Public bucket"** ON.

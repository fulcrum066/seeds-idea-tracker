import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import mediaService from "./mediaService";

const initialState = {
  isLoading: false,
  message: "",
};

// Upload files to seed
export const uploadSeedFiles = createAsyncThunk(
  "media/uploadSeedFiles",
  async ({ seedId, files }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await mediaService.uploadSeedFiles(seedId, files, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Upload failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete seed file
export const deleteSeedFile = createAsyncThunk(
  "media/deleteSeedFile",
  async ({ seedId, attachmentId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await mediaService.deleteSeedFile(seedId, attachmentId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Delete failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSeedFiles.pending, (state) => {
        state.isLoading = true;
        state.message = "";
      })
      .addCase(uploadSeedFiles.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Files uploaded successfully";
      })
      .addCase(uploadSeedFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(deleteSeedFile.pending, (state) => {
        state.isLoading = true;
        state.message = "";
      })
      .addCase(deleteSeedFile.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "File deleted successfully";
      })
      .addCase(deleteSeedFile.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      });
  },
});

export const { reset } = mediaSlice.actions;
export default mediaSlice.reducer;
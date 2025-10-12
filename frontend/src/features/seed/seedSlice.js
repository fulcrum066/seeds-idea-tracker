import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import seedService from "./seedService";

// Initial state
const initialState = {
  allSeeds: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Create a new seed
export const createSeed = createAsyncThunk(
  "seeds/create",
  async (seedData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await seedService.createSeed(seedData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Retrieve all seeds
export const getSeeds = createAsyncThunk(
  "seeds/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await seedService.getSeeds(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update seeds
export const updateSeeds = createAsyncThunk(
  "seeds/update",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const allSeeds = thunkAPI.getState().seeds.allSeeds;
      return await Promise.all(
        allSeeds.map((seed) =>
          seedService.updateSeedById(seed._id, seed, token)
        )
      );
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete seeds
export const deleteSeeds = createAsyncThunk(
  "seeds/delete",
  async (ids, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await Promise.all(ids.map((id) => seedService.deleteSeedById(id, token)));
      return ids;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Toggle favorite status
export const toggleFavorite = createAsyncThunk(
  "seeds/toggleFavorite",
  async (seedId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await seedService.toggleFavorite(seedId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add comment to seed
export const addComment = createAsyncThunk(
  "seeds/addComment",
  async ({ seedId, commentData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await seedService.addComment(seedId, commentData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete comment from seed
export const deleteComment = createAsyncThunk(
  "seeds/deleteComment",
  async ({ seedId, commentId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await seedService.deleteComment(seedId, commentId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create the slice
export const seedSlice = createSlice({
  name: "seeds",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    modifySeed: (state, action) => {
      const index = state.allSeeds.findIndex(
        (seed) => seed._id === action.payload._id
      );
      if (index !== -1) {
        state.allSeeds[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allSeeds.push(action.payload);
      })
      .addCase(createSeed.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSeeds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allSeeds = action.payload;
      })
      .addCase(getSeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateSeeds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allSeeds = state.allSeeds.map(
          (seed) =>
            action.payload.find(
              (updatedSeed) => updatedSeed._id === seed._id
            ) || seed
        );
      })
      .addCase(updateSeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteSeeds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allSeeds = state.allSeeds.filter(
          (seed) => !action.payload.includes(seed._id)
        );
      })
      .addCase(deleteSeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.allSeeds.findIndex(
          (seed) => seed._id === action.payload._id
        );
        if (index !== -1) {
          state.allSeeds[index] = action.payload;
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.allSeeds.findIndex(
          (seed) => seed._id === action.payload._id
        );
        if (index !== -1) {
          state.allSeeds[index] = action.payload;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.allSeeds.findIndex(
          (seed) => seed._id === action.payload._id
        );
        if (index !== -1) {
          state.allSeeds[index] = action.payload;
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, modifySeed } = seedSlice.actions;
export default seedSlice.reducer;

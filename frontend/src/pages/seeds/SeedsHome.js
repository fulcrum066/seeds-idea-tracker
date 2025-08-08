import { useSelector, useDispatch } from "react-redux";
import {
  getSeeds,
  createSeed,
  updateSeeds,
} from "../../features/seed/seedSlice";
import { getUser } from "../../features/auth/authSlice";
import { useEffect, useState } from "react";
import TableSeeds from "./TableSeeds";
import TableCreateNew from "./TableCreateNew";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import InspireQuote from "./InspireQuote";
import Spinner from "../../components/Spinner";
import CloseIcon from "@mui/icons-material/Close";
import IdeaEdit from "../../components/IdeaEdit/IdeaEdit";

const SeedsHome = () => {
  const dispatch = useDispatch();
  const { allSeeds, isLoading } = useSelector((state) => state.seeds);
  const { user, users, isLoading: isUserLoading } = useSelector(
    (state) => state.auth
  );

  const [ideaFormData, setIdeaFormData] = useState({});
  const [openTestPopup, setOpenTestPopup] = useState(false);

  const handleOpenTestPopup = () => setOpenTestPopup(true);
  const handleCloseTestPopup = () => setOpenTestPopup(false);

  useEffect(() => {
    dispatch(getSeeds());
    dispatch(getUser());
  }, [dispatch]);

  const handleUpdateSeeds = () => {
    dispatch(updateSeeds());
  };

  const handleCreateSeed = (seedData) => {
    dispatch(createSeed(seedData));
  };

  if (isUserLoading || isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <InspireQuote height="200px" />
      <TableCreateNew handleCreateSeed={handleCreateSeed} user={user} />
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <Typography variant="subtitle1">
          Double click any row to Edit or click any of the buttons to the left.
          Press Enter or click the save button to keep changes. Press "Save All
          Changes" to save them permanently.
        </Typography>
        <Typography variant="subtitle1">
          Use the column headers for Sort and Filter options.
        </Typography>
      </div>

      <TableSeeds allSeeds={allSeeds} users={users} />
      <Button variant="contained" onClick={handleUpdateSeeds}>
        Save All Changes
      </Button>

      <Button
        variant="contained"
        color="primary"
        style={{ marginLeft: "10px" }}
        onClick={handleOpenTestPopup}
      >
        Test
      </Button>

      <Dialog
        open={openTestPopup}
        onClose={handleCloseTestPopup}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Idea
          <IconButton
            aria-label="close"
            onClick={handleCloseTestPopup}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <IdeaEdit setFormData={setIdeaFormData} user={user} />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const cleanDescription = ideaFormData.description?.trim();
              const cleanTitle = ideaFormData.title?.trim();

              if (!cleanDescription) {
                alert("Please enter a description");
                return;
              }
              if (!cleanTitle) {
                alert("Please enter a title");
                return;
              }

              const seedData = {
                description: cleanDescription,
                creatorName: user?._id || null, 
                creatorEmail: user?.email || "", 
                group: ideaFormData.metric1 || "",   
                subGroup: ideaFormData.metric2 || "",
                type: ideaFormData.metric3 || "",    
                priority: (ideaFormData.priority || "low").toLowerCase()
              };

              handleCreateSeed(seedData);
              handleCloseTestPopup();
            }}
          >
            Save & Exit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SeedsHome;

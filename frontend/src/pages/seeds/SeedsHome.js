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
import { Button, Typography } from "@mui/material";
import InspireQuote from "./InspireQuote";
import Spinner from "../../components/Spinner";

const SeedsHome = () => {
  const dispatch = useDispatch();
  const { allSeeds, isLoading, isError, message } = useSelector(
    (state) => state.seeds
  );
  const {
    user,
    users,
    isLoading: isUserLoading,
  } = useSelector((state) => state.auth);

  const [groups, setGroups] = useState([]);
  const [subGroups, setSubGroups] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    dispatch(getSeeds());
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (allSeeds) {
      const groupSet = new Set();
      const subGroupSet = new Set();
      const typeSet = new Set();

      allSeeds.forEach((seed) => {
        groupSet.add(seed.group);
        subGroupSet.add(seed.subGroup);
        typeSet.add(seed.type);
      });

      setGroups(Array.from(groupSet));
      setSubGroups(Array.from(subGroupSet));
      setTypes(Array.from(typeSet));
    }
  }, [allSeeds]);

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
      <TableCreateNew
        handleCreateSeed={handleCreateSeed}
        user={user}
        groups={groups}
        subGroups={subGroups}
        types={types}
      />
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <Typography variant="subtitle1">
          {" "}
          Double click any row to Edit or click any of the buttons to the left.
          Press Enter or click the save button to keep changes. Press "Save All
          Changes" to save them permanently.
        </Typography>
        <Typography variant="subtitle1">
          {" "}
          Use the column headers for Sort and Filter options.
        </Typography>
      </div>

      <TableSeeds allSeeds={allSeeds} users={users} />
      <Button variant="contained" onClick={handleUpdateSeeds}>
        Save All Changes
      </Button>
    </div>
  );
};

export default SeedsHome;

import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbar,
} from "@mui/x-data-grid";
import { useDispatch } from "react-redux";
import { modifySeed, deleteSeeds } from "../../features/seed/seedSlice"; // import modifySeed and deleteSeeds actions

const TableSeeds = ({ allSeeds, users }) => {
  const [rows, setRows] = React.useState([]);
  const dispatch = useDispatch();

  const rowsToUse = allSeeds.map((seed, index) => {
    const user = users.find((user) => user._id === seed.creatorName);
    return {
      ...seed,
      id: index + 1,
      creatorName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
      dateRecorded: new Date(seed.dateRecorded).toLocaleDateString("en-AU"),
      startTime: seed.startTime ? new Date(seed.startTime) : null,
      expectedEndTime: seed.expectedEndTime
        ? new Date(seed.expectedEndTime)
        : null,
      completionDate: seed.completionDate
        ? new Date(seed.completionDate)
        : null,
    };
  });

  useEffect(() => {
    setRows(rowsToUse);
  }, [allSeeds]);

  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    const seedToDelete = rows.find((row) => row.id === id);
    dispatch(deleteSeeds([seedToDelete._id])); // Pass an array with the seed's _id
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      const updatedRows = rows.filter((row) => row.id !== id);
      setRows(updatedRows);
    }
  };

  // Helper function to map creator's name back to their MongoDB object ID
  const mapNameToId = (name) => {
    const user = users.find(
      (user) => `${user.firstName} ${user.lastName}` === name
    );
    return user ? user._id : name; // return the object ID if found, otherwise return the name
  };

  const processRowUpdate = (newRow) => {
    // Convert the display date back to the correct form
    const originalSeed = allSeeds.find((seed) => seed._id === newRow._id);
    const originalDateRecorded = originalSeed
      ? originalSeed.dateRecorded
      : newRow.dateRecorded;

    // Update the creatorName to the corresponding MongoDB object ID before dispatching
    const updatedRow = {
      ...newRow,
      creatorName: mapNameToId(newRow.creatorName),
      dateRecorded: originalDateRecorded,
      startTime: newRow.startTime ? newRow.startTime.toISOString() : null,
      expectedEndTime: newRow.expectedEndTime
        ? newRow.expectedEndTime.toISOString()
        : null,
      completionDate: newRow.completionDate
        ? newRow.completionDate.toISOString()
        : null,
      isNew: false,
    };

    const updatedRows = rows.map((row) =>
      row.id === newRow.id ? updatedRow : row
    );
    setRows(updatedRows);
    dispatch(modifySeed(updatedRow)); // Update global state with corrected creatorName and dateRecorded

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleProcessRowUpdateError = (error) => {
    console.error("Row update error: ", error);
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: "primary.main" }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      editable: true,
    },
    { field: "creatorName", headerName: "Creator", width: 150 },
    { field: "creatorEmail", headerName: "Email", width: 150, editable: true },
    {
      field: "dateRecorded",
      headerName: "Date Recorded",
      width: 150,
    },
    { field: "metric1", headerName: "metric1", width: 150, editable: true },
    { field: "metric2", headerName: "metric2", width: 150, editable: true },
    { field: "metric3", headerName: "metric3", width: 150, editable: true },
    { field: "metric4", headerName: "metric4", width: 150, editable: true },
    { field: "metric5", headerName: "metric5", width: 150, editable: true },
    { field: "metric6", headerName: "metric6", width: 150, editable: true },
    { field: "metric7", headerName: "metric7", width: 150, editable: true },
    { field: "metric8", headerName: "metric8", width: 150, editable: true },
    {
      field: "weeksLeadTime",
      headerName: "Lead Time (Wk)",
      type: "number",
      width: 100,
      editable: true,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: ["low", "medium", "high"],
    },
    { field: "status", headerName: "Status", width: 150, editable: true },
    {
      field: "startTime",
      headerName: "Start Date",
      width: 150,
      type: "date",
      editable: true,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return new Date(value);
      },
    },
    {
      field: "expectedEndTime",
      headerName: "Expected Closing Date",
      width: 150,
      type: "date",
      editable: true,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return new Date(value);
      },
    },
    {
      field: "completionDate",
      headerName: "Completion Date",
      width: 150,
      type: "date",
      editable: true,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return new Date(value);
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        slots={{ toolbar: GridToolbar }}
      />
    </Box>
  );
};

export default TableSeeds;

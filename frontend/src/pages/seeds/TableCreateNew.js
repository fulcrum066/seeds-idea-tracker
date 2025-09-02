// import React, { useState } from "react";
// import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
// import Box from "@mui/material/Box";
// import AddIcon from "@mui/icons-material/Add";
// import Autocomplete from "@mui/material/Autocomplete";
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
// import InputLabel from "@mui/material/InputLabel";
// import FormControl from "@mui/material/FormControl";

// const TableCreateNew = ({
//   handleCreateSeed,
//   user,
//   groups,
//   subGroups,
//   types,
// }) => {
//   const [seedData, setSeedData] = useState({
//     description: "",
//     creatorName: user._id,
//     creatorEmail: user.email,
//     dateRecorded: new Date().toISOString(),
//     group: "",
//     subGroup: "",
//     type: "",
//     priority: "low",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setSeedData({ ...seedData, [name]: value });
//   };

//   const handleAutocompleteChange = (event, value, fieldName) => {
//     setSeedData({ ...seedData, [fieldName]: value });
//   };

//   const onSubmit = (e) => {
//     e.preventDefault();
//     handleCreateSeed(seedData);
//     setSeedData({
//       description: "",
//       creatorName: user._id,
//       creatorEmail: user.email,
//       dateRecorded: new Date().toISOString(),
//       group: "",
//       subGroup: "",
//       type: "",
//       priority: "low",
//     });
//   };

//   return (
//     <Box
//       component="form"
//       onSubmit={onSubmit}
//       sx={{ display: "flex", flexDirection: "column", gap: 0 }}
//     >
//       <Button
//         type="submit"
//         variant="contained"
//         color="primary"
//         startIcon={<AddIcon />}
//         sx={{ alignSelf: "flex-start", marginBottom: 2 }}
//       >
//         Add Seed
//       </Button>
//       <Box
//         sx={{ display: "flex", overflowX: "auto", gap: 2, paddingTop: "5px" }}
//       >
//         <TextField
//           label="Description"
//           name="description"
//           helperText='Fill in the fields and click the "Add Seed" button'
//           value={seedData.description}
//           onChange={handleChange}
//           required
//           sx={{ flex: 3, backgroundColor: "white" }}
//         />
//         <Box sx={{ flex: 1, backgroundColor: "white" }}>
//           <Autocomplete
//             freeSolo
//             options={groups}
//             value={seedData.group}
//             onChange={(event, value) =>
//               handleAutocompleteChange(event, value, "group")
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Group"
//                 name="group"
//                 value={seedData.group}
//                 onChange={handleChange}
//                 required
//               />
//             )}
//           />
//         </Box>
//         <Box sx={{ flex: 1, backgroundColor: "white" }}>
//           <Autocomplete
//             freeSolo
//             options={subGroups}
//             value={seedData.subGroup}
//             onChange={(event, value) =>
//               handleAutocompleteChange(event, value, "subGroup")
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Sub-group"
//                 name="subGroup"
//                 value={seedData.subGroup}
//                 onChange={handleChange}
//                 required
//               />
//             )}
//           />
//         </Box>
//         <Box sx={{ flex: 1, backgroundColor: "white" }}>
//           <Autocomplete
//             freeSolo
//             options={types}
//             value={seedData.type}
//             onChange={(event, value) =>
//               handleAutocompleteChange(event, value, "type")
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Type"
//                 name="type"
//                 value={seedData.type}
//                 onChange={handleChange}
//                 required
//               />
//             )}
//           />
//         </Box>
//         <Box sx={{ flex: 1, backgroundColor: "white" }}>
//           <FormControl fullWidth required>
//             <InputLabel>Priority</InputLabel>
//             <Select
//               label="Priority"
//               name="priority"
//               value={seedData.priority}
//               onChange={handleChange}
//             >
//               <MenuItem value="low">Low</MenuItem>
//               <MenuItem value="medium">Medium</MenuItem>
//               <MenuItem value="high">High</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default TableCreateNew;

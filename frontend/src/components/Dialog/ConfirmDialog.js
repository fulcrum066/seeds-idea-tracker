import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const ConfirmDialog = (props) => {
  const { title, content, open, setOpen, onConfirm, onCancel } = props;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="primary"
        >
          Yes
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onCancel();
          }}
          color="default"
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

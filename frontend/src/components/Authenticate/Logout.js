import * as React from "react";
import { useState } from "react";
import ConfirmDialog from "../../components/Dialog/ConfirmDialog";
import { reset, logout } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Logout({}) {
  //------------------ATTRIBUTES/VARIABLES------------------
  const [dialogOpen, setDialogOpen] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //------------------FUNCTIONS------------------

  //------------

  // const onLogout = () => {};

  //------------------USE EFFECT------------------

  const handleConfirm = () => {
    // Dispatch the logout action
    dispatch(logout());
    dispatch(reset());
    navigate("/");
    window.location.reload();
    setDialogOpen(false);
  };
  const handleCancel = () => {
    // If user presses "No", navigate back to the previous page
    navigate(-1);

    // Close the dialog
    setDialogOpen(false);
  };

  // useEffect(() => {

  // }, [onLogout]);

  //------------------RETURN RENDER------------------

  // return <div>{onLogout()}</div>;
  return (
    <ConfirmDialog
      title=" "
      content="Are you sure you want to logout?"
      open={dialogOpen}
      setOpen={setDialogOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}

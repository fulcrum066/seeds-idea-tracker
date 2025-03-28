import React from "react";
import { useSelector } from "react-redux";
import Nav from "../navigation/Nav";
import EmployeeDashboardContent from "../dashboard/EmployeeDashboardContent";
import UpdateAccountPrivileges from "../../components/Pending/UpdateAccountPrivileges";

export default function HomePage({}) {
  //------------------ATTRIBUTES/VARIABLES------------------

  const { user } = useSelector((state) => state.auth);

  //------------------FUNCTIONS------------------

  //------------

  function getHomePage() {
    if (user.roles.includes("pending")) {
      return <UpdateAccountPrivileges />;
    } else {
      return <Nav main={[<EmployeeDashboardContent />]} />;
    }
  }

  //------------------RETURN RENDER------------------

  return <div>{getHomePage()}</div>;
}

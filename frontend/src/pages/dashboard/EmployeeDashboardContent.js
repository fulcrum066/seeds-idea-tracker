import * as React from "react";
import { useSelector } from "react-redux"; // Import useSelector to access the Redux state

// Define the roles object to use for checking roles
const ROLES = {
  employee: "employee",
  qm: "qm",
  admin: "admin",
  pending: "pending",
  salesTeam: "sales-team",
};

const cardData = [
  {
    link: "/dashboard/cia-dashboard",
    image: "/images/icons/report.svg",
    title: "CIAs",
    description:
      "For non-compliance, non-conformance or identified improvements.",
    actionText: "Manage CIAs",
  },
  {
    link: "/dashboard/sap",
    image: "/images/icons/sap-logo.svg",
    title: "F6",
    description: "Query the SAP database. Gain insight into various metrics.",
    actionText: "Query SAP",
  },
  {
    link: "/dashboard/projects",
    image: "/images/icons/project.svg",
    title: "Projects",
    description: "Analyse, create, assign and manage projects.",
    actionText: "View all projects",
  },
  {
    link: "/dashboard/business-calendar",
    image: "/images/icons/calendar.svg",
    title: "Business Calendar (alpha test)",
    description: "View repetitive or one off tasks to be complete.",
    actionText: "View Business Calendar",
  },
  {
    link: "/dashboard/catalogue",
    image: "/images/icons/catalog.svg",
    title: "Catalogue",
    description:
      "Add, modify and publish new and existing items to the Catalogue",
    actionText: "Manage the Catalogue",
  },
  {
    link: "/dashboard/reporting",
    image: "/images/icons/create-task.svg",
    title: "Reporting",
    description: "Financial, Inventory, Accounts and Sales Reports.",
    actionText: "View all reports",
  },
  {
    link: "/dashboard/settings",
    image: "/images/icons/account-settings.svg",
    title: "Account Settings",
    description: "Update all account related information here.",
    actionText: "Manage account",
  },
  {
    link: "/dashboard/seed",
    image: "/images/icons/seeds.svg",
    title: "Seeds",
    description: "Add, view and grow ideas for the business here.",
    actionText: "View Seeds",
    requiredRole: ROLES.admin, // Add required role for this card
  },
  {
    link: "/dashboard/visitors-dashboard",
    image: "/images/icons/visitors.svg",
    title: "Visitors",
    description: "Micromax visitor management system",
    actionText: "Manage Visitors",
  },
];

export default function EmployeeDashboardContent() {
  const { user } = useSelector((state) => state.auth); // Get user object from Redux state
  const userRoles = user?.roles || []; // Safely get the roles array or an empty array

  return (
    <section className="py-0  overflow-hidden">
      <div className="container px-0 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardData.map((card, index) => {
            // Check if the user has the required role for this card
            if (card.requiredRole && !userRoles.includes(card.requiredRole)) {
              return null; // Do not render this card if the user does not have the required role
            }
            return (
              <div
                key={index}
                className="p-8 shadow-lg border rounded-lg flex flex-col"
              >
                <a href={card.link}>
                  <div className="text-center flex-grow">
                    <img
                      className="mx-auto mb-9 w-28 h-28"
                      src={card.image}
                      alt=""
                    />
                    <div>
                      <h3 className="mb-4 text-xl font-semibold tracking-tight">
                        {card.title}
                      </h3>
                      <p className="mb-8 tracking-tight">{card.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="font-semibold text-indigo-500 hover:text-indigo-600 tracking-tight transition duration-200">
                      {card.actionText}
                    </span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

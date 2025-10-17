import React from "react";
import { useSelector } from "react-redux";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  CardMedia,
} from "@mui/material";
import { Link } from "react-router-dom";

const ROLES = {
  employee: "employee",
  qm: "qm",
  admin: "admin",
  pending: "pending",
  salesTeam: "sales-team",
};

const cardData = [
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
    requiredRole: ROLES.admin,
  },
];

export default function EmployeeDashboardContent() {
  const { user } = useSelector((state) => state.auth);
  const userRoles = user?.roles || [];

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ p: 2 }}>
      {cardData.map((card, index) => {
        if (card.requiredRole && !userRoles.includes(card.requiredRole)) {
          return null;
        }
        return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <CardMedia
                component="img"
                image={card.image}
                alt={card.title}
                sx={{ width: 140, height: 140, mx: "auto", mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <Button component={Link} to={card.link} size="small">
                  {card.actionText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

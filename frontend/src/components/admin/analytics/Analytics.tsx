"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Alert } from "src/models/Alert.model";
import { User } from "src/models/User.model";
import AlertAnalytics from "./AlertAnalytics";
import UserAnalytics from "./UserAnalytics";
import { useAuthStore } from "src/store/useAuthStore";

type AnalyticsView = "alerts" | "users" | "traffic";

export default function Analytics() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AnalyticsView>("traffic");
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user) {
          throw new Error("Authentication required");
        }

        const [alertsResponse, usersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!alertsResponse.ok || !usersResponse.ok) {
          if (alertsResponse.status === 401 || usersResponse.status === 401) {
            throw new Error("Authentication required");
          }
          throw new Error("Failed to fetch data");
        }

        const [alertsData, usersData] = await Promise.all([
          alertsResponse.json(),
          usersResponse.json(),
        ]);

        setAlerts(alertsData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <ButtonGroup variant="contained" aria-label="analytics view toggle">
          <Button
            onClick={() => setView("traffic")}
            variant={view === "traffic" ? "contained" : "outlined"}
          >
            Traffic Analytics
          </Button>
          <Button
            onClick={() => setView("alerts")}
            variant={view === "alerts" ? "contained" : "outlined"}
          >
            Alert Analytics
          </Button>
          <Button
            onClick={() => setView("users")}
            variant={view === "users" ? "contained" : "outlined"}
          >
            User Analytics
          </Button>
        </ButtonGroup>
      </Box>

      {view === "traffic" && (
        <Box
          sx={{
            width: "100%",
            height: 0,
            paddingBottom: "56.25%",
            position: "relative",
          }}
        >
          <iframe
            title="supmap_dashboard"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            src="https://app.powerbi.com/reportEmbed?reportId=dabfa71e-f211-42c5-b151-43ade74fe8c1&autoAuth=true&ctid=1dc8f08a-46f6-4cdb-b8ff-03e46c14979d"
            frameBorder="0"
            allowFullScreen={true}
          ></iframe>
        </Box>
      )}
      {view === "alerts" && <AlertAnalytics alerts={alerts} />}
      {view === "users" && <UserAnalytics users={users} />}
    </Box>
  );
}

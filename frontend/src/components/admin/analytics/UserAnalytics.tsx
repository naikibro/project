"use client";

import { Box, Card, CardContent, Grid, Paper, Typography } from "@mui/material";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { User } from "src/models/User.model";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface UserAnalyticsProps {
  users: User[];
}

export default function UserAnalytics({ users }: UserAnalyticsProps) {
  const metrics = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const users24h = users.filter(
      (user) => new Date(user.createdAt) >= last24h
    );
    const users1h = users.filter(
      (user) => new Date(user.createdAt) >= lastHour
    );

    // User role distribution
    const roleDistribution = users.reduce((acc, user) => {
      const roleName = user.role?.name || "No Role";
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const roleData = Object.entries(roleDistribution).map(([role, count]) => ({
      name: role,
      value: count,
    }));

    // User activity distribution (based on active status)
    const activityData = [
      {
        name: "Active Users",
        count: users.filter((user) => user.isActive).length,
      },
      {
        name: "Inactive Users",
        count: users.filter((user) => !user.isActive).length,
      },
    ];

    // User growth over time
    const growthData = Array.from({ length: 24 }, (_, i) => {
      const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (22 - i) * 60 * 60 * 1000);
      return {
        hour: hourStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        newUsers: users.filter(
          (user) =>
            new Date(user.createdAt) >= hourStart &&
            new Date(user.createdAt) < hourEnd
        ).length,
      };
    });

    // Terms acceptance rate
    const termsAcceptance = {
      accepted: users.filter((user) => user.acceptedTerms).length,
      notAccepted: users.filter((user) => !user.acceptedTerms).length,
    };

    return {
      totalUsers: users.length,
      newUsers24h: users24h.length,
      newUsers1h: users1h.length,
      roleDistribution: roleData,
      activityData,
      growthData,
      termsAcceptance,
      activeUsers: users.filter((user) => user.isActive).length,
    };
  }, [users]);

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{metrics.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4">{metrics.activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Users (24h)
              </Typography>
              <Typography variant="h4">{metrics.newUsers24h}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Users (1h)
              </Typography>
              <Typography variant="h4">{metrics.newUsers1h}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              User Role Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.roleDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {metrics.roleDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              User Growth (Last 24h)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#8884d8"
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              User Activity Status
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Terms Acceptance
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Accepted",
                      value: metrics.termsAcceptance.accepted,
                    },
                    {
                      name: "Not Accepted",
                      value: metrics.termsAcceptance.notAccepted,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF8042" />
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

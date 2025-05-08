"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Typography,
} from "@mui/material";
import { format, isWithinInterval, subHours, subMinutes } from "date-fns";
import { useMemo, useState } from "react";
import SortIcon from "@mui/icons-material/Sort";
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
import { Alert } from "src/models/Alert.model";

// Match backend AlertType enum
export enum AlertType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  ACCIDENT = "accident",
  TRAFFIC_JAM = "traffic_jam",
  ROAD_CLOSED = "road_closed",
  POLICE_CONTROL = "police_control",
  OBSTACLE_ON_ROAD = "obstacle_on_road",
}

type SortField = "date" | "type" | "upvotes" | "downvotes";
type SortDirection = "asc" | "desc";
type TimeFilter = "15m" | "1h" | "12h" | "24h" | "all";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface AlertAnalyticsProps {
  alerts: Alert[];
}

interface TypeDistribution {
  name: string;
  value: number;
}

interface HourlyData {
  hour: string;
  count: number;
}

interface RatingDistribution {
  upvotes: number;
  downvotes: number;
}

interface Metrics {
  totalAlerts: number;
  alerts24h: number;
  alerts1h: number;
  typeDistribution: TypeDistribution[];
  hourlyData: HourlyData[];
  ratingDistribution: RatingDistribution;
  averageResponseTime: number;
}

export default function AlertAnalytics({ alerts }: AlertAnalyticsProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getAlertTypeColor = (type: AlertType) => {
    switch (type) {
      case AlertType.ACCIDENT:
      case AlertType.ERROR:
      case AlertType.ROAD_CLOSED:
        return "error";
      case AlertType.TRAFFIC_JAM:
      case AlertType.OBSTACLE_ON_ROAD:
      case AlertType.WARNING:
        return "warning";
      case AlertType.POLICE_CONTROL:
      case AlertType.INFO:
        return "info";
      default:
        return "default";
    }
  };

  const metrics = useMemo<Metrics>(() => {
    const now = new Date();
    const last24h = subHours(now, 24);
    const lastHour = subHours(now, 1);

    const alerts24h = alerts.filter((alert) => new Date(alert.date) >= last24h);
    const alerts1h = alerts.filter((alert) => new Date(alert.date) >= lastHour);

    // Alert type distribution
    const typeDistribution = Object.values(AlertType).map((type) => ({
      name: type,
      value: alerts24h.filter((alert) => alert.type === type).length,
    }));

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hourStart = subHours(now, 23 - i);
      const hourEnd = subHours(now, 22 - i);
      return {
        hour: format(hourStart, "HH:mm"),
        count: alerts24h.filter(
          (alert) =>
            new Date(alert.date) >= hourStart && new Date(alert.date) < hourEnd
        ).length,
      };
    });

    // Rating distribution
    const ratingDistribution = alerts24h.reduce(
      (acc, alert) => ({
        upvotes: acc.upvotes + (alert.ratings?.upvotes || 0),
        downvotes: acc.downvotes + (alert.ratings?.downvotes || 0),
      }),
      { upvotes: 0, downvotes: 0 }
    );

    // Calculate average response time (time between alert creation and first rating)
    const averageResponseTime =
      alerts24h.reduce((acc, alert) => {
        if (
          !alert.ratings ||
          (!alert.ratings.upvotes && !alert.ratings.downvotes)
        ) {
          return acc;
        }
        const alertDate = new Date(alert.date);
        const now = new Date();
        const responseTime =
          (now.getTime() - alertDate.getTime()) / (1000 * 60); // in minutes
        return acc + responseTime;
      }, 0) / alerts24h.length || 0;

    return {
      totalAlerts: alerts.length,
      alerts24h: alerts24h.length,
      alerts1h: alerts1h.length,
      typeDistribution,
      hourlyData,
      ratingDistribution,
      averageResponseTime,
    };
  }, [alerts]);

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const timeRanges = {
        "15m": subMinutes(now, 15),
        "1h": subHours(now, 1),
        "12h": subHours(now, 12),
        "24h": subHours(now, 24),
      };
      filtered = filtered.filter((alert) =>
        isWithinInterval(new Date(alert.date), {
          start: timeRanges[timeFilter],
          end: now,
        })
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((alert) => alert.type === typeFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "upvotes":
          comparison = (a.ratings?.upvotes || 0) - (b.ratings?.upvotes || 0);
          break;
        case "downvotes":
          comparison =
            (a.ratings?.downvotes || 0) - (b.ratings?.downvotes || 0);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [alerts, timeFilter, typeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAlerts = filteredAndSortedAlerts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Time Filter</InputLabel>
            <Select
              value={timeFilter}
              label="Time Filter"
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="15m">Last 15 minutes</MenuItem>
              <MenuItem value="1h">Last hour</MenuItem>
              <MenuItem value="12h">Last 12 hours</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Type Filter</InputLabel>
            <Select
              value={typeFilter}
              label="Type Filter"
              onChange={(e) =>
                setTypeFilter(e.target.value as AlertType | "all")
              }
            >
              <MenuItem value="all">All Types</MenuItem>
              {Object.values(AlertType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Alerts
              </Typography>
              <Typography variant="h4">{metrics.totalAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Last 24 Hours
              </Typography>
              <Typography variant="h4">{metrics.alerts24h}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Last Hour
              </Typography>
              <Typography variant="h4">{metrics.alerts1h}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Response Time
              </Typography>
              <Typography variant="h4">
                {metrics.averageResponseTime.toFixed(1)} min
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Alert Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.typeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {metrics.typeDistribution.map((entry, index) => (
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
              Hourly Alert Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="Alerts"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Rating Distribution (Last 24h)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "Upvotes",
                    value: metrics.ratingDistribution.upvotes,
                  },
                  {
                    name: "Downvotes",
                    value: metrics.ratingDistribution.downvotes,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Type
                  <Tooltip title="Sort by type">
                    <IconButton
                      size="small"
                      onClick={() => handleSort("type")}
                      color={sortField === "type" ? "primary" : "default"}
                    >
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell>Location</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Date
                  <Tooltip title="Sort by date">
                    <IconButton
                      size="small"
                      onClick={() => handleSort("date")}
                      color={sortField === "date" ? "primary" : "default"}
                    >
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Ratings
                  <Tooltip title="Sort by upvotes">
                    <IconButton
                      size="small"
                      onClick={() => handleSort("upvotes")}
                      color={sortField === "upvotes" ? "primary" : "default"}
                    >
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Typography variant="subtitle2">{alert.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {alert.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={alert.type}
                    color={getAlertTypeColor(alert.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {alert.locationContext?.address?.name ||
                    alert.locationContext?.place?.name ||
                    `${alert.coordinates.latitude.toFixed(
                      4
                    )}, ${alert.coordinates.longitude.toFixed(4)}`}
                </TableCell>
                <TableCell>
                  {format(new Date(alert.date), "MMM d, HH:mm")}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={`👍 ${alert.ratings?.upvotes || 0}`}
                      size="small"
                      color="success"
                    />
                    <Chip
                      label={`👎 ${alert.ratings?.downvotes || 0}`}
                      size="small"
                      color="error"
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAndSortedAlerts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

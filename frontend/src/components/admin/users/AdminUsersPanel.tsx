import { CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { UserDto } from "src/models/User.model";
import UsersList from "./UsersList";
import { playfair } from "src/themes/fonts";

const AdminUsersPanel = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : json.data);
    } catch (err) {
      setError("Error fetching users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container aria-label="admin-users-panel" sx={{ mt: 4, py: 2 }}>
      <h2
        aria-label="hotels-title"
        className={`tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl mb-0 ${playfair.variable} font-serif`}
      >
        Users
      </h2>
      <UsersList users={users} fetchUsers={fetchUsers} />
    </Container>
  );
};

export default AdminUsersPanel;

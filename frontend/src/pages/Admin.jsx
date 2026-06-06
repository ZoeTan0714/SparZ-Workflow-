import { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, CircularProgress, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { fetchUsers, updateUserRole } from "../services/adminService";

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;

    setLoading(true);
    fetchUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load users.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleRoleChange = async (userId, role) => {
    setSavingUserId(userId);
    setError("");
    try {
      const res = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data.user : u)));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update role.");
    } finally {
      setSavingUserId(null);
    }
  };

  if (!user) {
    return <Typography>请先登录。</Typography>;
  }

  if (user.role !== "admin") {
    return <Typography>Access denied. 只有管理员可以访问此页面。</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Admin Page
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        这里列出了所有用户。管理员可以修改用户角色。
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role || "user"}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      size="small"
                      disabled={savingUserId === u._id}
                    >
                      <MenuItem value="user">user</MenuItem>
                      <MenuItem value="admin">admin</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

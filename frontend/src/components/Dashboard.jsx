import { Box, Stack, Typography, Avatar, Button, TextField, Divider } from "@mui/material";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import {
  Account,
  AccountPreview,
  AccountPopoverFooter,
  SignOutButton,
} from "@toolpad/core/Account";
import DividerMui from "@mui/material/Divider";
import { useSession } from "@toolpad/core/useSession";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import forgeLogo from "../assets/sparz.png";
import { theme } from "../styles/theme";
import { useMemo, useState } from "react";
import { updateProfile } from "../services/authService";

const BASE_NAVIGATION = [
  {
    kind: "header",
    title: "Workspace",
  },
  {
    segment: "projects",
    title: "Projects",
    icon: <DashboardIcon />,
  },
  {
    segment: "workflow",
    title: "Workflow",
    icon: <WorkIcon />,
  },
];

function CustomToolbarActions() {
  return (
    <Stack direction="row">
      <ThemeSwitcher />
    </Stack>
  );
}

function AccountSidebarPreview(props) {
  const { handleClick, open, mini } = props;
  const session = useSession();
  return (
    <Stack direction="column" p={0}>
      <Divider />
      <AccountPreview
        variant={mini ? "condensed" : "expanded"}
        handleClick={handleClick}
        open={open}
        slotProps={{
          avatar: {
            children: <UserAvatar name={session.user.name} src={session.user.avatar} />,
          },
        }}
      />
    </Stack>
  );
}

function SidebarFooterAccountPopover() {
  const { user, token, login } = useAuth();
  const defaultFormData = useMemo(
    () => ({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      avatar: user?.avatar || "",
      preview: user?.avatar || "",
    }),
    [user],
  );
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result,
        preview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfile(payload);
      login(token, res.data.user);
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setError("");
  };

  if (!user) return null;

  return (
    <Stack direction="column" sx={{ width: 320, p: 2, gap: 1 }}>
      <Typography variant="subtitle2" fontWeight={700}>
        Account settings
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar src={formData.preview} sx={{ width: 56, height: 56 }}>
          {!formData.preview && user.username?.[0]?.toUpperCase()}
        </Avatar>
        <Button component="label" size="small" variant="outlined">
          Upload dp
          <input hidden accept="image/*" type="file" onChange={handleFileChange} />
        </Button>
      </Box>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      <TextField
        label="Username"
        value={formData.username}
        onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
        fullWidth
        size="small"
      />
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        fullWidth
        size="small"
      />
      <TextField
        label="Password"
        type="password"
        helperText="Leave blank to keep current password"
        value={formData.password}
        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        fullWidth
        size="small"
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
        <Button size="small" onClick={handleCancel}>
          Cancel
        </Button>
        <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>
      <DividerMui />
      <Stack direction="column" spacing={0.5}>
        <Typography variant="body2">{user.username}</Typography>
        <Typography variant="caption" color="text.secondary">
          {user.email}
        </Typography>
      </Stack>
      <DividerMui />
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
}

const createPreviewComponent = (mini) => {
  function PreviewComponent(props) {
    return <AccountSidebarPreview {...props} mini={mini} />;
  }
  return PreviewComponent;
};

function SidebarFooterAccount({ mini }) {
  const session = useSession();
  const PreviewComponent = useMemo(() => createPreviewComponent(mini), [mini]);

  if (!session?.user) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Account
        slots={{
          preview: PreviewComponent,
          popoverContent: SidebarFooterAccountPopover,
        }}
        slotProps={{
          popover: {
            transformOrigin: { horizontal: "left", vertical: "bottom" },
            anchorOrigin: { horizontal: "right", vertical: "bottom" },
            disableAutoFocus: true,
            slotProps: {
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: (theme) =>
                    `drop-shadow(0px 2px 8px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.32)"})`,
                  mt: 1,
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translate(-50%, -50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            },
          },
        }}
      />
    </Box>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const router = useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => navigate(path),
    };
  }, [location, navigate]);

  const session = useMemo(
    () => ({
      user: {
        name: user ? `${user.firstName} ${user.lastName}` : "",
        email: user?.email || "",
        avatar: user?.avatar || "",
      },
    }),
    [user],
  );

  const navigation = useMemo(() => {
    const items = [...BASE_NAVIGATION];
    if (user?.role === "admin") {
      items.push({
        segment: "admin",
        title: "User",
        icon: <AdminPanelSettingsIcon />,
      });
    }
    return items;
  }, [user]);

  return (
    <AppProvider
      navigation={navigation}
      branding={{
        logo: <img src={forgeLogo} alt="FORGE logo" style={{ height: 50 }} />,
        title: "",
        homeUrl: "/projects",
      }}
      router={router}
      theme={theme}
      session={session}
      authentication={{
        signOut: () => {
          logout();
          navigate("/signout");
        },
      }}
    >
      <DashboardLayout
        slots={{
          toolbarActions: CustomToolbarActions,
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}

export default Dashboard;

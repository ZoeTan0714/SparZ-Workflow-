import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";

function stringToColor(name) {
  let hash = 0;
  let i;
  for (i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name = "") {
  const parts = name.split(" ");

  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`
      : `${parts[0][0] || "?"}`;

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 35,
      height: 35,
      fontSize: "14px",
    },
    children: initials.toUpperCase(),
  };
}

export default function UserAvatar({ name, src }) {
  const avatarProps = stringAvatar(name || "");
  if (src) {
    return (
      <Stack direction="row" spacing={2}>
        <Avatar src={src} sx={avatarProps.sx} />
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={2}>
      <Avatar {...avatarProps} />
    </Stack>
  );
}

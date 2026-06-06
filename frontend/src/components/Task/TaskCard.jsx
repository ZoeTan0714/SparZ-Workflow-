import { useDraggable } from "@dnd-kit/core";
import { alpha, useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

import UserAvatar from "../UserAvatar";

function useTaskCardShellStyle({ marginBottom = "12px" } = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    background: isDark
      ? theme.palette.background.paper
      : "#ffffff",

    color: theme.palette.text.primary,

    padding: "15px",

    borderRadius: "10px",

    boxShadow: isDark
      ? `0 2px 10px ${alpha("#000000", 0.45)}`
      : "0 2px 6px rgba(0,0,0,0.1)",

    ...(isDark
      ? {
          border: `1px solid ${alpha(theme.palette.divider, 0.35)}`,
        }
      : {}),

    marginBottom,
  };
}

function TaskCardBody({ task, onClick }) {
  return (
    <div onClick={() => onClick?.(task)}>
      <div
        style={{
          display: "flex",

          justifyContent: "space-between",
        }}
      >
        <strong>{task.title}</strong>

        <div
          style={{
            display: "flex",
            gap: "5px",
          }}
        >
          {task.assignees?.map((user) => (
            <UserAvatar
              key={user._id}
              name={user.username}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "10px",

          display: "flex",

          gap: "10px",

          fontSize: "12px",
        }}
      >
        <span>{task.type}</span>

        <span>{task.priority}</span>

        <span>
          {task.dueDate
            ? dayjs(task.dueDate).format("YYYY-MM-DD")
            : "None"}
        </span>
      </div>
    </div>
  );
}

/** Static preview for <DragOverlay /> — must not call useDraggable. */
export function TaskCardPreview({ task }) {
  const theme = useTheme();
  const shell = useTaskCardShellStyle({ marginBottom: 0 });

  return (
    <div
      style={{
        ...shell,

        cursor: "grabbing",
      }}
    >
      <div
        style={{
          marginBottom: "10px",

          fontSize: "14px",

          color: theme.palette.text.secondary,
        }}
      >
        ☰ Drag
      </div>

      <TaskCardBody task={task} />
    </div>
  );
}

export default function TaskCard({
  task,
  onClick,
}) {
  const theme = useTheme();
  const id = String(task._id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
  });

  const shell = useTaskCardShellStyle();

  const style = {
    ...shell,

    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,

    opacity: isDragging ? 0.35 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...listeners}
        {...attributes}
        style={{
          cursor: "grab",

          marginBottom: "10px",

          fontSize: "14px",

          color: theme.palette.text.secondary,

          touchAction: "none",
        }}
      >
        ☰ Drag
      </div>

      <TaskCardBody task={task} onClick={onClick} />
    </div>
  );
}
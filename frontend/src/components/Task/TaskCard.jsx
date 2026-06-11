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

function TaskCardBody({ task, onClick, dragListeners, dragAttributes }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
    onClick?.(task);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
      }}
    >
      {/* Draggable Handle */}
      <div
        {...dragListeners}
        {...dragAttributes}
        style={{
          cursor: "grab",
          touchAction: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "24px",
          flexShrink: 0,
          color: "#999",
          fontSize: "18px",
          userSelect: "none",
        }}
      >
        ⋮⋮
      </div>

      {/* Clickable Content */}
      <div
        onClick={handleCardClick}
        style={{
          cursor: "pointer",
          flex: 1,
        }}
      >
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
            flexWrap: "wrap",
          }}
        >
          <span>{task.type}</span>
          <span>{task.status}</span>
        </div>

        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          Target completion date: {task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : "None"}
        </div>
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
      <TaskCardBody
        task={task}
        onClick={onClick}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </div>
  );
}
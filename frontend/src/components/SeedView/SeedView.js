import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";

const METRICS = [
  { name: "maintainingCompliance", label: "Maintaining Compliance" },
  { name: "reducingCost", label: "Reducing Cost" },
  { name: "reducingRisk", label: "Reducing Risk" },
  { name: "improvingProductivity", label: "Improving Productivity" },
  { name: "improvingProcesses", label: "Improving Processes" },
  { name: "creatingNewRevenueStreams", label: "Creating New Revenue Streams" },
];

const RATING_OPTIONS = ["very high", "high", "medium", "low", "very low"];

export default function SeedView({
  open,
  onClose,
  viewingIdea,
  isEditingInView,
  setIsEditingInView,
  viewFormData,
  setViewFormData,
  onSaveInView,
  onCancelEdit,
  onToggleFavorite,
  newComment,
  setNewComment,
  onAddComment,
  onDeleteComment,
}) {
  if (!viewingIdea) return null;

  const labelStyle = {
    color: "black",
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    alignSelf: "flex-start",
  };

  const readonlyBox = {
    padding: "8px",
    width: "100%",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "#fff",
    minHeight: "20px",
    textTransform: "capitalize",
  };

  const inputStyle = {
    padding: "8px",
    width: "100%",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: "60px",
        }}
      >
        <span>View Seed Idea</span>

        {/* Favorite toggle pill */}
        <div
          onClick={() => onToggleFavorite(viewingIdea._id || viewingIdea.id)}
          role="button"
          aria-label="toggle-favorite"
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: "6px",
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: viewingIdea?.isFavorite ? "#fff3cd" : "transparent",
            border:
              "1px solid " + (viewingIdea?.isFavorite ? "#ffeaa7" : "#ddd"),
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: viewingIdea?.isFavorite ? "#6a4026" : "#555",
              fontWeight: 600,
            }}
          >
            {viewingIdea?.isFavorite ? "Favorited" : "Add to Favorites"}
          </span>
          <span
            style={{
              fontSize: 16,
              color: viewingIdea?.isFavorite ? "#FFD700" : "#ccc",
              transition: "color 0.2s ease",
            }}
          >
            ★
          </span>
        </div>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ccc",
            padding: 10,
            width: "100%",
            backgroundColor: "#f9f9f9",
            borderRadius: 4,
          }}
        >
          {/* Top grid */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Left column */}
            <div style={{ flex: 2, minWidth: 260 }}>
              <label style={labelStyle}>Title:</label>
              {isEditingInView ? (
                <input
                  type="text"
                  value={viewFormData.title || ""}
                  onChange={(e) =>
                    setViewFormData({ ...viewFormData, title: e.target.value })
                  }
                  style={inputStyle}
                />
              ) : (
                <div style={readonlyBox}>{viewingIdea.title}</div>
              )}

              <label style={labelStyle}>Description:</label>
              {isEditingInView ? (
                <textarea
                  rows={5}
                  value={viewFormData.description || ""}
                  onChange={(e) =>
                    setViewFormData({
                      ...viewFormData,
                      description: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              ) : (
                <div style={{ ...readonlyBox, minHeight: 100 }}>
                  {viewingIdea.content || viewingIdea.description}
                </div>
              )}

              <label style={labelStyle}>Priority:</label>
              {isEditingInView ? (
                <select
                  value={viewFormData.priority || "low"}
                  onChange={(e) =>
                    setViewFormData({
                      ...viewFormData,
                      priority: e.target.value,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <div style={{ ...readonlyBox, textTransform: "capitalize" }}>
                  {viewingIdea.priority || "low"}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <label style={labelStyle}>Creator:</label>
                  <div style={readonlyBox}>
                    {viewingIdea.creatorName || viewingIdea.rawSeed?.creatorName || "Unknown"}
              </div>

              <label style={labelStyle}>Creator Email:</label>
                  <div style={readonlyBox}>
                    {viewingIdea.creatorEmail || viewingIdea.rawSeed?.creatorEmail || "Unknown"}
              </div>

              <label style={labelStyle}>Created:</label>
              <div style={readonlyBox}>
                    {viewingIdea.dateRecorded
                  ? new Date(viewingIdea.dateRecorded).toLocaleString()
                  : viewingIdea.rawSeed?.dateRecorded
                  ? new Date(viewingIdea.rawSeed.dateRecorded).toLocaleString()
                  : "Unknown"}
              </div>
            </div>
          </div>

          {/* “Metrics” / extra fields */}
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 10,
            }}
          >
            {METRICS.map((metric) => (
              <div key={metric.name}>
                <label style={labelStyle}>{metric.label}</label>
                {isEditingInView ? (
                  <select
                    style={inputStyle}
                    value={viewFormData[metric.name] || "medium"}
                    onChange={(e) =>
                      setViewFormData({
                        ...viewFormData,
                        [metric.name]: e.target.value,
                      })
                    }
                  >
                    {RATING_OPTIONS.map((option) => (
                      <option key={option} value={option} style={{ textTransform: "capitalize" }}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={readonlyBox}>
                    {viewingIdea[metric.name] || viewingIdea.rawSeed?.[metric.name] || "Not set"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Media section (placeholder) */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: 20,
                width: "100%",
                textAlign: "center",
                backgroundColor: "#fff",
                color: "#666",
                marginBottom: 10,
                border: "1px dashed #ddd",
                borderRadius: 4,
              }}
            >
              No media uploaded for this seed
            </div>
          </div>

          {/* Comments */}
          <div
            style={{
              marginTop: 20,
              borderTop: "1px solid #ddd",
              paddingTop: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Comments</h3>

            {Array.isArray(viewingIdea.comments) &&
            viewingIdea.comments.length > 0 ? (
              viewingIdea.comments.map((comment) => (
                <div
                  key={comment._id || comment.createdAt}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    border: "1px solid #eee",
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 1, marginRight: 8 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      {comment.author || "Anonymous"}
                      {comment.authorEmail
                        ? ` (${comment.authorEmail})`
                        : ""}
                    </div>
                    <div style={{ fontSize: 13 }}>{comment.text}</div>
                  </div>

                  {isEditingInView && (
                    <button
                      onClick={() =>
                        onDeleteComment(
                          viewingIdea._id || viewingIdea.id,
                          comment._id
                        )
                      }
                      style={{
                        backgroundColor: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 12,
                        cursor: "pointer",
                        height: 32,
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#cc0000")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ff4444")
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: 20, color: "#666", textAlign: "center" }}>
                No comments yet
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="text"
                placeholder="Write a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => onAddComment(viewingIdea._id || viewingIdea.id)}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1565c0")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1976d2")
                }
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        {!isEditingInView ? (
          <Button
            variant="contained"
            onClick={() => setIsEditingInView(true)}
            sx={{ backgroundColor: "#6a4026", "&:hover": { opacity: 0.9 } }}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={onSaveInView}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={onCancelEdit}
              sx={{ color: "#6a4026", borderColor: "#6a4026" }}
            >
              Cancel
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

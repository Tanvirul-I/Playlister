import { useContext, useState } from "react";
import { Button, List, ListItem, TextField, Typography } from "@mui/material";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function CommentsPanel(props) {
  const { onSubmit } = props;
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");

  const comments = store.currentList ? store.currentList.comments : [];
  const hasComments = comments && comments.length > 0;
  const isGuest = Boolean(auth?.user?.isGuest);
  const canComment = Boolean(store.currentList) && !isGuest;
  const isDisabled = !store.currentList;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canComment) {
      return;
    }
    const trimmedText = commentText.trim();
    if (!trimmedText || !store.currentList) {
      return;
    }

    let submitted = false;
    if (onSubmit) {
      try {
        const result = await onSubmit(trimmedText);
        submitted = result !== false;
      } catch (error) {
        submitted = false;
      }
    } else if (store.addComment) {
      submitted = await store.addComment(store.currentList._id, trimmedText);
    }

    if (submitted) {
      setCommentText("");
    }
  };

  return (
    <div className="comments-panel">
      <List
        className="comments-list"
        sx={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {hasComments ? (
          comments.map((comment, index) => (
            <ListItem
              key={comment._id ?? index}
              sx={{
                display: "block",
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "#f5f5f5",
                boxShadow: "0 12px 22px rgba(0, 0, 0, 0.35)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#fafafa",
                  marginBottom: "0.25rem",
                }}
              >
                {comment.author}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  color: "rgba(245, 245, 245, 0.82)",
                }}
              >
                {comment.comment}
              </Typography>
            </ListItem>
          ))
        ) : (
          <ListItem
            sx={{
              justifyContent: "center",
              color: "rgba(245, 245, 245, 0.6)",
            }}
          >
            <Typography variant="body2">No comments yet.</Typography>
          </ListItem>
        )}
      </List>
      {canComment ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            disabled={isDisabled}
            InputProps={{
              sx: {
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderRadius: "12px",
                color: "#f5f5f5",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.12)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e0e0e0",
                },
                "& .MuiInputBase-input": {
                  color: "#f5f5f5",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(245, 245, 245, 0.45)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: "rgba(255, 255, 255, 0.35)",
                },
                "&.Mui-disabled .MuiInputBase-input": {
                  color: "rgba(255, 255, 255, 0.35)",
                },
              },
            }}
            FormHelperTextProps={{
              sx: { color: "rgba(245, 245, 245, 0.7)" },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isDisabled || commentText.trim().length === 0}
            sx={{
              background: "linear-gradient(135deg, #2c2c2c, #151515)",
              color: "#f4f4f4",
              boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
              ":hover": {
                background: "linear-gradient(135deg, #353535, #1c1c1c)",
                color: "#ffffff",
                boxShadow: "0 14px 26px rgba(0,0,0,0.38)",
              },
            }}
          >
            Post
          </Button>
        </form>
      ) : (
        <Typography
          variant="body2"
          sx={{
            padding: "0 1rem 1.25rem",
            color: "rgba(245, 245, 245, 0.58)",
            textAlign: "center",
          }}
        >
          Sign in to join the discussion.
        </Typography>
      )}
    </div>
  );
}

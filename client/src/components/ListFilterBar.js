import { useContext, useState } from "react";
import { Button, Menu, MenuItem, Stack, TextField } from "@mui/material";
import { Sort } from "@mui/icons-material";
import { GlobalStoreContext } from "../store";
import SORT_OPTIONS from "../common/sortOptions";

export default function ListFilterBar() {
  const { store } = useContext(GlobalStoreContext);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  if (!store) {
    return null;
  }

  const isMenuOpen = Boolean(menuAnchorEl);
  const searchValue = store.searchTerm || "";
  const activeSort = store.sortType;

  const handleSearchChange = (event) => {
    const { value } = event.target;
    store.filterBySearch(value);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSortSelection = (sortKey) => {
    store.setSortType(sortKey);
    handleMenuClose();
  };

  return (
    <div className="list-filters-overlay">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          alignItems: "stretch",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <TextField
          size="small"
          label="Search"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search playlists"
          sx={{
            background: "rgba(244, 244, 244, 0.9)",
            borderRadius: 2,
            minWidth: { xs: "200px", sm: "240px" },
            maxWidth: { sm: "320px", lg: "380px" },
          }}
        />
        <Button
          variant="contained"
          onClick={handleMenuOpen}
          endIcon={<Sort />}
          sx={{
            background: "linear-gradient(135deg, #2c2c2c, #161616)",
            color: "#f4f4f4",
            textTransform: "none",
            paddingX: 2.5,
            borderRadius: 2,
            ":hover": {
              background: "linear-gradient(135deg, #353535, #1c1c1c)",
            },
          }}
        >
          Sort By
        </Button>
      </Stack>
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem
            key={option.key}
            onClick={() => handleSortSelection(option.key)}
            selected={activeSort === option.key}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

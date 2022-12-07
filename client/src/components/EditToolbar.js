import { useContext, useState } from 'react';
import { GlobalStoreContext } from '../store'

import { TextField, Toolbar, MenuItem, Menu, Button, Box, AppBar } from '@mui/material';
import { Sort, Home, Groups, Person } from '@mui/icons-material';

const imageStyle = {
  "maxWidth": "10%",
  "height": "10%",
};

export default function AppBanner() {
    const { store } = useContext(GlobalStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [ search, setSearch ] = useState("Search");
    const isMenuOpen = Boolean(anchorEl);

    const handleSortMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    function handleUpdateTitle(event) {
        setSearch(event.target.value);
    }

    return (
        <Box sx={{ flexGrow: 1 }} id="edit-toolbar">
            <AppBar position="static" style={{ background: '#242424' }}>
                <Toolbar>
                    <Home size="large"></Home>
                    <Groups size="large" sx = {{ position: "absolute", left: "5%" }}></Groups>
                    <Person size="large" sx = {{ position: "absolute", left: "8%" }}></Person>
                        <TextField
                            margin="normal"
                            id="search"
                            label="Search"
                            name="search"
                            size="small"
                            sx = {{background: 'white', color: 'black', position: "absolute", left: "40%", width: "40%",
                            fontSize: "1px" }}
                        />
                        <Button
                            size="large"
                            edge="end"
                            aria-label="Sort List"
                            aria-controls='primary-sort-list-menu'
                            aria-haspopup="true"
                            onClick={handleSortMenuOpen}
                            sx = {{background: 'grey', color: 'black', position: "absolute", right: "1%",
                            ':hover': {
                                bgcolor: 'white',
                                color: 'black',
                            } }}
                        >
                         Sort By
                         <Sort size="large"></Sort>
                        </Button>
                </Toolbar>
            </AppBar>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                id='primary-sort-list-menu'
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>Name (A - Z)</MenuItem>
                <MenuItem onClick={handleMenuClose}>Publish Date (Newest)</MenuItem>
                <MenuItem onClick={handleMenuClose}>Listens (High - Low)</MenuItem>
                <MenuItem onClick={handleMenuClose}>Likes (High - Low)</MenuItem>
                <MenuItem onClick={handleMenuClose}>Dislikes (High - Low)</MenuItem>
            </Menu>
        </Box>
    );
}
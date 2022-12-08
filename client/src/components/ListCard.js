import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import SongCard from './SongCard.js'

import { Box, ListItem, TextField, Typography, List, Button } from '@mui/material'
import { ExpandMore, ExpandLess, ThumbUp, ThumbDown } from '@mui/icons-material';

/*
    This is a card in our list of playlists. It lets select
    a list for editing and it has controls for changing its 
    name or deleting it.
    
    @author McKilla Gorilla
    @author Tanvirul Islam
*/
function ListCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const [editActive, setEditActive] = useState(false);
    const [text, setText] = useState("");
    const { idNamePair, selected } = props;

    let author = "Test"

    function handleLoadList(event, id) {
        
        if (!event.target.disabled) {
            let _id = event.target.id;
            if (_id.indexOf('list-card-text-') >= 0)
                _id = ("" + _id).substring("list-card-text-".length);

            // CHANGE THE CURRENT LIST
            store.setCurrentList(id);
        }
    }

    function handleEditList(event) {
        store.editCurrentList();
    }

    function handleCloseList(event) {
        store.closeCurrentList();
    }

    function handleToggleEdit(event) {
        event.stopPropagation();
        toggleEdit();
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsListNameEditActive();
        }
        setEditActive(newActive);
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        let _id = event.target.id;
        _id = ("" + _id).substring("delete-list-".length);
        store.markListForDeletion(id);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            let id = event.target.id.substring("list-".length);
            store.changeListName(id, text);
            toggleEdit();
        }
    }
    function handleUpdateText(event) {
        setText(event.target.value);
    }

    let selectClass = "unselected-list-card";
    if (selected) {
        selectClass = "selected-list-card";
    }
    let cardStatus = false;
    if (store.isListNameEditActive) {
        cardStatus = true;
    }
    let cardElement =
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{ marginTop: '15px', display: 'flex', p: 1 }}
            style={{ width: '100%', fontSize: '30pt' }}
            button
            onClick={(event) => {
                if (event.detail === 2) {
                    handleToggleEdit(event)
                }
            }}
        >
            <Box sx={{ p: 1, flexGrow: 1 }}>
                <ThumbUp sx = {{ color: 'black', position: "absolute", right: "40%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}></ThumbUp>
                <ThumbDown sx = {{ color: 'black', position: "absolute", right: "15%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}></ThumbDown>
                <Typography variant="h3">{idNamePair.name}</Typography>
                <Typography variant="h6">Published: {author}</Typography>
                <Typography variant="h6">Author: {idNamePair.username}</Typography>
                <Typography variant="h6" sx = {{position: "absolute", right: "50%", bottom: "10%"}}
                >Listens: {idNamePair.ratings.listens}</Typography>
                <ExpandMore sx = {{background: '#949494', color: 'black', position: "absolute", right: "1%", bottom: "5%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}
                    onClick={(event) => {
                        handleLoadList(event, idNamePair._id)
                    }}
                    ></ExpandMore>
            </Box>
        </ListItem>


    if(store.currentList && store.currentList._id == idNamePair._id && idNamePair.published == -1) {
        cardElement = 
        <div>
            <ListItem
                id={idNamePair._id}
                key={idNamePair._id}
                sx={{ marginTop: '15px', display: 'flex', p: 1 }}
                style={{ width: '100%', fontSize: '30pt', height: '50%' }}
                button>
                <Box sx={{ p: 1, flexGrow: 1 }}>
                    <Typography variant="h3">{idNamePair.name}</Typography>
                    <Typography variant="h6">Author: {idNamePair.username}</Typography>
                    <ExpandLess sx = {{background: '#949494', color: 'black', position: "absolute", right: "1%", bottom: "5%",
                        fontSize: "50px",
                        ':hover': {
                            color: 'white',
                        }}}
                        onClick={(event) => {
                            handleCloseList(event)
                        }}
                        ></ExpandLess>
                    
                    <Box>
                    <List 
                        id="playlist-cards" 
                        sx={{ width: '100%', bgcolor: 'background.paper' }}
                    >
                        {
                            store.currentList.songs.map((song, index) => (
                                <SongCard
                                    id={'playlist-song-' + (index)}
                                    key={'playlist-song-' + (index)}
                                    index={index}
                                    song={song}
                                />
                            ))  
                        }
                    </List>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: 'black', left: "30%", top: "15%", width: "17%",
                            ':hover': {
                                bgcolor: 'white',
                                color: 'black',
                            } }}
                        >
                            Edit
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: 'black', left: "35%", top: "15%", width: "17%",
                            ':hover': {
                                bgcolor: 'white',
                                color: 'black',
                            } }}
                        >
                            Delete
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: 'black', left: "40%", top: "15%", width: "17%",
                            ':hover': {
                                bgcolor: 'white',
                                color: 'black',
                            } }}
                        >
                            Duplicate
                        </Button>
                    </Box>
                </Box>
            </ListItem>
        </div>
    } else if(store.currentList && store.currentList._id == idNamePair._id && idNamePair.published != -1) {
        cardElement = 
        <div>
            <ListItem
                id={idNamePair._id}
                key={idNamePair._id}
                sx={{ marginTop: '15px', display: 'flex', p: 1 }}
                style={{ width: '100%', fontSize: '30pt', height: '50%' }}
                button>
                <Box sx={{ p: 1, flexGrow: 1 }}>
                    <ThumbUp sx = {{ color: 'black', position: "absolute", right: "40%",
                        fontSize: "50px",
                        ':hover': {
                            color: 'white',
                        }}}></ThumbUp>
                    <ThumbDown sx = {{ color: 'black', position: "absolute", right: "15%",
                        fontSize: "50px",
                        ':hover': {
                            color: 'white',
                        }}}></ThumbDown>
                    <Typography variant="h3">{idNamePair.name}</Typography>
                    <Typography variant="h6">Published: {idNamePair.author}</Typography>
                    <Typography variant="h6">Author: {idNamePair.username}</Typography>
                    <Typography variant="h6" sx = {{position: "absolute", right: "77%", bottom: "10%"}}
                    >Listens: {author}</Typography>
                    <ExpandLess sx = {{background: '#949494', color: 'black', position: "absolute", right: "1%", bottom: "5%",
                        fontSize: "50px",
                        ':hover': {
                            color: 'white',
                        }}}
                        onClick={(event) => {
                            handleCloseList(event)
                        }}
                        ></ExpandLess>
                    
                    <Box>
                    <List 
                        id="playlist-cards" 
                        sx={{ width: '100%', bgcolor: 'background.paper' }}
                    >
                        {
                            store.currentList.songs.map((song, index) => (
                                <SongCard
                                    id={'playlist-song-' + (index)}
                                    key={'playlist-song-' + (index)}
                                    index={index}
                                    song={song}
                                />
                            ))  
                        }
                    </List>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: 'black', left: "35%", top: "15%", width: "17%",
                            ':hover': {
                                bgcolor: 'white',
                                color: 'black',
                            } }}
                        >
                            Delete
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: 'black', left: "40%", top: "15%", width: "17%",
                            ':hover': {
                                bgcolor: 'white',
                                color: 'black',
                            } }}
                        >
                            Duplicate
                        </Button>
                    </Box>
                </Box>
            </ListItem>
        </div>

    } else if(idNamePair.published == -1) {
        cardElement = 
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{ marginTop: '15px', display: 'flex', p: 1 }}
            style={{ width: '100%', fontSize: '30pt' }}
            button
            onClick={(event) => {
                if (event.detail === 2) {
                    handleToggleEdit(event)
                }
            }}
        >
            <Box sx={{ p: 1, flexGrow: 1 }}>
                <Typography variant="h3">{idNamePair.name}</Typography>
                <Typography variant="h6">Author: {idNamePair.username}</Typography>
                <Typography variant="h6" sx = {{position: "absolute", right: "50%", bottom: "10%"}}></Typography>
                <ExpandMore sx = {{background: '#949494', color: 'black', position: "absolute", right: "1%", bottom: "5%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}
                    onClick={(event) => {
                        handleLoadList(event, idNamePair._id)
                    }}
                    ></ExpandMore>
            </Box>
        </ListItem>
    } else {
        cardElement = 
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{ marginTop: '15px', display: 'flex', p: 1 }}
            style={{ width: '100%', fontSize: '30pt' }}
            button
            onClick={(event) => {
                if (event.detail === 2) {
                    handleToggleEdit(event)
                }
            }}
        >
            <Box sx={{ p: 1, flexGrow: 1 }}>
                <ThumbUp sx = {{ color: 'black', position: "absolute", right: "40%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}></ThumbUp>
                <ThumbDown sx = {{ color: 'black', position: "absolute", right: "15%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}></ThumbDown>
                <Typography variant="h3">{idNamePair.name}</Typography>
                <Typography variant="h6">Published: {author}</Typography>
                <Typography variant="h6">Author: {idNamePair.username}</Typography>
                <Typography variant="h6" sx = {{position: "absolute", right: "50%", bottom: "10%"}}
                >Listens: {idNamePair.ratings.listens}</Typography>
                <ExpandMore sx = {{background: '#949494', color: 'black', position: "absolute", right: "1%", bottom: "5%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}
                    onClick={(event) => {
                        handleLoadList(event, idNamePair._id)
                    }}
                    ></ExpandMore>
            </Box>
        </ListItem>
    }

    if (editActive) {
        cardElement =
            <TextField
                margin="normal"
                required
                fullWidth
                id={"list-" + idNamePair._id}
                label="Playlist Name"
                name="name"
                autoComplete="Playlist Name"
                className='list-card'
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={idNamePair.name}
                inputProps={{style: {fontSize: 48}}}
                InputLabelProps={{style: {fontSize: 24}}}
                autoFocus
            />
    }
    return (
        cardElement
    );
}

export default ListCard;
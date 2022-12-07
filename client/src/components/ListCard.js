import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'

import { Box, ListItem, TextField, Typography } from '@mui/material'
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
                    console.log("test")
                    handleToggleEdit(event)
                }
                //handleLoadList(event, idNamePair._id)
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
                <Typography variant="h6">Author: {author}</Typography>
                <Typography variant="h6" sx = {{position: "absolute", right: "50%", bottom: "10%"}}
                >Listens: {author}</Typography>
                <ExpandMore sx = {{background: '#949494', color: 'black', position: "absolute", right: "1%", bottom: "5%",
                    fontSize: "50px",
                    ':hover': {
                        color: 'white',
                    }}}></ExpandMore>
            </Box>
        </ListItem>

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
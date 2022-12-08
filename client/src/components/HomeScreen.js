import React, { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import SongCard from './SongCard.js'
import Toolbar from './Toolbar'
import ListCard from './ListCard.js'
import MUIEditSongModal from './MUIEditSongModal.js'
import MUIRemoveSongModal from './MUIRemoveSongModal.js'
import MUIDeleteModal from './MUIDeleteModal'

import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab'
import List from '@mui/material/List';
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material';
/*
    This React component lists all the playlister lists in the UI.
    
    @author McKilla Gorilla
    @author Tanvirul Islam
*/
const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const [rand, setRand] = useState(0); // State used to force render

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    async function handleCreateNewList() {
        await store.createNewList();
        return () => setRand(value => value + 1);
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        let _id = event.target.id;
        _id = ("" + _id).substring("delete-list-".length);
        store.markListForDeletion(id);
    }

    function handleDuplicateList(event, id) {
    }

    let listCard = "";
    if (store) {
        listCard = 
            <List sx={{ width: '90%', left: '5%', bgcolor: 'background.paper' }}>
            {
                store.idNamePairs.map((pair) => (
                    <ListCard
                        key={pair._id}
                        idNamePair={pair}
                        selected={false}
                    />
                ))
            }
            </List>;
    }
    let modalJSX = "";
    if (store.isEditSongModalOpen()) {
        modalJSX = <MUIEditSongModal />;
    }
    else if (store.isRemoveSongModalOpen()) {
        modalJSX = <MUIRemoveSongModal />;
    } else if (store.isDeleteListModalOpen()) {
        modalJSX = <MUIDeleteModal />;
        console.log(store.listMarkedForDeletion)
    }

    if(store && store.editingList && store.currentList) {
        listCard = 
        store.currentList.songs.map((song, index) => (
            <SongCard
                id={'playlist-song-' + (index)}
                key={'playlist-song-' + (index)}
                index={index}
                song={song}
                type="song"
            />
        ))
        return (
            <div id="playlist-selector">
                <div id="list-selector-list">
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ bgcolor: 'black', width: "20%", top: '0%', position: 'absolute', right: '1%',
                        ':hover': {
                            bgcolor: 'white',
                            color: 'black',
                        } }}
                        onClick={(event) => {
                            handleDeleteList(event, store.currentList._id)
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ bgcolor: 'black', width: "20%", top: '0%', position: 'absolute', right: '25%',
                        ':hover': {
                            bgcolor: 'white',
                            color: 'black',
                        } }}
                        onClick={(event) => {
                            handleDuplicateList(event, store.currentList._id)
                        }}
                    >
                        Duplicate
                    </Button>
                    <Toolbar></Toolbar>
                    {
                        listCard
                    }
                    {modalJSX}
                </div>

                <div id="list-selector-footer">
                    <Typography variant="h2">Your Lists</Typography>
                </div>
            </div>)
    } else return (
        <div id="playlist-selector">
            <div id="list-selector-list">
                {
                    listCard
                }
            </div>
            <div id="list-selector-footer">
            <Fab 
                color="primary" 
                aria-label="add"
                id="add-list-button"
                onClick={handleCreateNewList}
                sx = {{background: 'white', color: 'black',
                ':hover': {
                    bgcolor: 'black',
                    color: 'white',
                } }}
            >
                <AddIcon />
            </Fab>
                <Typography variant="h2">Your Lists</Typography>
            </div>
            {modalJSX}
        </div>)
}

export default HomeScreen;
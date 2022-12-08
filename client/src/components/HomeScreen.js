import React, { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'

import ListCard from './ListCard.js'
import MUIDeleteModal from './MUIDeleteModal'

import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab'
import List from '@mui/material/List';
import Typography from '@mui/material/Typography'
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
    return (
        <div id="playlist-selector">
            <div id="list-selector-list">
                {
                    listCard
                }
                <MUIDeleteModal />
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
        </div>)
}

export default HomeScreen;
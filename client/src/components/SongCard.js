import React, { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'

import { Delete } from '@mui/icons-material';
import { Button } from '@mui/material'

function SongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const [ draggedTo, setDraggedTo ] = useState(0);
    const { song, index, type } = props;

    function handleDragStart(event) {
        event.dataTransfer.setData("song", index);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        let targetIndex = index;
        let sourceIndex = Number(event.dataTransfer.getData("song"));
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveSongTransaction(sourceIndex, targetIndex);
    }
    function handleRemoveSong(event) {
        event.preventDefault();
        console.log("rem")
        store.showRemoveSongModal(index, song);
    }
    function handleClick(event) {
        // DOUBLE CLICK IS FOR SONG EDITING
        if (event.detail === 2) {
            store.showEditSongModal(index, song);
        }
    }
    function handleAdd(event) {
        store.addNewSong()
    }

    let cardClass = "list-card unselected-list-card";
    return (
        <Button
            key={index}
            id={'song-' + index + '-card'}
            className={cardClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
            onClick={handleClick}
            sx={{ mt: 3, mb: 2, width: '95%', background: "gray", color: "black", left: "1.5%", fontSize: '20px',
            margin: '5px',
            ':hover': {
                bgcolor: 'white',
                color: 'black',
            } }}
        >{index + 1}. {song.title} by {song.artist}
        { store && store.editingList ? <div>
            <Delete
                type="button"
                id={"remove-song-" + index}
                onClick={handleRemoveSong}
                sx={{ color: 'black', position: 'absolute', right: "2%", fontSize: '40px', top: '5%',
                ':hover': {
                    color: 'black',
                } }}
            ></Delete>
            </div> : null}
        </Button>
    );
}

export default SongCard;
import React from 'react';
import YoutubePlayer from './YoutubePlayer'
import { Button } from '@mui/material';
import { SkipPrevious, Stop, PlayArrow, SkipNext } from '@mui/icons-material';

export default function Player () {
    let activePlaylist = "No Playlist Playing"
    let songPosition = "N/A"
    let songTitle = "No Song Playing"
    let songAuthor = "N/A"

    return <div class="youtube-player">
        <Button variant="contained" disableElevation sx={ {
            background: 'black',
            ':hover': {
                bgcolor: 'black',
                color: 'white',
            },
            "fontSize": "100%",
            maxWidth: '20vw', maxHeight: '3vw', minWidth: '20vw', minHeight: '3vw'
        }}>
            Player
        </Button>
        <Button variant="contained" disableElevation sx={ {
            background: '#949494',
            color: 'black',
            ':hover': {
                bgcolor: 'black',
                color: 'white',
            },
            "fontSize": "100%",
            maxWidth: '20vw', maxHeight: '3vw', minWidth: '20vw', minHeight: '3vw'
        }}>
            Comments
        </Button>
        <YoutubePlayer/>

        <div style={{"position": "absolute", left: "30%", fontSize: "45px"}}>
            Now Playing
        </div>

        <div class="youtube-player-info" style={{"whiteSpace": "pre-line"}}>
            {"\n"}
            Playing: {activePlaylist}{"\n"}
            Song #: {songPosition}{"\n"}
            Title: {songTitle}{"\n"}
            Author: {songAuthor}{"\n"}
        </div>
    </div>
}
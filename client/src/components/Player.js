import React from 'react';
import YoutubePlayer from './YoutubePlayer'
import { Button, Typography } from '@mui/material';
import { SkipPrevious, Stop, PlayArrow, SkipNext } from '@mui/icons-material';

export default function Player () {
    let activePlaylist = "No Playlist Playing"
    let songPosition = "N/A"
    let songTitle = "No Song Playing"
    let songAuthor = "N/A"

    return <div className="youtube-player">
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
        <div className="player-buttons">
            <SkipPrevious disableElevation sx={ {
                background: 'black',
                color: 'white',
                ':hover': {
                    bgcolor: 'black',
                    color: 'white',
                },
                "fontSize": "100%",
                minWidth: '6vw', minHeight: '3vw'
            }}>
            </SkipPrevious>
            <Stop disableElevation sx={ {
                background: 'black',
                color: 'white',
                ':hover': {
                    bgcolor: 'black',
                    color: 'white',
                },
                "fontSize": "100%",
                minWidth: '6vw', minHeight: '3vw'
            }}>
            </Stop>
            <PlayArrow disableElevation sx={ {
                background: 'black',
                color: 'white',
                ':hover': {
                    bgcolor: 'black',
                    color: 'white',
                },
                "fontSize": "100%",
                minWidth: '6vw', minHeight: '3vw'
            }}>
            </PlayArrow>
            <SkipNext disableElevation sx={ {
                background: 'black',
                color: 'white',
                ':hover': {
                    bgcolor: 'black',
                    color: 'white',
                },
                "fontSize": "100%",
                minWidth: '6vw', minHeight: '3vw'
            }}>
            </SkipNext>
        </div>

        <div style={{"position": "absolute", left: "35%", fontSize: "45px"}}>
            <Typography variant="h4">Now Playing{"\n"}</Typography>
        </div>

        <div className="youtube-player-info" style={{"whiteSpace": "pre-line", padding: "5px"}}>
            {"\n"}
            <Typography variant="h5">Playing: {activePlaylist}{"\n"}
            Song #: {songPosition}{"\n"}
            Title: {songTitle}{"\n"}
            Author: {songAuthor}{"\n"}</Typography>
        </div>
    </div>
}
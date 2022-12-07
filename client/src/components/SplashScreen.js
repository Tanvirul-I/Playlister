import logo from '../logo.png'; // with import
import { Button } from '@mui/material';
import { Link } from 'react-router-dom'
import Copyright from './Copyright'

export default function SplashScreen() {
    return (
        <div id="splash-screen">
            <img src={logo} />
            <div style={{"whiteSpace": "pre-line"}}>
                Welcome!{"\n"}
                Build and share playlists{"\n"}
                - Create public or private playlists{"\n"}
                - Like or dislike playlists from other users{"\n"}
                - Watch the YouTube video right here in the app{"\n"}
                - Comment and interact with other users{"\n"}
            </div>
            <div>
                <Button component={Link} to="/login" variant="contained" disableElevation sx={ {
                    background: '#474747',
                    ':hover': {
                        bgcolor: 'black',
                        color: 'white',
                    },
                    "fontSize": "100%",
                    maxWidth: '20vw', maxHeight: '3vw', minWidth: '1vw', minHeight: '3vw'
                }}>
                <Link to='/login/'></Link>
                Login
                </Button>
            </div>
            <div>
                <Button component={Link} to="/register" variant="contained" disableElevation sx={ {
                    background: '#474747',
                    ':hover': {
                        bgcolor: 'black',
                        color: 'white',
                    },
                    "fontSize": "100%",
                    maxWidth: '20vw', maxHeight: '3vw', minWidth: '1vw', minHeight: '3vw'
                }}
                >
                Register
                </Button>
            </div>
            <div>
                <Button variant="contained" disableElevation sx={ {
                    background: '#474747',
                    ':hover': {
                        bgcolor: 'black',
                        color: 'white',
                    },
                    "fontSize": "100%",
                    maxWidth: '20vw', maxHeight: '3vw', minWidth: '7vw', minHeight: '3vw'
                }}>
                Continue as Guest
                </Button>
            </div>
            <Copyright sx={{ mt: 5 }} />
        </div>
    )
}
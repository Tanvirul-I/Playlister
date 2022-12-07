import { useContext } from 'react'
import HomeScreen from './HomeScreen'
import EditToolbar from './EditToolbar'
import Player from './Player'
import SplashScreen from './SplashScreen'
import AuthContext from '../auth'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);

    console.log(auth.loggedIn)
    if (auth.loggedIn)
        return (<div style={{display: "flex", flexDirection: "row"}}>
            <EditToolbar /><HomeScreen /> <Player />
        </div>)
    else
        return <SplashScreen />
}
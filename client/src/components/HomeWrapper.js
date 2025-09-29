import { useContext } from "react";
import HomeScreen from "./HomeScreen";
import ListFilterBar from "./ListFilterBar";
import Player from "./Player";
import SplashScreen from "./SplashScreen";
import EditToolbar from "./EditToolbar";
import AuthContext from "../auth";
import { GlobalStoreContext } from "../store";

export default function HomeWrapper() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);

  const isEditing = !!(store && store.editingList);

  if (auth.loggedIn) {
    return (
      <div className="app-container">
        <div className="main-layout">
          <div className="list-column">
            {isEditing ? <EditToolbar /> : <ListFilterBar />}
            <HomeScreen />
          </div>
          <div className="player-column">
            <Player />
          </div>
        </div>
      </div>
    );
  }

  return <SplashScreen />;
}

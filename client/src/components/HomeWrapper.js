import { useContext } from 'react'
import HomeScreen from './HomeScreen'
import SplashScreen from './SplashScreen'
import AuthContext from '../auth'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);
    console.log("HomeWrapper auth.loggedIn: " + auth.loggedIn);
    console.log("HomeWrapper auth.isGuest: " + auth.isGuest);
    
    // Show home screen if logged in OR if guest
    if (auth.loggedIn || auth.isGuest) {
        return <HomeScreen />
    }
    
    // Otherwise show splash/welcome screen
    return <SplashScreen />
}

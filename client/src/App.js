import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import {
    AppBanner,
    EditAccountScreen,
    HomeWrapper,
    LoginScreen,
    RegisterScreen,
    SongsCatalogScreen,
    Statusbar,
    WorkspaceScreen
} from './components'

/*
    This is the entry-point for our application.
*/
const App = () => {   
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>              
                    <AppBanner />
                    <Switch>
                        <Route path="/" exact component={HomeWrapper} />
                        <Route path="/login/" exact component={LoginScreen} />
                        <Route path="/register/" exact component={RegisterScreen} />
                        <Route path="/edit-account/" exact component={EditAccountScreen} />
                        <Route path="/playlist/:id" exact component={WorkspaceScreen} />
                        <Route path="/songs" exact component={SongsCatalogScreen} />
                    </Switch>
                    <Statusbar />
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default App

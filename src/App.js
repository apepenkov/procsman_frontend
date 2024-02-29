import './App.css';
import {useEffect, useState} from 'react';
import Auth from './Authorization/auth';
import api from './api';
import Dashboard from './Dashboard/dashboard';
import Groups from './Groups/Groups';

function Loading() {
    return (
        <div
            className='gradient-background d-flex justify-content-center align-items-center'
            style={{height: '100vh'}}
        >
            <div className='spinner-border text-light' role='status'>
                <span className='sr-only'></span>
            </div>
        </div>
    );
}

function App() {
    const [view, setView] = useState('loading');

    useEffect(() => {
        api.checkAuth().then(function (loggedIn) {
            api.fetchDefaultConfiguration();
            console.log(`Logged in: ${loggedIn}`);
            if (loggedIn === true) {
                setView('dashboard');
            } else {
                setView('auth');
            }
        });
    }, []);

    return (
        <div>
            {view === 'loading' && <Loading/>}
            {view === 'auth' && <Auth switchView={setView}/>}
            {view === 'dashboard' && <Dashboard switchView={setView} view={view}/>}
            {view === 'groups' && <Groups switchView={setView} view={view}/>}
        </div>
    );
}

export default App;

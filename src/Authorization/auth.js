import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import api from '../api';
import './auth.css';
import {usePopup} from '../Popup';

function Auth({switchView}) {
    const {showPopup} = usePopup();

    const handleTokenEntry = () => {
        api.authToken = document.getElementById('login-password').value;
        api.checkAuth().then(function (loggedIn) {
            console.log(`Logged in: ${loggedIn}`);
            if (loggedIn === true) {
                switchView('dashboard');
            } else {
                document.getElementById('login-password').value = '';
                if (loggedIn !== null) {
                    showPopup(api.loc('invalid_auth_key'), api.loc('close'), 'danger');
                }
            }
        });
        api.save();
    };

    return (
        <div
            className='gradient-background d-flex justify-content-center align-items-center'
            style={{height: '100vh'}}
        >
            <Container
                className='p-md-3'
                style={{background: 'rgba(255, 255, 255, 0.6)', borderRadius: '10px'}}
            >
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Form.Label>{api.loc('enter_auth_key')}</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder={api.loc('auth_key')}
                        id={'login-password'}
                    />
                    <Button
                        variant='primary'
                        type='submit'
                        className='mt-3'
                        style={{float: 'right'}}
                        onClick={handleTokenEntry}
                        id={'login'}
                    >
                        Разблокировать
                    </Button>
                </Form>
            </Container>
        </div>
    );
}

export default Auth;

import Container from 'react-bootstrap/Container';
import NavBarHeader from '../navbar/navbar';

function Groups({switchView, view}) {
    return (
        <div>
            <NavBarHeader switchView={switchView} view={view}/>
            <Container
                className='p-md-3'
                style={{background: 'rgba(255, 255, 255, 0.6)', borderRadius: '10px'}}
            >
                <h3>Groups</h3>
                <p>List of groups</p>
            </Container>
        </div>
    );
}

export default Groups;

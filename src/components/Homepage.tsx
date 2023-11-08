// Styles
import { HomepageWrapperStyled } from './style';
import { ToastContainer } from 'react-toastify';

// Components
import Form from './Form/Form';

const Homepage = () => {
	return (
		<HomepageWrapperStyled>
			<ToastContainer />
			<Form />
		</HomepageWrapperStyled>
	);
};

export default Homepage;

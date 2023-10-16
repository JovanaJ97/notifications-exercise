import { useState } from 'react';

// Assets
import bell from '../assets/bell.svg';

// Styles
import {
	HeaderStyled,
	NotificationCountStyled,
	BellButtonStyled,
	CountSpanStyled,
} from './style';

// Context
import { useNotificationAPI } from '../context/notificationContext';

// Components
import Notifications from './Notifications';

const Header = () => {
	const { totalCount, totalUnseen, notificationsInfoQuery } =
		useNotificationAPI();
	const { isLoading } = notificationsInfoQuery;
	const [notificationsVisible, setNotificationsVisible] = useState(false);

	const handleNotificationsVisible = () => {
		setNotificationsVisible(!notificationsVisible);
	};

	return (
		<HeaderStyled>
			{!isLoading && totalCount ? (
				<NotificationCountStyled>{totalCount}</NotificationCountStyled>
			) : (
				<NotificationCountStyled>...</NotificationCountStyled>
			)}
			<BellButtonStyled onClick={handleNotificationsVisible}>
				<img src={bell} />
				{!isLoading && totalUnseen ? (
					<CountSpanStyled $count>{totalUnseen}</CountSpanStyled>
				) : (
					<CountSpanStyled>...</CountSpanStyled>
				)}
			</BellButtonStyled>
			{notificationsVisible && <Notifications />}
		</HeaderStyled>
	);
};

export default Header;

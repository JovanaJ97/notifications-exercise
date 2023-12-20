import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Interface
import { IContext, INotificationContext } from '../types/types';

// Requests
import { getNotifications } from '../requests/requests';

const NotificationContext = createContext({} as INotificationContext);

const notificationLimit = 10;

const NotificationContextProvider = ({ children }: IContext) => {
	const [page, setPage] = useState<number>(1);
	const [totalCount, setTotalCount] = useState<number | undefined>();
	const [totalUnseen, setTotalUnseen] = useState<number | undefined>();
	const [seenNotificationsIds, setSeenNotificationsIds] = useState<number[]>(
		[]
	);

	const notificationsInfoQuery = useQuery({
		queryKey: ['notifications'],
		queryFn: () => getNotifications(page, notificationLimit),
		enabled: true,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	// Setting total count and unseen notifications number
	useEffect(() => {
		setTotalCount(
			parseFloat(notificationsInfoQuery.data?.headers['x-total'])
		);
		setTotalUnseen(
			parseFloat(notificationsInfoQuery.data?.headers['x-unseen'])
		);
	}, [notificationsInfoQuery.data?.headers]);

	return (
		<NotificationContext.Provider
			value={{
				notificationsInfoQuery,
				totalCount,
				totalUnseen,
				setPage,
				page,
				setTotalUnseen,
				setTotalCount,
				seenNotificationsIds,
				setSeenNotificationsIds,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotificationAPI = () => {
	const context = useContext(NotificationContext);

	if (context === undefined) {
		throw new Error('Context must be used within a Provider');
	}

	return context;
};

export default NotificationContextProvider;

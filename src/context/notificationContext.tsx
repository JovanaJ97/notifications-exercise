import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// Interface
import { IContext, INotificationContext } from '../types/types';

const NotificationContext = createContext({} as INotificationContext);

const notificationLimit = 10;

const getNotificationsInfo = async (page: number, limit: number) => {
	const response = await axios
		.get(
			`http://localhost:3001/notifications?_page=${page}&_limit=${limit}`
		)
		.then((res) => {
			return res;
		});

	return response;
};

const NotificationContextProvider = ({ children }: IContext) => {
	const [page, setPage] = useState<number>(1);
	const [totalCount, setTotalCount] = useState<number | undefined>();
	const [totalUnseen, setTotalUnseen] = useState<number | undefined>();

	const notificationsInfoQuery = useQuery({
		queryKey: ['notifications'],
		queryFn: () => getNotificationsInfo(page, notificationLimit),
		enabled: true,
		staleTime: Infinity,
		gcTime: Infinity,
	});

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

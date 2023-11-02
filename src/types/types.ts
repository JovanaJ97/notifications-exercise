import { UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

export interface INotification {
	id: number;
	seen: boolean;
	body: string;
	createdAt: number | Date;
	user?: string;
	avatar?: string;
}

export interface IContext {
	children: JSX.Element | JSX.Element[] | React.ReactNode;
}

export interface INotificationContext {
	notificationsInfoQuery: UseQueryResult<
		void | AxiosResponse<object, object>,
		Error
	>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalCount: number | undefined;
	setTotalUnseen: React.Dispatch<React.SetStateAction<number | undefined>>;
	totalUnseen: number | undefined;
}

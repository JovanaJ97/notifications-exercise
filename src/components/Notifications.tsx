import { Fragment, useEffect, useState } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { parseLinkHeader } from '../utils/parseLinkHeader';

// Assets
import avatar from '../assets/avatar.svg';

// Context
import { useNotificationAPI } from '../context/notificationContext';

// Interface
import { INotification } from '../types/types';

// Components
import Notification from './Notification/Notification';

// Styles
import {
	NotificationsStyled,
	NotificationsUpperContent,
	CountSpanStyled,
	NotificationsBottomContent,
} from './style';
import { NotificationImage } from './Notification/style';

const notificationLimit = 10;

const getNotifications = async (page: number, limit: number) => {
	const response = await axios
		.get(
			`http://localhost:3001/notifications?_page=${page}&_limit=${limit}`
		)
		.then((res) => {
			return res;
		});

	return response;
};

const getUnreadNotifications = async () => {
	const response = await axios
		.get(`http://localhost:3001/notifications?seen=false`)
		.then((res) => {
			return res;
		});

	return response;
};

const Notifications = () => {
	const { page, notificationsInfoQuery, setPage, totalCount, totalUnseen } =
		useNotificationAPI();
	const { isLoading } = notificationsInfoQuery;
	const [allNotifications, setShowAllNotifications] =
		useState<boolean>(false);
	const [unreadNotifications, setShowUnreadNotifications] =
		useState<boolean>(false);

	const notificationsQuery = useInfiniteQuery({
		queryKey: ['notifications', page],
		queryFn: () => getNotifications(page, notificationLimit),
		enabled: true,
		staleTime: Infinity,
		gcTime: Infinity,
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const nextPage = parseLinkHeader(lastPage.headers['link']);

			if (nextPage) {
				return nextPage.next.url;
			} else {
				return undefined;
			}
		},
	});

	console.log(notificationsQuery);
	console.log(notificationsInfoQuery);

	const unreadNotificationsQuery = useInfiniteQuery({
		queryKey: ['unread-notifications'],
		queryFn: () => getUnreadNotifications(),
		enabled: true,
		staleTime: Infinity,
		gcTime: Infinity,
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.data;
		},
	});

	const { fetchNextPage, hasNextPage, data } = notificationsQuery;

	// console.log(unreadNotificationsQuery);

	const showAllNotifications = () => {
		setShowAllNotifications(true);
		setShowUnreadNotifications(false);
	};

	const showUnreadNotifications = () => {
		setShowUnreadNotifications(true);
		setShowAllNotifications(false);
	};

	const loadMore = () => {
		setPage((page) => page + 1);
		fetchNextPage();
	};

	// console.log(newPages, 'new pages');
	// console.log(newPage, 'NEW PAGE');
	// console.log(prevPage, 'prev page');

	return (
		<NotificationsStyled>
			{notificationsInfoQuery.data ? (
				<>
					<NotificationsUpperContent>
						<div className="left">
							<p>Inbox</p>
							{!isLoading && totalUnseen ? (
								<CountSpanStyled $count className="count">
									{totalUnseen}
								</CountSpanStyled>
							) : (
								<CountSpanStyled className="count">
									...
								</CountSpanStyled>
							)}
						</div>
						<button>Mark all as unread</button>
					</NotificationsUpperContent>
					<NotificationsBottomContent>
						<button onClick={showAllNotifications}>All</button>
						<button onClick={showUnreadNotifications}>
							Unread
						</button>
					</NotificationsBottomContent>
				</>
			) : null}
			{data?.pages.map((page) => (
				<>
					{page.data.map((notifications: INotification) => {
						const { id, body, createdAt, user } = notifications;

						const dateCreated = formatDistanceToNow(
							new Date(createdAt)
						);

						return (
							<Notification
								id={id}
								body={body}
								createdAt={`${dateCreated} ago`}
							>
								{user ? (
									<NotificationImage src={avatar} />
								) : null}
							</Notification>
						);
					})}
					<button onClick={loadMore}>load more</button>
				</>
			))}

			{unreadNotifications && (
				<>
					{unreadNotificationsQuery.data?.pages.map((page) => {
						return (
							<Fragment>
								{page.data.map(
									(unreadNotifications: INotification) => {
										const { id, body, createdAt, user } =
											unreadNotifications;

										const dateCreated = formatDistanceToNow(
											new Date(createdAt)
										);

										return (
											<Notification
												id={id}
												body={body}
												createdAt={`${dateCreated} ago`}
											>
												{user ? (
													<NotificationImage
														src={avatar}
													/>
												) : null}
											</Notification>
										);
									}
								)}
							</Fragment>
						);
					})}
				</>
			)}
		</NotificationsStyled>
	);
};

export default Notifications;

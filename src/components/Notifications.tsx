/* eslint-disable no-mixed-spaces-and-tabs */
import { useState } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import axios from 'axios';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
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

const getNotifications = async (
	page: string,
	limit: number,
	isItSeen: boolean
) => {
	const seenParam = isItSeen ? 'seen=false' : '';

	const response = await axios
		.get(
			`http://localhost:3001/notifications?_page=${page}&_limit=${limit}&_sort=createdAt&_order=desc&${seenParam}`
		)
		.then((res) => {
			console.log(res.data);
			return res;
		});

	return response;
};

const Notifications = () => {
	const { notificationsInfoQuery, totalUnseen } = useNotificationAPI();
	const { isLoading } = notificationsInfoQuery;
	const [unread, setUnread] = useState(false);
	const [isSeen, setIsSeen] = useState<boolean>(false);

	const notificationsQuery = useInfiniteQuery({
		queryKey: [
			'notifications-infinite',
			unread === true ? 'unread' : 'all',
		],
		queryFn: ({ pageParam }) =>
			getNotifications(pageParam, notificationLimit, unread),
		enabled: true,
		staleTime: Infinity,
		gcTime: Infinity,
		initialPageParam: '1',
		getNextPageParam: (lastPage) => {
			const nextPage = parseLinkHeader(lastPage.headers['link']);

			if (nextPage) {
				return nextPage.next._page;
			}
		},
	});

	const { fetchNextPage, hasNextPage, data } = notificationsQuery;

	const allNotificationsSeen = useMutation({
		mutationFn: (isSeen: boolean) =>
			axios
				.put(`http://localhost:3001/notifications`, {
					seen: isSeen,
				})
				.then((res) => {
					console.log(res.data);
					return res.data;
				}),
	});

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
						<button
							onClick={() => [
								setIsSeen(true),
								allNotificationsSeen.mutate(isSeen),
							]}
						>
							Mark all as unread
						</button>
					</NotificationsUpperContent>
					<NotificationsBottomContent>
						<button onClick={() => [setUnread(false)]}>All</button>
						<button onClick={() => [setUnread(true)]}>
							Unread
						</button>
					</NotificationsBottomContent>
				</>
			) : null}
			{data
				? data?.pages.map((page) => (
						<>
							{page.data.map((notifications: INotification) => {
								const { id, body, createdAt, user } =
									notifications;

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
						</>
				  ))
				: notificationsInfoQuery.data?.data.map(
						(notifications: INotification) => {
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
						}
				  )}
			{hasNextPage && (
				<button onClick={() => fetchNextPage()}>load more</button>
			)}

			{/* {unreadNotifications && (
				<>
					{unreadNotificationsQuery.data?.pages.map((page) => {
						return (
							<>
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
							</>
						);
					})}
				</>
			)} */}
		</NotificationsStyled>
	);
};

export default Notifications;

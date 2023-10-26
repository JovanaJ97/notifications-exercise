/* eslint-disable no-mixed-spaces-and-tabs */
import { useState } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import axios from 'axios';
import {
	queryOptions,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
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
	BlueDotBtn,
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
			return res;
		});

	return response;
};

const Notifications = () => {
	const { notificationsInfoQuery, totalUnseen } = useNotificationAPI();
	const { isLoading } = notificationsInfoQuery;
	const [unread, setUnread] = useState(false);
	const [isSeen, setIsSeen] = useState<boolean>(false);
	const [id, getId] = useState<undefined | number>();
	const queryClient = useQueryClient();

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
				return nextPage?.next?._page;
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
					return res.data;
				}),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ['unread'],
			}),
	});

	// console.log(allNotificationsSeen);

	// const markNotificationAsSeen = useMutation({
	// 	mutationFn: (isSeen: boolean) =>
	// 		axios.patch(`http://localhost:3001/notifications/${id}`, {
	// 			seen: isSeen,
	// 		}),
	// 	onSuccess: () =>
	// 		queryClient.invalidateQueries({
	// 			queryKey: ['all'],
	// 		}),
	// });

	// const log = queryClient.getQueryData(['notifications-infinite', 'all']);

	// if (log) {
	// 	console.log(
	// 		log.pages.flatMap((page) => {
	// 			return page.data;
	// 		})
	// 	);
	// }

	const markAsSeenMutation = useMutation({
		mutationFn: (isSeen: boolean) =>
			axios.patch(`http://localhost:3001/notifications/${id}`, {
				seen: isSeen,
			}),

		onMutate: async (isSeen: boolean) => {
			setIsSeen(true),
				await queryClient.cancelQueries({
					queryKey: ['notifications-infinite', 'all'],
				});

			const previousSeen = queryClient.getQueryData([
				'notifications-infinite',
				'all',
			]);

			if (previousSeen) {
				queryClient.setQueryData(['notifications-infinite', 'all'], {
					...previousSeen,
					newSeen: { seen: isSeen },
				});
			}

			return { previousSeen };
		},

		onError: (err, variables, context) => {
			if (context?.previousSeen) {
				queryClient.setQueryData(
					['notifications-infinite', 'all'],
					context.previousSeen
				);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ['notifications-infinite', 'all'],
			});
		},
	});

	console.log(markAsSeenMutation);

	// console.log(totalUnseen);
	console.log(isSeen);
	// console.log(unread);
	// console.log(totalUnseen);
	// console.log(notificationsInfoQuery.data);

	//console.log(id);
	// console.log(isSeen);

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
							) : totalUnseen === 0 ? null : (
								<CountSpanStyled className="count">
									...
								</CountSpanStyled>
							)}
						</div>
						{unread && (
							<button
								onClick={() => [
									setIsSeen(true),
									allNotificationsSeen.mutate(isSeen),
								]}
							>
								Mark all as unread
							</button>
						)}
					</NotificationsUpperContent>
					<NotificationsBottomContent>
						<button onClick={() => setUnread(false)}>All</button>
						<button onClick={() => setUnread(true)}>Unread</button>
					</NotificationsBottomContent>
				</>
			) : null}
			{data
				? data?.pages.map((page) => (
						<>
							{page.data.map((notifications: INotification) => {
								const { id, body, createdAt, user, seen } =
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
										{seen === false && (
											<BlueDotBtn
												onClick={() => [
													getId(id),
													setIsSeen(true),
													markAsSeenMutation.mutate(
														isSeen
													),
												]}
											/>
										)}
									</Notification>
								);
							})}
						</>
				  ))
				: notificationsInfoQuery.data?.data.map(
						(notifications: INotification) => {
							const { id, body, createdAt, user, seen } =
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
									{seen === false && (
										<BlueDotBtn
											onClick={() => [
												getId(id),
												setIsSeen(true),
												markAsSeenMutation.mutate(
													isSeen
												),
											]}
										/>
									)}
								</Notification>
							);
						}
				  )}
			{hasNextPage && (
				<button onClick={() => fetchNextPage()}>load more</button>
			)}
		</NotificationsStyled>
	);
};

export default Notifications;

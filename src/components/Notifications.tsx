/* eslint-disable no-mixed-spaces-and-tabs */
import { Fragment, useEffect, useState } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import axios from 'axios';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { parseLinkHeader } from '../utils/parseLinkHeader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
	const seenParam = isItSeen ? '&seen=false' : '';

	const response = await axios
		.get(
			`http://localhost:3001/notifications?_page=${page}&_limit=${limit}&_sort=createdAt&_order=desc${seenParam}`
		)
		.then((res) => {
			return res;
		});
	return response;
};

const Notifications = () => {
	const { notificationsInfoQuery, totalUnseen, setTotalUnseen, ids, setIds } =
		useNotificationAPI();
	const { isLoading } = notificationsInfoQuery;
	const [unread, setUnread] = useState(false);
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
		placeholderData: keepPreviousData,
		initialPageParam: '1',
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		getNextPageParam: (lastPage) => {
			const nextPage = parseLinkHeader(lastPage.headers['link']);

			if (nextPage) {
				return nextPage?.next?._page;
			}
		},
	});

	const {
		fetchNextPage,
		hasNextPage,
		data,
		isFetching,
		isFetchingNextPage,
		isFetched,
	} = notificationsQuery;

	const allNotificationsSeen = useMutation({
		mutationFn: (isSeen: boolean) =>
			axios
				.put(`http://localhost:3001/notifications`, isSeen)
				.then((res) => {
					return res.data;
				})
				.catch((err) => {
					console.log(err);
				}),
		onError() {
			toast(`All notifications marked as read error`);
		},
		onSuccess: async () => {
			queryClient.clear();
			toast(`All notifications marked as read`);
		},
	});

	const markAsSeenMutation = useMutation({
		mutationFn: (id: number) =>
			axios.patch(`http://localhost:3001/notifications/${id}`),
		onMutate(variables) {
			setIds([...ids, variables]);
		},

		onError: (err, variables) => {
			if (err) {
				const updatedIds = ids.filter((id) => {
					return id !== variables;
				});
				setIds([...updatedIds]);
			}

			toast(`Notification ${variables} marked as read error`);
		},

		onSuccess(data, variables) {
			// Prevent active queries from refetching on success
			queryClient.invalidateQueries({
				queryKey: ['notifications-infinite'],
				refetchType: 'none',
			});

			toast(`Notification ${variables} marked as read`);
		},
	});

	useEffect(() => {
		if (notificationsQuery !== undefined) {
			data?.pages.flatMap((page) => {
				setTotalUnseen(parseFloat(page.headers['x-unseen']));
				return;
			});
		}
	}, [data?.pages, notificationsQuery, setTotalUnseen]);

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
						{totalUnseen !== 0 ? (
							<button
								onClick={() => [
									allNotificationsSeen.mutate(true),
									allNotificationsSeen.reset(),
								]}
							>
								Mark all as read
							</button>
						) : null}
					</NotificationsUpperContent>
					<NotificationsBottomContent>
						<button onClick={() => setUnread(false)}>All</button>
						<button onClick={() => setUnread(true)}>Unread</button>
					</NotificationsBottomContent>
				</>
			) : null}
			{data && isFetched ? (
				data?.pages.map((page) => {
					return (
						<Fragment key={page.headers.link}>
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
										key={id}
									>
										{user ? (
											<NotificationImage src={avatar} />
										) : null}

										{seen == false && !ids.includes(id) ? (
											<BlueDotBtn
												onClick={() =>
													markAsSeenMutation.mutate(
														id
													)
												}
											/>
										) : null}
									</Notification>
								);
							})}
						</Fragment>
					);
				})
			) : isFetching ? (
				<div>loading</div>
			) : (
				notificationsInfoQuery.data?.data.map(
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
								key={id}
							>
								{user ? (
									<NotificationImage src={avatar} />
								) : null}
								{seen === false && !ids.includes(id) ? (
									<BlueDotBtn
										onClick={() =>
											markAsSeenMutation.mutate(id)
										}
									/>
								) : null}
							</Notification>
						);
					}
				)
			)}
			{hasNextPage && (
				<>
					{isFetchingNextPage ? (
						<div>...</div>
					) : (
						<button
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
						>
							load more
						</button>
					)}
				</>
			)}
		</NotificationsStyled>
	);
};

export default Notifications;

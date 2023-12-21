/* eslint-disable no-mixed-spaces-and-tabs */
import { Fragment, useEffect, useState } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
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

// Requests
import {
	getNotifications,
	markAllNotificationsAsSeen,
	markSingleNotificationAsSeen,
} from '../requests/requests';

// Styles
import {
	NotificationsStyled,
	NotificationsUpperContent,
	CountSpanStyled,
	NotificationsBottomContent,
	BlueDotBtn,
	NotificationsButton,
	LoadMoreBtn,
	Loading,
} from './style';
import { NotificationImage } from './Notification/style';

const notificationLimit = 10;

const Notifications = () => {
	const {
		notificationsInfoQuery,
		totalUnseen,
		setTotalUnseen,
		seenNotificationsIds,
		setSeenNotificationsIds,
		setTotalCount,
	} = useNotificationAPI();
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
		isError,
	} = notificationsQuery;

	const allNotificationsSeen = useMutation({
		mutationFn: (isSeen: boolean) => markAllNotificationsAsSeen(isSeen),
		onError() {
			toast(`All notifications marked as read error`);
		},
		onSuccess: async () => {
			queryClient.clear();
			toast(`All notifications marked as read`);
		},
	});

	const markAsSeenMutation = useMutation({
		mutationFn: (id: number) => markSingleNotificationAsSeen(id),
		onMutate(variables) {
			setSeenNotificationsIds([...seenNotificationsIds, variables]);
		},

		onError: (err, variables) => {
			if (err) {
				const updatedIds = seenNotificationsIds.filter((id) => {
					return id !== variables;
				});
				setSeenNotificationsIds([...updatedIds]);
			}

			toast(`Notification ${variables} marked as read error`);
		},

		onSuccess(data, variables) {
			setTotalUnseen((prevSeen) => {
				if (prevSeen !== undefined) {
					return prevSeen - 1;
				}
			});

			toast(`Notification ${variables} marked as read`);
		},
	});

	useEffect(() => {
		if (
			notificationsQuery !== undefined &&
			notificationsInfoQuery.isLoading
		) {
			setTotalUnseen(parseFloat(data?.pages[0].headers['x-unseen']));
			setTotalCount(parseFloat(data?.pages[0].headers['x-total']));
		}

		if (isError) {
			toast('Loading notifications failed');
		}
	}, [
		data?.pages,
		notificationsQuery,
		setTotalCount,
		setTotalUnseen,
		notificationsInfoQuery,
		isError,
	]);

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
						<NotificationsButton
							onClick={() => setUnread(false)}
							className={`${!unread ? 'active-btn' : ''}`}
						>
							All
						</NotificationsButton>
						<NotificationsButton
							onClick={() => setUnread(true)}
							className={`${unread ? 'active-btn' : ''}`}
						>
							Unread
						</NotificationsButton>
					</NotificationsBottomContent>
				</>
			) : null}
			{notificationsQuery.isStale && !notificationsQuery.isLoading && (
				<LoadMoreBtn onClick={() => notificationsQuery.refetch()}>
					you have new notifications
				</LoadMoreBtn>
			)}

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

										{seen == false &&
										!seenNotificationsIds.includes(id) ? (
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
				<Loading>loading</Loading>
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
								{seen === false &&
								!seenNotificationsIds.includes(id) ? (
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
						<Loading>...</Loading>
					) : (
						<LoadMoreBtn
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
						>
							load more
						</LoadMoreBtn>
					)}
				</>
			)}
		</NotificationsStyled>
	);
};

export default Notifications;

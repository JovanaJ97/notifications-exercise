/* eslint-disable no-mixed-spaces-and-tabs */
import { useEffect, useState } from 'react';
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
		placeholderData: keepPreviousData,
		initialPageParam: '1',
		refetchOnMount: true,
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
				.put(`http://localhost:3001/notifications`, isSeen)
				.then((res) => {
					return res.data;
				}),

		onError(error, variables, context) {
			console.log(error);
			toast(`All notifications marked as read error`);
		},
		onSettled: () => {
			toast(`All notifications marked as read`);
		},
		onSuccess: () =>
			queryClient.resetQueries({
				queryKey: ['notifications-infinite', 'all'],
				exact: true,
			}),
	});

	// console.log(allNotificationsSeen);
	console.log(notificationsQuery.status);

	const markAsSeenMutation = useMutation({
		mutationFn: () =>
			axios.patch(`http://localhost:3001/notifications/${id}`),

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

			toast(`Notification ${id} marked as read error`);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['notifications-infinite', 'all'],
			});
			toast(`Notification ${id} marked as read`);
		},
	});

	// console.log(markAsSeenMutation);

	// console.log(totalUnseen);
	console.log(isSeen);
	// console.log(unread);
	// console.log(totalUnseen);
	// console.log(notificationsInfoQuery.data);

	//console.log(id);
	// console.log(isSeen);

	useEffect(() => {
		if (notificationsQuery.status === 'success') {
			setIsSeen(true);
			console.log('success');
		}
	}, [notificationsQuery.status]);

	return (
		<>
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
										setIsSeen(true),
										allNotificationsSeen.mutate(isSeen),
									]}
								>
									Mark all as unread
								</button>
							) : null}
						</NotificationsUpperContent>
						<NotificationsBottomContent>
							<button onClick={() => setUnread(false)}>
								All
							</button>
							<button onClick={() => setUnread(true)}>
								Unread
							</button>
						</NotificationsBottomContent>
					</>
				) : null}
				{data
					? data?.pages.map((page) => (
							<>
								{page.data.map(
									(notifications: INotification) => {
										const {
											id,
											body,
											createdAt,
											user,
											seen,
										} = notifications;

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
												{seen === false && (
													<BlueDotBtn
														onClick={() => [
															getId(id),
															// setIsSeen(true),
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
													//setIsSeen(true),
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
		</>
	);
};

export default Notifications;

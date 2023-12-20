import axios from 'axios';

// Interface
import { IFormData } from '../types/types';

// Function for getting all and unread notification, total and unread count
export const getNotifications = async (
	page: string | number,
	limit: number,
	isItSeen?: boolean
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

export const markAllNotificationsAsSeen = async (isSeen: boolean) => {
	const response = await axios
		.put(`http://localhost:3001/notifications`, isSeen)
		.then((res) => {
			return res.data;
		})
		.catch((err) => {
			console.log(err);
		});

	return response;
};

export const markSingleNotificationAsSeen = async (id: number) => {
	const response = await axios
		.patch(`http://localhost:3001/notifications/${id}`)
		.then((res) => {
			return res.data;
		})
		.catch((err) => {
			console.log(err);
		});

	return response;
};

export const sendNewNotification = async (newNotification: IFormData) => {
	const response = await axios
		.post(`http://localhost:3001/notifications`, newNotification)
		.then((res) => {
			return res.data;
		})
		.catch((err) => {
			console.log(err);
		});

	return response;
};

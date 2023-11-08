import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

// Interface
interface IFormData {
	body: string;
	user?: string;
}

// Context
import { useNotificationAPI } from '../../context/notificationContext';

// Styles
import { FormWrapperStyled, SendBtnStyled } from './style';

const Form = () => {
	const [user, setUser] = useState('');
	const [message, setMessage] = useState('');
	const queryClient = useQueryClient();
	const { setTotalCount, setTotalUnseen } = useNotificationAPI();

	const sendNotification = useMutation({
		mutationFn: (newNotification: IFormData) =>
			axios
				.post(`http://localhost:3001/notifications`, newNotification)
				.then((res) => {
					return res.data;
				})
				.catch((err) => {
					console.log(err);
				}),

		onSuccess() {
			// Prevent active queries from refetching on success
			queryClient.invalidateQueries({
				queryKey: ['notifications-infinite'],
				refetchType: 'none',
			});

			setTotalCount((prevCount) => {
				if (prevCount !== undefined) {
					return prevCount + 1;
				}
			});
			setTotalUnseen((prevSeen) => {
				if (prevSeen !== undefined) {
					return prevSeen + 1;
				}
			});
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setUser('');
		setMessage('');
	};

	return (
		<FormWrapperStyled>
			<form onSubmit={handleSubmit}>
				<label htmlFor="user">User name</label>
				<input
					type="text"
					value={user}
					name="user"
					onChange={(e) => setUser(e.target.value)}
				/>
				<label htmlFor="body">Message *</label>
				<textarea
					required
					value={message}
					name="message"
					onChange={(e) => setMessage(e.target.value)}
				/>
				<SendBtnStyled
					type="submit"
					onClick={() =>
						sendNotification.mutate({ user: user, body: message })
					}
					disabled={message.length === 0}
				>
					Send notification
				</SendBtnStyled>
			</form>
		</FormWrapperStyled>
	);
};

export default Form;

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

// Interface
interface IFormData {
	body: string;
	user?: string;
}

// Styles
import { FormWrapperStyled, SendBtnStyled } from './style';

const Form = () => {
	const [user, setUser] = useState('');
	const [message, setMessage] = useState('');
	const queryClient = useQueryClient();

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
		},
	});

	return (
		<FormWrapperStyled>
			<form onSubmit={(e) => e.preventDefault()}>
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

// Styles
import { NotificationStyled } from './style';

// Interface
interface INotify {
	children?: JSX.Element | JSX.Element[] | React.ReactNode;
	id: number;
	body: string;
	createdAt: string;
}

const Notification = ({ body, createdAt, children }: INotify) => {
	return (
		<NotificationStyled>
			{children}
			<div>
				<p>{body}</p>
				<p>{createdAt}</p>
			</div>
		</NotificationStyled>
	);
};

export default Notification;

import styled from 'styled-components';
import { colors } from '../../styles/variables';

export const NotificationStyled = styled.div`
	display: flex;
	padding: 16px;
	padding-left: 24px;
	border-bottom: 1px solid ${colors.notificationBorder};
	position: relative;
`;

export const NotificationImage = styled.img`
	width: 34px;
	height: 34px;
	margin-right: 12px;
`;

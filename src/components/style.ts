import styled from 'styled-components';
import { colors } from '../styles/variables';

export const HeaderStyled = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background-color: ${colors.whiteSmoke};
	padding: 16px 28px;
`;

export const HomepageWrapperStyled = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: calc(100% - 78px);
	padding: 20px;
`;

export const NotificationCountStyled = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 11px 27px;
	border: 2px solid ${colors.slateGray};
	border-radius: 10px;
	background-color: ${colors.darkerWhite};

	p {
		color: ${colors.slateGray};
	}
`;

export const NotificationsStyled = styled.div`
	width: 100%;
	max-width: 400px;
	max-height: 894px;
	border-radius: 8px;
	position: absolute;
	top: 72px;
	right: 0;
	z-index: 99;
	background-color: ${colors.white};
	overflow-y: scroll;
	box-shadow: 0px 0px 0px 0px #0000000f, 0px 3px 6px 0px #0000000f,
		0px 10px 10px 0px #0000000d, 0px 23px 14px 0px #00000008,
		0px 41px 17px 0px #00000003;
`;

export const BellButtonStyled = styled.button`
	position: relative;
	padding: 0;
`;

export const CountSpanStyled = styled.span<{ $count?: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	line-height: 14px;
	font-weight: 500;
	position: absolute;
	top: -6px;
	right: -6px;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	color: ${colors.white};
	background-color: ${(props) =>
		props.$count ? `${colors.azure}` : `${colors.slateGray} `};
`;

export const NotificationsUpperContent = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 16px 24px;

	.count {
		position: relative;
		inset: unset;
	}

	.left {
		display: flex;
	}
`;

export const NotificationsButton = styled.button`
	position: relative;

	&::before {
		content: '';
		width: 100%;
		height: 1px;
		position: absolute;
		bottom: 0;
		left: 0;
		background-color: ${colors.black};
		opacity: 0;
		visibility: hidden;
	}

	&.active-btn {
		&::before {
			opacity: 1;
			visibility: visible;
		}
	}
`;

export const NotificationsBottomContent = styled.div`
	display: flex;
	justify-content: flex-start;
	padding: 16px 24px;
`;

export const BlueDotBtn = styled.button`
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background-color: ${colors.azure};
	cursor: pointer;
	position: absolute;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
`;

export const LoadMoreBtn = styled.button`
	width: 100%;
	padding: 5px 10px;
	margin: 0 auto;
	transition: opacity 0.25s ease;

	&:hover {
		opacity: 0.7;
	}
`;

export const Loading = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	padding: 5px 10px;
`;

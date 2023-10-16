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
	width: 100%;
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

export const NotificationsBottomContent = styled.div`
	display: flex;
	justify-content: flex-start;
	padding: 16px 24px;
`;

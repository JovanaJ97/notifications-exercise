import styled from 'styled-components';
import { colors } from '../../styles/variables';

export const FormWrapperStyled = styled.div`
	width: 100%;
	max-width: 434px;
	border-radius: 24px;
	background-color: ${colors.whiteSmoke};
	padding: 81px 57px 39px;

	form {
		display: flex;
		flex-direction: column;

		label {
			font-size: 16px;
			line-height: 19px;
			margin-bottom: 8px;
			color: ${colors.labelColor};
		}

		input,
		textarea {
			border: 1px solid ${colors.inputBorder};
			border-radius: 8px;
			box-shadow: 1px 1px 5px 0px #0000000d;

			&:first-of-type {
				margin-bottom: 24px;
			}
		}

		input {
			min-height: 41px;
		}

		textarea {
			min-height: 111px;
		}
	}
`;

export const SendBtnStyled = styled.button`
	max-width: 100%;
	margin: 0 auto;
	padding: 11px 24px;
	margin-top: 70px;
	font-size: 14px;
	line-height: 24px;
	font-weight: 500;
	border-radius: 30px;
	color: ${colors.white};
	background-color: ${colors.azure};

	&:disabled {
		opacity: 0.6;
	}
`;

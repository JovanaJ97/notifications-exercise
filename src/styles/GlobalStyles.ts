import { createGlobalStyle } from 'styled-components';
import { colors } from './variables';

export default createGlobalStyle`
    * {
        box-sizing: border-box;
    }

    body {
        font-family: 'Inter', sans-serif;
        background-color: ${colors.white};
        margin: 0;
    }
    
    html,
    body {
        height: 100%;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
        margin: 0;
    }

    p {
        font-size: 16px;
        line-height: 19px;
    }

    a {
        text-decoration: none;
        cursor: pointer;
    }

    button {
        font-family: inherit;
        border: none;
        background: transparent;
        cursor: pointer;
    }
`;

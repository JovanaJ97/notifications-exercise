import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    * {
        box-sizing: border-box;
    }

    body {
        font-family: 'Inter', sans-serif;
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

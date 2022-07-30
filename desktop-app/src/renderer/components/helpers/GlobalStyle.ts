import { createGlobalStyle } from 'styled-components';
import IosevkaFont from '@assets/fonts/iosevka/iosevka-fixed-regular.woff2';
import MontserratFont from '@assets/fonts/montserrat/Montserrat-SemiBold.ttf';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Iosevka';
    font-style: normal;
    font-weight: normal;
    src: local('Iosevka'), url(${IosevkaFont}) format('woff2');
  }
  @font-face {
    font-family: 'Montserrat';
    font-style: normal;
    font-weight: normal;
    src: local('Montserrat'), url(${MontserratFont}) format('truetype');
  }

  html, body, #app {
    height: 100%;
    margin: 0;
  }

  *::-webkit-scrollbar {
    width: 20px;
  }
  *::-webkit-scrollbar-track {
    background-color: #f5f5f5;
    border-radius: 100px;
  }
  *::-webkit-scrollbar-thumb {
    border-radius: 100px;
    border: 5px solid transparent;
    background-clip: content-box;
    background-color: #1976d2;
  }
`;

export default GlobalStyle;

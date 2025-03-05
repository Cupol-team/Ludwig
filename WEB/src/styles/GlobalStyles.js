import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Сброс отступов, padding и box-sizing для всех элементов */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  /* Гарантируем, что html, body и корневой контейнер занимают всю ширину и высоту */
  html, body, #root {
    height: 100%;
    width: 100%;
  }
  /* Настройка базового оформления body */
  body {
    display: block; 
    font-family: Arial, sans-serif;
    background-color: #121212;
    /* Убираем нежелательную центровку, если таковая могла быть применена глобально */
  }
`;

export default GlobalStyle; 
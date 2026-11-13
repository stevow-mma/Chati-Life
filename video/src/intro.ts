import {createContext, useContext} from 'react';

/** true pendant le tout premier plan d'un épisode : pas d'animation d'entrée, l'action est déjà là. */
export const PremiereImage = createContext(false);
export const usePremiereImage = () => useContext(PremiereImage);

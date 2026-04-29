import { User } from '../api/types';

export const setUserState = (payload: User) => {
    return { type: 'SET_USER_STATE', payload };
};

export const clearUserState = () => {
    return { type: 'CLEAR_USER_STATE' };
};

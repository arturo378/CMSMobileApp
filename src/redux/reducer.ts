import { User } from '../api/types';

interface UserState {
    id?: string;
    username?: string;
    email?: string;
    role?: string;
    fullname?: string;
    name?: string;
}

interface AppState {
    user: UserState;
}

const defaultState: AppState = {
    user: {}
};

export default function reducer(
    state: AppState = defaultState,
    { type, payload }: { type: string; payload?: any }
): AppState {
    switch (type) {
        case 'SET_USER_STATE': {
            const user = payload as User;
            return {
                ...state,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullname: user.fullname,
                    name: user.name,
                }
            };
        }
        case 'CLEAR_USER_STATE':
            return { ...state, user: {} };
    }

    return state;
}

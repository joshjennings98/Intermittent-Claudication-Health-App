import firebase from 'firebase';
import { 
    EMAIL_CHANGED,
    PASSWORD_CHANGED,
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAIL,
    LOGIN_USER,
    CREATE_USER,
} from './types';

export const emailChanged = (text) => { 
    console.log(text)
    return { 
        type: EMAIL_CHANGED,
        payload: text
    };
};

export const passwordChanged = (text) => { 
    return { 
        type: PASSWORD_CHANGED,
        payload: text
    };
};  

export const loginUser = ({ email, password }) => {    
    return (dispatch) => {
        dispatch({ type: LOGIN_USER });

        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => loginUserSuccess(dispatch, user))
        .catch(() => {

            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(user => loginUserSuccess(dispatch, user))
                .catch(() => loginUserFail(dispatch));
        });
    };
};

const loginUserFail = (dispatch) => {
    console.log('fail')
    dispatch({type: LOGIN_USER_FAIL})
};

const loginUserSuccess = (dispatch, user) => {
    dispatch({
        type: LOGIN_USER_SUCCESS,
        payload: user
    }); 
    console.log('success')
};

  
export const createUser = ({email, password}) => { 
    return(dispatch)=>{
        dispatch({ type: CREATE_USER });
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(user => loginUserSuccess(dispatch, user))
            .catch(() => loginUserFail(dispatch));
    }
}

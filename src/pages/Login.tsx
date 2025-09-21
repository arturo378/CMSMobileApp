import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonLoading } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { loginUser } from '../firebaseConfig';
import { toast } from '../toast';
import { setUserState } from '../redux/actions';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom'

const Login: React.FC = () => {
    const [busy, setBusy] = useState<boolean>(false)
    const dispatch = useDispatch()
    const history = useHistory()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    async function login(){

       setBusy(true)
        const res: any = await loginUser(username, password)
        
        if(res) {
            console.log(res)
            
                dispatch(setUserState((res.user).email))
                history.replace('/dashboard')
                toast('You have logged in!')
            
            

        }setBusy(false)
    }


  




  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="login-title">Welcome Back</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonLoading message="Please wait.." duration={0} isOpen={busy}></IonLoading>
      <IonContent fullscreen className="login-content">
        <div className="login-wrapper">
          <div className="login-card">
          <div className="login-avatar">
            <img src="/assets/icon/icon.png" alt="App Icon" />
          </div>
          <h2 className="login-heading">Sign in to your account</h2>
          <IonInput
            className="login-input"
            placeholder="Email"
            type="email"
            value={username}
            onIonChange={(e: any) => setUsername(e.target.value)}
            clearInput
            debounce={300}
            required
          />
          <IonInput
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onIonChange={(e: any) => setPassword(e.target.value)}
            clearInput
            debounce={300}
            required
          />
          <IonButton expand="block" shape="round" size="large" className="login-btn" onClick={login}>
            Login
          </IonButton>
            <div className="login-links">
              <span>Don't have an account? <Link to="/register">Register</Link></span>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

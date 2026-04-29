import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonLoading } from '@ionic/react';
import React, { useState } from 'react';
import './Home.css';
import { login as loginUser } from '../api/auth';
import { toast } from '../toast';
import { setUserState } from '../redux/actions';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom'

const Login: React.FC = () => {
    const [busy, setBusy] = useState<boolean>(false)
    const dispatch = useDispatch()
    const history = useHistory()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    async function login(){
       setBusy(true)
       try {
           const res = await loginUser(username, password)
           dispatch(setUserState(res.user))
           history.replace('/dashboard')
           toast('You have logged in!')
       } catch (err) {
           toast((err && (err as any).message) || 'Login failed')
       } finally {
           setBusy(false)
       }
    }


  




  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login Page</IonTitle>
        </IonToolbar>
      </IonHeader>
     <IonLoading message="Please wait.." duration={0} isOpen={busy}></IonLoading>
      <IonContent className="ion-padding">
          <IonInput
            fill="outline"
            label="Username"
            labelPlacement="floating"
            value={username}
            onIonInput={(e) => setUsername(e.detail.value ?? '')}
          />
          <IonInput
            fill="outline"
            label="Password"
            labelPlacement="floating"
            type="password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value ?? '')}
            className="ion-margin-top"
          />
          <IonButton expand="block" className="ion-margin-top" onClick={login}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;

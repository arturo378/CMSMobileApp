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
          <IonInput placeholder="Username:" onIonChange={(e: any) => setUsername(e.target.value)} />
          <IonInput type="password" placeholder="Password:" onIonChange={(e: any) => setPassword(e.target.value)} />
          <IonButton onClick={login}>Login</IonButton>
        
      </IonContent>
    </IonPage>
  );
};

export default Login;

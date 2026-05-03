import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonLoading, IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { flaskOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import './Login.css';
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
          <IonTitle>CMS Logistics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonLoading message="Please wait.." duration={0} isOpen={busy}></IonLoading>
      <IonContent className="ion-padding">
        <div className="login-brand-block">
          <IonIcon icon={flaskOutline} />
          <h2>Chemical Management</h2>
          <p>Sign in to continue</p>
        </div>
        <IonCard className="form-card">
          <IonCardContent>
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
            <IonButton expand="block" color="secondary" className="ion-margin-top submit-btn" onClick={login}>Sign In</IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Login;

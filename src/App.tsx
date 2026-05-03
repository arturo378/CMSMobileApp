import React, {useEffect, useState} from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSpinner, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/app.css';

setupIonicReact();
import { me } from './api/auth'
import { getAccessToken, clearTokens } from './storage/tokens'
import Dashboard from './pages/Dashboard';
import { useDispatch } from 'react-redux';
import { setUserState } from './redux/actions'
import ShippingPapers from './pages/ShippingPapers';
import CloseShippingPaper from './pages/CloseShpping';
import Delivery from './pages/Delivery';

 
const RoutingSystem: React.FC = () =>{
  return(
    <IonReactRouter>
      <IonRouterOutlet>
      {/* <Route exact path="/" component= {Home} /> */}
      {/* <Route path="/home" component={Home} exact={true} /> */}
      <Route path="/login" component = {Login} exact/>
      <Route path="/dashboard" component = {Dashboard} exact/>
      <Route path="/shippingpapers" component = {ShippingPapers} exact/>
      <Route path="/closeshipping" component = {CloseShippingPaper} exact/>
      <Route path="/delivery" component = {Delivery} exact/>
      </IonRouterOutlet>
    </IonReactRouter>
  )

}

const App: React.FC = () => {

  const [busy, setBusy] = useState(true)
  const dispatch = useDispatch()


  useEffect(() => {
    (async () => {
      const token = await getAccessToken()
      if (!token) {
        window.history.replaceState({}, '', '/login')
        setBusy(false)
        return
      }
      try {
        const user = await me()
        dispatch(setUserState(user))
        window.history.replaceState({}, '', '/dashboard')
      } catch {
        await clearTokens()
        window.history.replaceState({}, '', '/login')
      }
      setBusy(false)
    })()
  }, [dispatch])


  return(
  <IonApp>
    {busy ? <IonSpinner></IonSpinner>: <RoutingSystem></RoutingSystem>}
  </IonApp>
  )
};

export default App;

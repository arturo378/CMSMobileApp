import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/react';
import { carOutline, documentTextOutline, checkmarkCircleOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';

import './Home.css';

import { useSelector, useDispatch } from 'react-redux'
import { logout as logoutUser } from '../api/auth'
import { clearUserState } from '../redux/actions'
import { useHistory } from 'react-router'
import { Preferences } from '@capacitor/preferences';


const Dashboard: React.FC = () => {
    const username = useSelector((state: any) => state.user.username)
    const dispatch = useDispatch()
    const history = useHistory()
    const [shipping, setShipping] = useState<string>();

    useEffect(() => {
        getItem();
   }, [])

    async function getItem() {
      const { value } = await Preferences.get({ key: 'Shipping_paper' });
      if(value){
        console.log(JSON.parse(value))
        setShipping(value)
      }
    }


    async function logout(){
        await logoutUser()
        dispatch(clearUserState())
        history.replace('/login')
    }

    function shippingPapers(){
        history.replace('/shippingpapers')
    }
    function closeShipping(){
        history.replace('/closeshipping')
    }
    function delivery(){
        history.replace('/delivery')
    }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" className="logout-btn" onClick={logout}>
              <IonIcon slot="start" icon={logOutOutline} />
              Logout
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard className="form-card">
          <IonCardHeader className="ion-text-center">
            <IonIcon icon={personCircleOutline} style={{ fontSize: '40px', color: 'var(--ion-color-primary)' }} />
            <IonCardTitle>Welcome, {username}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--app-section-label-color)' }}>
              Select an action below to continue.
            </p>
          </IonCardContent>
        </IonCard>

        {shipping ? (
          <>
            <p className="section-label">ACTIVE SHIPMENT</p>
            <IonCard className="form-card" button onClick={delivery}>
              <IonCardContent>
                <div className="action-card-row">
                  <IonIcon icon={carOutline} style={{ fontSize: '30px', color: 'var(--ion-color-secondary)', flexShrink: 0 }} />
                  <div className="action-card-info">
                    <h3>Delivery</h3>
                    <p>Record a field delivery</p>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
            <IonCard className="form-card" button onClick={closeShipping}>
              <IonCardContent>
                <div className="action-card-row">
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '30px', color: 'var(--ion-color-tertiary)', flexShrink: 0 }} />
                  <div className="action-card-info">
                    <h3>Close Shipping Paper</h3>
                    <p>Finalize and close the active shipment</p>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </>
        ) : (
          <>
            <p className="section-label">GET STARTED</p>
            <IonCard className="form-card" button onClick={shippingPapers}>
              <IonCardContent>
                <div className="action-card-row">
                  <IonIcon icon={documentTextOutline} style={{ fontSize: '30px', color: 'var(--ion-color-primary)', flexShrink: 0 }} />
                  <div className="action-card-info">
                    <h3>Shipping Papers</h3>
                    <p>Create a new shipping paper</p>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

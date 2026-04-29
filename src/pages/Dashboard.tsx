import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonLoading, IonItem, IonLabel, IonButtons } from '@ionic/react';
import React, { useState, useEffect } from 'react';

import './Home.css';

import { useSelector, useDispatch } from 'react-redux'
import { logout as logoutUser } from '../api/auth'
import { clearUserState } from '../redux/actions'
import { useHistory } from 'react-router'
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;


const Dashboard: React.FC = () => {
    const username = useSelector((state: any) => state.user.username)
    const dispatch = useDispatch()
    const history = useHistory()
    const [shipping, setShipping] = useState<string>();

    useEffect(() => {
        getItem();
   }, [])

    async function getItem() {
      const { value } = await Storage.get({ key: 'Shipping_paper' });
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
  }function delivery(){
        
    history.replace('/delivery')
}
 


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end"  onClick = {logout}>Logout</IonButtons>
        </IonToolbar>
      </IonHeader>
     
      <IonContent className="ion-padding">

      {(function() {
          if (shipping) {
            return (
              <div>
              <IonItem button onClick={delivery}>
            <IonLabel>
              Delivery
            </IonLabel>
            </IonItem>
              <IonItem button onClick={closeShipping}>
            <IonLabel>
              Close Shipping Paper
            </IonLabel>
            </IonItem>
            </div>
            )}else{
              return(
           
            <IonItem button onClick={shippingPapers}>
            <IonLabel>
              Shipping Papers
            </IonLabel>
            </IonItem>
            )}
        })()}
            
    

  
  
    
        
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

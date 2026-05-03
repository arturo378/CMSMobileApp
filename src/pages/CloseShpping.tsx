import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { documentTextOutline, arrowBackOutline, businessOutline, flaskOutline, checkmarkCircleOutline, warningOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Preferences } from '@capacitor/preferences';
import {
  listByWarehouse,
  updateQuantity,
  createWarehouseChemical,
} from '../api/warehouseChemicals';
import { updateShippingPaper } from '../api/shipping';
import { toast } from '../toast';

interface CachedChem {
  chemicalId: string;
  name: string;
  quantity: number;
}

interface CachedShippingPaper {
  data: {
    datanumber: string;
    originwarehousenumber: string;
    destinationwarehousenumber: string;
    originWarehouseId: string;
    destinationWarehouseId: string;
    [k: string]: any;
  };
  chemicals: CachedChem[];
  id: string;
}

const CloseShippingPaper: React.FC = () => {
  const history = useHistory();

  const [chem_list, setChemlist] = useState<CachedChem[]>([]);
  const [paperId, setPaperId] = useState<string>('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>('');
  const [dataNumber, setDataNumber] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');

  function back() {
    history.replace('/dashboard');
  }

  async function deletedata() {
    await Preferences.clear();
    back();
  }

  async function getItem() {
    const { value } = await Preferences.get({ key: 'Shipping_paper' });
    if (!value) return;
    const info: CachedShippingPaper = JSON.parse(value);
    setPaperId(info.id);
    setDestinationWarehouseId(info.data.destinationWarehouseId);
    setChemlist(info.chemicals);
    setDataNumber(info.data.datanumber);
    setDestination(info.data.destinationwarehousenumber);
    setOrigin(info.data.originwarehousenumber);
  }

  useEffect(() => {
    getItem();
  }, []);

  async function submit() {
    if (!paperId || !destinationWarehouseId) {
      toast('Cached shipping paper missing destination info');
      return;
    }
    try {
      const wcs = await listByWarehouse(destinationWarehouseId);
      for (const item of chem_list) {
        if (!item.quantity || item.quantity <= 0) continue;
        const wc = wcs.find((w) => {
          const wcChemId = typeof w.chemical === 'string' ? w.chemical : w.chemical._id;
          return wcChemId === item.chemicalId;
        });
        if (wc) {
          await updateQuantity(wc._id, wc.quantity + item.quantity);
        } else {
          await createWarehouseChemical(destinationWarehouseId, item.chemicalId, item.quantity);
        }
      }

      await updateShippingPaper(paperId, { active: 1 });
      await Preferences.clear();
      back();
    } catch (err) {
      toast((err && (err as any).message) || 'Failed to close shipping paper');
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" className="header-back-btn" onClick={back}>
              <IonIcon slot="start" icon={arrowBackOutline} />
              Dashboard
            </IonButton>
          </IonButtons>
          <IonTitle>Close Shipment</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonCard className="form-card">
          <IonCardHeader>
            <IonIcon icon={documentTextOutline} style={{ fontSize: '28px', color: 'var(--ion-color-primary)' }} />
            <IonCardTitle>Shipping Paper #{dataNumber}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon slot="start" icon={businessOutline} color="medium" />
              <IonLabel>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--app-section-label-color)' }}>Origin</p>
                <h3 style={{ fontWeight: 600 }}>{origin}</h3>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonIcon slot="start" icon={businessOutline} color="secondary" />
              <IonLabel>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--app-section-label-color)' }}>Destination</p>
                <h3 style={{ fontWeight: 600 }}>{destination}</h3>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <p className="section-label">CHEMICALS ON BOARD</p>
        <IonCard className="form-card">
          <IonCardContent>
            <div className="chem-scroll-area">
              {chem_list.length === 0 ? (
                <p className="chem-empty">No chemicals on board</p>
              ) : (
                chem_list.map((info, index) => (
                  <div className="chem-row" key={`${info.chemicalId}-${index}`}>
                    <span className="chem-row-name">
                      <IonIcon icon={flaskOutline} />
                      {info.name}
                    </span>
                    <span className="chem-row-qty">{info.quantity} gal</span>
                  </div>
                ))
              )}
            </div>
          </IonCardContent>
        </IonCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <IonButton expand="block" color="primary" onClick={submit}>
            <IonIcon slot="start" icon={checkmarkCircleOutline} />
            Close Shipping Paper
          </IonButton>
          <IonButton expand="block" color="danger" fill="outline" onClick={deletedata}>
            <IonIcon slot="start" icon={warningOutline} />
            Clear All Data
          </IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default CloseShippingPaper;

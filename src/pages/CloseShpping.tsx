import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonListHeader,
  IonItemSliding,
} from '@ionic/react';
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
          <IonTitle>Close Shipping Paper</IonTitle>
          <IonButtons onClick={back} slot="end">Back</IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonGrid>
          <IonRow>
            <IonList>
              <IonItem><IonLabel>Data ID:  {dataNumber}</IonLabel></IonItem>
              <IonItem><IonLabel>Origin Warehouse: {origin}</IonLabel></IonItem>
              <IonItem><IonLabel>Destination Warehouse: {destination}</IonLabel></IonItem>
            </IonList>
          </IonRow>

          <IonRow>
            <IonContent
              style={{ height: '15em' }}
              className="ion-padding"
              scrollEvents={true}
              onIonScrollStart={() => { }}
              onIonScroll={() => { }}
              onIonScrollEnd={() => { }}>
              <IonListHeader>Chemicals</IonListHeader>
              <IonList>
                {chem_list.map((info, index) => (
                  <IonItemSliding key={`${info.chemicalId}-${index}`}>
                    <IonLabel>{info.name}:  {info.quantity}</IonLabel>
                  </IonItemSliding>
                ))}
              </IonList>
            </IonContent>
          </IonRow>
          <IonRow>
            <IonButton color="primary" expand="full" onClick={submit}>Close Shipping Paper</IonButton>
            <IonButton color="danger" expand="full" onClick={deletedata}>Clear Data</IonButton>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default CloseShippingPaper;

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonList,
  IonModal,
  IonItem,
  IonInput,
  IonLabel,
  IonSelect,
  IonGrid,
  IonRow,
  IonSelectOption,
  IonListHeader,
  IonFabButton,
  IonItemSliding,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { Plugins } from '@capacitor/core';
import { listWarehouses } from '../api/warehouses';
import { listChemicals } from '../api/chemicals';
import { listByWarehouse, updateQuantity } from '../api/warehouseChemicals';
import { createShippingPaper, addShippingChemical } from '../api/shipping';
import { Warehouse, Chemical } from '../api/types';
import { toast } from '../toast';

const { Geolocation, Storage } = Plugins;

interface ChemRow {
  chemicalId: string;
  name: string;
  quantity: number;
}

const ShippingPapers: React.FC = () => {
  const userId = useSelector((state: any) => state.user.id);
  const history = useHistory();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [chem_list, setChemlist] = useState<ChemRow[]>([]);

  const [coordinates, setCoordinates] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [gallons, setGallons] = useState<number>(0);
  const [truck, setTruck] = useState<string>('');
  const [originId, setOriginId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [chemicalId, setChemicalId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  function back() {
    history.replace('/dashboard');
  }

  function addchemical() {
    setShowModal(true);
  }

  function removechemical(_e: any, index: number) {
    const list = chem_list.slice();
    list.splice(index, 1);
    setChemlist(list);
  }

  function addchem() {
    const c = chemicals.find((x) => x._id === chemicalId);
    if (!c || !gallons) return;
    setChemlist([...chem_list, { chemicalId: c._id, name: c.tradename, quantity: gallons }]);
    setChemicalId('');
    setGallons(0);
    setShowModal(false);
  }

  async function getCurrentPosition() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      setCoordinates(`${pos.coords.latitude},${pos.coords.longitude}`);
    } catch {
      // Geolocation can fail in browsers without permission; leave empty.
    }
  }

  async function submit() {
    if (!userId) {
      toast('Not signed in');
      return;
    }
    const originW = warehouses.find((w) => w._id === originId);
    const destW = warehouses.find((w) => w._id === destinationId);
    if (!originW || !destW) {
      toast('Pick origin and destination warehouses');
      return;
    }
    if (chem_list.length === 0) {
      toast('Add at least one chemical');
      return;
    }

    try {
      const paper = await createShippingPaper({
        createdBy: userId,
        originwarehousenumber: originW.name,
        destinationwarehousenumber: destW.name,
        trucknumber: truck,
        date: new Date().toISOString(),
        comments: comment,
        gps: coordinates,
        active: 0,
      });

      const wcs = await listByWarehouse(originId);
      for (const item of chem_list) {
        const wc = wcs.find((w) => {
          const wcChemId = typeof w.chemical === 'string' ? w.chemical : w.chemical._id;
          return wcChemId === item.chemicalId;
        });
        if (wc) {
          const newQty = Math.max(0, wc.quantity - item.quantity);
          await updateQuantity(wc._id, newQty);
        }
        await addShippingChemical(paper._id, item.chemicalId, item.quantity);
      }

      const cache = {
        data: {
          datanumber: paper.datanumber,
          originwarehousenumber: originW.name,
          destinationwarehousenumber: destW.name,
          originWarehouseId: originId,
          destinationWarehouseId: destinationId,
          trucknumber: truck,
          date: paper.date,
          comments: comment,
          gps: coordinates,
        },
        chemicals: chem_list,
        id: paper._id,
      };
      await Storage.set({ key: 'Shipping_paper', value: JSON.stringify(cache) });
      history.replace('/dashboard');
    } catch (err) {
      toast((err && (err as any).message) || 'Failed to create shipping paper');
    }
  }

  useEffect(() => {
    getCurrentPosition();
    Promise.all([listWarehouses(), listChemicals()])
      .then(([w, c]) => {
        setWarehouses(w);
        setChemicals(c);
      })
      .catch((err) => toast((err && err.message) || 'Failed to load data'));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Shipping Paper</IonTitle>
          <IonButtons onClick={back} slot="end">Back</IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonGrid>
          <IonRow>
            <IonList>
              <IonItem>
                <IonLabel>Origin Warehouse</IonLabel>
                <IonSelect value={originId} placeholder="Select One" onIonChange={e => setOriginId(e.detail.value)}>
                  {warehouses.map((info) => (
                    <IonSelectOption key={info._id} value={info._id}>{info.warehousenumber}  {info.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Destination Warehouse</IonLabel>
                <IonSelect value={destinationId} placeholder="Select One" onIonChange={e => setDestinationId(e.detail.value)}>
                  {warehouses.map((info) => (
                    <IonSelectOption key={info._id} value={info._id}>{info.warehousenumber}  {info.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonInput value={truck} placeholder="Truck Number" onIonChange={e => setTruck(e.detail.value!)}></IonInput>
              </IonItem>
              <IonItem>
                <IonInput value={comment} placeholder="Comments" onIonChange={e => setComment(e.detail.value!)}></IonInput>
              </IonItem>
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
                    <IonItem type='button' onClick={e => removechemical(info, index)}>
                      <IonLabel>{info.name}:  {info.quantity}</IonLabel>
                    </IonItem>
                  </IonItemSliding>
                ))}
              </IonList>
            </IonContent>
          </IonRow>

          <IonRow>
            <IonFabButton size="small" color="danger" onClick={addchemical}>+</IonFabButton>
          </IonRow>
          <IonRow>
            <IonButton color="primary" expand="full" onClick={submit}>Submit</IonButton>
          </IonRow>
        </IonGrid>

        <IonModal isOpen={showModal} cssClass='my-custom-class'>
          <IonGrid>
            <IonRow>
              <IonLabel>Add Chemical:</IonLabel>
              <IonSelect value={chemicalId} placeholder="Select One" onIonChange={e => setChemicalId(e.detail.value)}>
                {chemicals.map((info) => (
                  <IonSelectOption key={info._id} value={info._id}>{info.tradename}</IonSelectOption>
                ))}
              </IonSelect>
            </IonRow>
            <IonRow>
              <IonLabel>Enter Gallons:</IonLabel>
              <IonItem>
                <IonInput type="number" value={gallons} placeholder="Enter Number" onIonChange={e => setGallons(parseInt(e.detail.value!, 10))}></IonInput>
              </IonItem>
            </IonRow>
          </IonGrid>
          <IonButton onClick={addchem}>Add Chemical</IonButton>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ShippingPapers;

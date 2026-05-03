import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonModal,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonFabButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { addOutline, flaskOutline, carOutline, businessOutline, closeCircleOutline, chatbubbleOutline, arrowBackOutline, checkmarkOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { listWarehouses } from '../api/warehouses';
import { listChemicals } from '../api/chemicals';
import { listByWarehouse, updateQuantity } from '../api/warehouseChemicals';
import { createShippingPaper, addShippingChemical } from '../api/shipping';
import { Warehouse, Chemical } from '../api/types';
import { toast } from '../toast';

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
      await Preferences.set({ key: 'Shipping_paper', value: JSON.stringify(cache) });
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
          <IonButtons slot="start">
            <IonButton fill="clear" className="header-back-btn" onClick={back}>
              <IonIcon slot="start" icon={arrowBackOutline} />
              Dashboard
            </IonButton>
          </IonButtons>
          <IonTitle>Shipping Paper</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <p className="section-label">ROUTE INFORMATION</p>
        <IonCard className="form-card">
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon slot="start" icon={businessOutline} color="primary" />
              <IonSelect label="Origin Warehouse" labelPlacement="stacked" value={originId} placeholder="Select One" onIonChange={e => setOriginId(e.detail.value)}>
                {warehouses.map((info) => (
                  <IonSelectOption key={info._id} value={info._id}>{info.warehousenumber}  {info.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonIcon slot="start" icon={businessOutline} color="medium" />
              <IonSelect label="Destination Warehouse" labelPlacement="stacked" value={destinationId} placeholder="Select One" onIonChange={e => setDestinationId(e.detail.value)}>
                {warehouses.map((info) => (
                  <IonSelectOption key={info._id} value={info._id}>{info.warehousenumber}  {info.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <p className="section-label">TRIP DETAILS</p>
        <IonCard className="form-card">
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon slot="start" icon={carOutline} color="primary" />
              <IonInput label="Truck Number" labelPlacement="stacked" value={truck} placeholder="Truck Number" onIonInput={e => setTruck(e.detail.value!)} />
            </IonItem>
            <IonItem lines="none">
              <IonIcon slot="start" icon={chatbubbleOutline} color="medium" />
              <IonInput label="Comments" labelPlacement="stacked" value={comment} placeholder="Comments" onIonInput={e => setComment(e.detail.value!)} />
            </IonItem>
          </IonCardContent>
        </IonCard>

        <p className="section-label">CHEMICALS</p>
        <IonCard className="form-card">
          <IonCardHeader style={{ paddingBottom: '4px' }}>
            <IonCardTitle style={{ fontSize: '0.9rem' }}>Added Chemicals</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="chem-scroll-area">
              {chem_list.length === 0 ? (
                <p className="chem-empty">No chemicals added yet</p>
              ) : (
                chem_list.map((info, index) => (
                  <div className="chem-row" key={`${info.chemicalId}-${index}`}>
                    <span className="chem-row-name">
                      <IonIcon icon={flaskOutline} />
                      {info.name}
                    </span>
                    <div className="chem-row-actions">
                      <span className="chem-row-qty">{info.quantity} gal</span>
                      <IonIcon
                        className="chem-row-remove"
                        icon={closeCircleOutline}
                        onClick={e => removechemical(info, index)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="fab-row">
              <IonFabButton size="small" color="secondary" onClick={addchemical}>
                <IonIcon icon={addOutline} />
              </IonFabButton>
              <span className="fab-row-label">Add Chemical</span>
            </div>
          </IonCardContent>
        </IonCard>

        <IonButton expand="block" color="primary" className="submit-btn" onClick={submit}>
          <IonIcon slot="start" icon={checkmarkOutline} />
          Submit Shipping Paper
        </IonButton>

        <IonModal isOpen={showModal} className='my-custom-class'>
          <div className="modal-inner">
            <p className="modal-title">Add Chemical</p>
            <IonItem lines="full">
              <IonSelect label="Chemical" labelPlacement="stacked" value={chemicalId} placeholder="Select One" onIonChange={e => setChemicalId(e.detail.value)}>
                {chemicals.map((info) => (
                  <IonSelectOption key={info._id} value={info._id}>{info.tradename}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="full">
              <IonInput label="Gallons" labelPlacement="stacked" type="number" value={gallons} placeholder="Enter Number" onIonInput={e => setGallons(parseInt(e.detail.value!, 10))} />
            </IonItem>
            <IonButton expand="block" color="secondary" onClick={addchem}>
              <IonIcon slot="start" icon={addOutline} />
              Add to List
            </IonButton>
            <IonButton expand="block" fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
          </div>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default ShippingPapers;

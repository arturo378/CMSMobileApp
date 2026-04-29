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
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { listCompanies } from '../api/companies';
import { listLeases } from '../api/leases';
import { listWells } from '../api/wells';
import { createDelivery, addDeliveryChemical } from '../api/deliveries';
import { Company, Lease, Well } from '../api/types';
import { toast } from '../toast';

interface CachedChem {
  chemicalId: string;
  name: string;
  quantity: number;
}

interface DeliveryChem {
  chemicalId: string;
  name: string;
  quantity: number;
}

interface CachedShippingPaper {
  data: any;
  chemicals: CachedChem[];
  id: string;
}

const Delivery: React.FC = () => {
  const userId = useSelector((state: any) => state.user.id);
  const history = useHistory();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [wells, setWells] = useState<Well[]>([]);

  const [companyId, setCompanyId] = useState<string>('');
  const [leaseId, setLeaseId] = useState<string>('');
  const [wellId, setWellId] = useState<string>('');

  const [coordinates, setCoordinates] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [chemicals, setChemicals] = useState<CachedChem[]>([]);
  const [delverychems, setDeliveryChems] = useState<DeliveryChem[]>([]);
  const [chemicalId, setChemicalId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [gallons, setGallons] = useState<number>(0);

  function back() {
    history.replace('/dashboard');
  }

  function addchemical() {
    setShowModal(true);
  }

  function removechemical(_e: any, index: number) {
    const list = delverychems.slice();
    list.splice(index, 1);
    setDeliveryChems(list);
  }

  async function loadCachedShipping() {
    const { value } = await Preferences.get({ key: 'Shipping_paper' });
    if (value) {
      const cached: CachedShippingPaper = JSON.parse(value);
      setChemicals(cached.chemicals);
    }
  }

  async function getCachedShipping(): Promise<CachedShippingPaper | null> {
    const { value } = await Preferences.get({ key: 'Shipping_paper' });
    return value ? JSON.parse(value) : null;
  }

  function addchem() {
    if (!chemicalId || !gallons) return;
    const onTruck = chemicals.find((c) => c.chemicalId === chemicalId);
    if (!onTruck) {
      toast('Chemical not on the truck');
      return;
    }
    if (delverychems.find((d) => d.chemicalId === chemicalId)) {
      toast('Chemical already on the list');
      return;
    }
    if (gallons > onTruck.quantity) {
      toast(`Quantity must be less than ${onTruck.quantity}`);
      return;
    }
    setDeliveryChems([...delverychems, { chemicalId, name: onTruck.name, quantity: gallons }]);
    setChemicalId('');
    setGallons(0);
    setShowModal(false);
  }

  async function getCurrentPosition() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      setCoordinates(`${pos.coords.latitude},${pos.coords.longitude}`);
    } catch {
      // Geolocation may be denied; leave empty.
    }
  }

  async function submit() {
    if (!userId) {
      toast('Not signed in');
      return;
    }
    if (!companyId || !leaseId || !wellId) {
      toast('Pick company, lease, and well');
      return;
    }
    if (delverychems.length === 0) {
      toast('Add at least one chemical');
      return;
    }

    try {
      const delivery = await createDelivery({
        company: companyId,
        lease: leaseId,
        well: wellId,
        createdBy: userId,
        gps: coordinates,
        comments: comment,
        date: new Date().toISOString(),
        active: 0,
      });

      for (const item of delverychems) {
        await addDeliveryChemical(delivery._id, item.chemicalId, item.quantity);
      }

      const cached = await getCachedShipping();
      if (cached) {
        const updated: CachedChem[] = cached.chemicals.map((c) => {
          const delivered = delverychems.find((d) => d.chemicalId === c.chemicalId);
          return delivered ? { ...c, quantity: c.quantity - delivered.quantity } : c;
        });
        cached.chemicals = updated;
        await Preferences.set({ key: 'Shipping_paper', value: JSON.stringify(cached) });
      }
      history.replace('/dashboard');
    } catch (err) {
      toast((err && (err as any).message) || 'Failed to submit delivery');
    }
  }

  useEffect(() => {
    loadCachedShipping();
    getCurrentPosition();
    listCompanies()
      .then(setCompanies)
      .catch((err) => toast((err && err.message) || 'Failed to load companies'));
  }, []);

  useEffect(() => {
    setLeases([]);
    setWells([]);
    setLeaseId('');
    setWellId('');
    if (!companyId) return;
    listLeases(companyId)
      .then(setLeases)
      .catch((err) => toast((err && err.message) || 'Failed to load leases'));
  }, [companyId]);

  useEffect(() => {
    setWells([]);
    setWellId('');
    if (!leaseId) return;
    listWells(leaseId)
      .then(setWells)
      .catch((err) => toast((err && err.message) || 'Failed to load wells'));
  }, [leaseId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Delivery</IonTitle>
          <IonButtons onClick={back} slot="end">Back</IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>

        <IonGrid>
          <IonRow>
            <IonList>
              <IonItem>
                <IonSelect label="Company" labelPlacement="stacked" value={companyId} onIonChange={e => setCompanyId(e.detail.value)}>
                  {companies.map((data) => (
                    <IonSelectOption key={data._id} value={data._id}>{data.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonSelect label="Lease" labelPlacement="stacked" value={leaseId} onIonChange={e => setLeaseId(e.detail.value)}>
                  {leases.map((data) => (
                    <IonSelectOption key={data._id} value={data._id}>{data.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonSelect label="Well" labelPlacement="stacked" value={wellId} onIonChange={e => setWellId(e.detail.value)}>
                  {wells.map((data) => (
                    <IonSelectOption key={data._id} value={data._id}>{data.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonInput label="Comments" labelPlacement="stacked" value={comment} placeholder="Comments" onIonInput={e => setComment(e.detail.value!)}></IonInput>
              </IonItem>
            </IonList>
          </IonRow>
        </IonGrid>

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
              {delverychems.map((info, index) => (
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
          <IonButton color="primary" expand="full" onClick={submit}>Submit Deliveries</IonButton>
        </IonRow>

        <IonModal isOpen={showModal} className='my-custom-class'>
          <IonGrid>
            <IonRow>
              <IonItem>
                <IonSelect label="Chemical" labelPlacement="stacked" value={chemicalId} placeholder="Select One" onIonChange={e => setChemicalId(e.detail.value)}>
                  {chemicals.map((info) => (
                    <IonSelectOption key={info.chemicalId} value={info.chemicalId}>{info.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonRow>
            <IonRow>
              <IonItem>
                <IonInput label="Enter Gallons" labelPlacement="stacked" type="number" value={gallons} placeholder="Enter Number" onIonInput={e => setGallons(parseInt(e.detail.value!, 10))}></IonInput>
              </IonItem>
            </IonRow>
          </IonGrid>
          <IonButton onClick={addchem}>Add Chemicals</IonButton>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Delivery;

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
import { addOutline, flaskOutline, businessOutline, closeCircleOutline, chatbubbleOutline, arrowBackOutline, checkmarkOutline, locationOutline, waterOutline } from 'ionicons/icons';
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
          <IonButtons slot="start">
            <IonButton fill="clear" className="header-back-btn" onClick={back}>
              <IonIcon slot="start" icon={arrowBackOutline} />
              Dashboard
            </IonButton>
          </IonButtons>
          <IonTitle>Delivery</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>

        <p className="section-label">DELIVERY LOCATION</p>
        <IonCard className="form-card">
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon slot="start" icon={businessOutline} color="primary" />
              <IonSelect label="Company" labelPlacement="stacked" value={companyId} onIonChange={e => setCompanyId(e.detail.value)}>
                {companies.map((data) => (
                  <IonSelectOption key={data._id} value={data._id}>{data.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonIcon slot="start" icon={locationOutline} color="primary" />
              <IonSelect label="Lease" labelPlacement="stacked" value={leaseId} onIonChange={e => setLeaseId(e.detail.value)}>
                {leases.map((data) => (
                  <IonSelectOption key={data._id} value={data._id}>{data.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonIcon slot="start" icon={waterOutline} color="secondary" />
              <IonSelect label="Well" labelPlacement="stacked" value={wellId} onIonChange={e => setWellId(e.detail.value)}>
                {wells.map((data) => (
                  <IonSelectOption key={data._id} value={data._id}>{data.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <p className="section-label">NOTES</p>
        <IonCard className="form-card">
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon slot="start" icon={chatbubbleOutline} color="medium" />
              <IonInput label="Comments" labelPlacement="stacked" value={comment} placeholder="Comments" onIonInput={e => setComment(e.detail.value!)} />
            </IonItem>
          </IonCardContent>
        </IonCard>

        <p className="section-label">CHEMICALS TO DELIVER</p>
        <IonCard className="form-card">
          <IonCardHeader style={{ paddingBottom: '4px' }}>
            <IonCardTitle style={{ fontSize: '0.9rem' }}>Delivery Chemicals</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="chem-scroll-area">
              {delverychems.length === 0 ? (
                <p className="chem-empty">No chemicals added yet</p>
              ) : (
                delverychems.map((info, index) => (
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
          Submit Delivery
        </IonButton>

        <IonModal isOpen={showModal} className='my-custom-class'>
          <div className="modal-inner">
            <p className="modal-title">Add Chemical</p>
            <IonItem lines="full">
              <IonSelect label="Chemical" labelPlacement="stacked" value={chemicalId} placeholder="Select One" onIonChange={e => setChemicalId(e.detail.value)}>
                {chemicals.map((info) => (
                  <IonSelectOption key={info.chemicalId} value={info.chemicalId}>{info.name}</IonSelectOption>
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

export default Delivery;

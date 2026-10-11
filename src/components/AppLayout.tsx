import { useCallback, useState } from 'react';
import { getService, type ServiceId, type TravelId } from '@/data/brand';
import Nav from './hcb/Nav';
import Hero from './hcb/Hero';
import ServicesShowcase from './hcb/ServicesShowcase';
import Treatments from './hcb/Treatments';
import About from './hcb/About';
import Retail from './hcb/Retail';
import Footer from './hcb/Footer';
import BookingModal from './hcb/BookingModal';
import InstallPrompt from './hcb/InstallPrompt';
import Community from './hcb/Community';

export default function AppLayout() {
  const [serviceId, setServiceId] = useState<ServiceId>('house-call');
  const [guests, setGuests] = useState(3);
  const [travel, setTravel] = useState<TravelId>('within');
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const openBooking = useCallback(() => setModalOpen(true), []);
  const closeBooking = useCallback(() => setModalOpen(false), []);

  const handleService = (id: ServiceId) => {
    setServiceId(id);
    const s = getService(id);
    if (s.perPerson && guests < (s.minPeople ?? 1)) setGuests(s.minPeople ?? 1);
  };

  const toggleAddOn = (id: string) =>
    setAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <Nav onBook={openBooking} />

      <main>
        <Hero onBook={openBooking} />
        <About />
        <ServicesShowcase selected={serviceId} onSelect={handleService} onBook={openBooking} />
        <Treatments
          serviceId={serviceId}
          guests={guests}
          travel={travel}
          addOnIds={addOnIds}
          onService={handleService}
          onGuests={setGuests}
          onTravel={setTravel}
          onToggleAddOn={toggleAddOn}
          onClearAddOns={() => setAddOnIds([])}
          onRequest={openBooking}
        />
        <Retail />
        <Community />
      </main>
      <Footer onBook={openBooking} />

      <InstallPrompt />

      <BookingModal
        open={modalOpen}
        onClose={closeBooking}
        serviceId={serviceId}
        guests={guests}
        travel={travel}
        addOnIds={addOnIds}
      />
    </div>
  );
}

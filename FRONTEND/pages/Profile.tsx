import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    phone: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error('Failed to get address');
          const data = await response.json();
          setFormData(prev => ({ ...prev, location: data.display_name || `${latitude}, ${longitude}` }));
        } catch (error) {
          setLocationError('Could not fetch address details. Using coordinates instead.');
          setFormData(prev => ({ ...prev, location: `${position.coords.latitude}, ${position.coords.longitude}` }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a backend
    alert('Profile updated successfully!');
  };

  return (
    <div className="pt-28 pb-32 px-6 max-w-3xl mx-auto min-h-[calc(100vh-80px)]">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-headline mb-4">MY PROFILE</h1>
        <p className="text-xs text-zinc-500 tracking-widest uppercase font-body">Manage your personal information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="font-headline font-bold text-xs tracking-widest uppercase text-zinc-800">
              NOM ET PRÉNOM
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="VOTRE NOM COMPLET"
              className="bg-transparent border-0 border-b border-outline-variant py-4 px-0 font-body text-sm focus:ring-0 focus:border-primary transition-colors uppercase placeholder:text-zinc-300"
              required
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="location" className="font-headline font-bold text-xs tracking-widest uppercase text-zinc-800">
                LOCALISATION
              </label>
              <button
                type="button"
                onClick={getLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-primary hover:text-primary-fixed transition-colors disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                {isLocating ? 'LOCALISATION...' : 'UTILISER MA POSITION'}
              </button>
            </div>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="VOTRE ADRESSE OU VILLE"
              className="bg-transparent border-0 border-b border-outline-variant py-4 px-0 font-body text-sm focus:ring-0 focus:border-primary transition-colors uppercase placeholder:text-zinc-300"
              required
            />
            {locationError && (
              <p className="text-[10px] text-error mt-1 font-body font-medium">{locationError}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-headline font-bold text-xs tracking-widest uppercase text-zinc-800">
              NUMÉRO DE TÉLÉPHONE
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+226 XX XX XX XX"
              className="bg-transparent border-0 border-b border-outline-variant py-4 px-0 font-body text-sm focus:ring-0 focus:border-primary transition-colors uppercase placeholder:text-zinc-300"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full md:w-auto bg-primary text-on-primary py-5 px-12 font-headline font-bold tracking-widest uppercase hover:bg-primary-fixed transition-colors mt-8"
        >
          ENREGISTRER
        </button>
      </form>
    </div>
  );
}

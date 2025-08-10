// src/app/admin/events/create/page.tsx - Event Creation
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Upload, 
  Plus, 
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { LocationPicker } from '@/components/location/MapView';
import { usePermissions } from '@/contexts/AuthContext';
import { api, CreateEventData, Venue, Category, TicketType } from '@/lib/api';

interface EventFormData {
  title: string;
  description: string;
  longDescription: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venueId: string;
  categoryId: string;
  maxAttendees: number;
  tags: string[];
  imageUrl: string;
  images: string[];
}

interface TicketTypeForm {
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  maxPerOrder: number;
  saleStartDate: string;
  saleEndDate: string;
  benefits: string[];
}

export default function CreateEventPage() {
  const router = useRouter();
  const { canCreateEvents } = usePermissions();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [eventData, setEventData] = useState<EventFormData>({
    title: '',
    description: '',
    longDescription: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venueId: '',
    categoryId: '',
    maxAttendees: 0,
    tags: [],
    imageUrl: '',
    images: []
  });

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      name: 'General Admission',
      description: 'Standard event access',
      price: 0,
      totalQuantity: 100,
      maxPerOrder: 10,
      saleStartDate: '',
      saleEndDate: '',
      benefits: ['Event access']
    }
  ]);

  useEffect(() => {
    if (!canCreateEvents) {
      router.push('/admin');
      return;
    }
    fetchData();
  }, [canCreateEvents, router]);

  const fetchData = async () => {
    try {
      const [venuesData, categoriesData] = await Promise.all([
        api.events.getVenues(),
        api.events.getCategories()
      ]);
      setVenues(venuesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const EventDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Event Title</label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => handleEventDataChange('title', e.target.value)}
            className={`form-input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter event title"
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            value={eventData.categoryId}
            onChange={(e) => handleEventDataChange('categoryId', e.target.value)}
            className={`form-input ${errors.categoryId ? 'border-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="form-error">{errors.categoryId}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Short Description</label>
        <textarea
          value={eventData.description}
          onChange={(e) => handleEventDataChange('description', e.target.value)}
          className={`form-input h-24 ${errors.description ? 'border-red-500' : ''}`}
          placeholder="Brief description for event cards"
          maxLength={200}
        />
        <div className="text-xs text-gray-500 mt-1">
          {eventData.description.length}/200 characters
        </div>
        {errors.description && <p className="form-error">{errors.description}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Detailed Description</label>
        <textarea
          value={eventData.longDescription}
          onChange={(e) => handleEventDataChange('longDescription', e.target.value)}
          className="form-input h-32"
          placeholder="Detailed event description with agenda, highlights, etc."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Venue</label>
        <select
          value={eventData.venueId}
          onChange={(e) => handleEventDataChange('venueId', e.target.value)}
          className={`form-input ${errors.venueId ? 'border-red-500' : ''}`}
        >
          <option value="">Select a venue</option>
          {venues.map(venue => (
            <option key={venue.id} value={venue.id}>
              {venue.name} - {venue.address}
            </option>
          ))}
        </select>
        {errors.venueId && <p className="form-error">{errors.venueId}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Maximum Attendees (Optional)</label>
          <input
            type="number"
            value={eventData.maxAttendees || ''}
            onChange={(e) => handleEventDataChange('maxAttendees', parseInt(e.target.value) || 0)}
            className="form-input"
            placeholder="Leave empty for unlimited"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Event Image URL (Optional)</label>
          <input
            type="url"
            value={eventData.imageUrl}
            onChange={(e) => handleEventDataChange('imageUrl', e.target.value)}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags (Press Enter to add)</label>
        <input
          type="text"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value && !eventData.tags.includes(value)) {
                handleEventDataChange('tags', [...eventData.tags, value]);
                e.currentTarget.value = '';
              }
            }
          }}
          className="form-input"
          placeholder="Add tags for better discoverability"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {eventData.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm flex items-center"
            >
              {tag}
              <button
                onClick={() => handleEventDataChange('tags', eventData.tags.filter((_, i) => i !== index))}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const DateTimeStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            value={eventData.startDate}
            onChange={(e) => handleEventDataChange('startDate', e.target.value)}
            className={`form-input ${errors.startDate ? 'border-red-500' : ''}`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && <p className="form-error">{errors.startDate}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input
            type="time"
            value={eventData.startTime}
            onChange={(e) => handleEventDataChange('startTime', e.target.value)}
            className={`form-input ${errors.startTime ? 'border-red-500' : ''}`}
          />
          {errors.startTime && <p className="form-error">{errors.startTime}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            value={eventData.endDate}
            onChange={(e) => handleEventDataChange('endDate', e.target.value)}
            className={`form-input ${errors.endDate ? 'border-red-500' : ''}`}
            min={eventData.startDate || new Date().toISOString().split('T')[0]}
          />
          {errors.endDate && <p className="form-error">{errors.endDate}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">End Time</label>
          <input
            type="time"
            value={eventData.endTime}
            onChange={(e) => handleEventDataChange('endTime', e.target.value)}
            className={`form-input ${errors.endTime ? 'border-red-500' : ''}`}
          />
          {errors.endTime && <p className="form-error">{errors.endTime}</p>}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Timezone Information</p>
            <p>All times are in East Africa Time (EAT). Make sure to set the correct local time for your event.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TicketsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ticket Types</h3>
        <button
          onClick={addTicketType}
          className="btn btn-outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ticket Type
        </button>
      </div>

      {errors.ticketTypes && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{errors.ticketTypes}</p>
        </div>
      )}

      <div className="space-y-6">
        {ticketTypes.map((ticket, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Ticket Type {index + 1}</h4>
              {ticketTypes.length > 1 && (
                <button
                  onClick={() => removeTicketType(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Ticket Name</label>
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                  className={`form-input ${errors[`ticket_${index}_name`] ? 'border-red-500' : ''}`}
                  placeholder="e.g., General Admission, VIP"
                />
                {errors[`ticket_${index}_name`] && (
                  <p className="form-error">{errors[`ticket_${index}_name`]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Price (KES)</label>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => handleTicketTypeChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className={`form-input ${errors[`ticket_${index}_price`] ? 'border-red-500' : ''}`}
                  min="0"
                  step="50"
                />
                {errors[`ticket_${index}_price`] && (
                  <p className="form-error">{errors[`ticket_${index}_price`]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Total Quantity</label>
                <input
                  type="number"
                  value={ticket.totalQuantity}
                  onChange={(e) => handleTicketTypeChange(index, 'totalQuantity', parseInt(e.target.value) || 0)}
                  className={`form-input ${errors[`ticket_${index}_quantity`] ? 'border-red-500' : ''}`}
                  min="1"
                />
                {errors[`ticket_${index}_quantity`] && (
                  <p className="form-error">{errors[`ticket_${index}_quantity`]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Max Per Order</label>
                <input
                  type="number"
                  value={ticket.maxPerOrder}
                  onChange={(e) => handleTicketTypeChange(index, 'maxPerOrder', parseInt(e.target.value) || 1)}
                  className="form-input"
                  min="1"
                  max={ticket.totalQuantity}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={ticket.description}
                onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                className="form-input h-20"
                placeholder="Describe what this ticket includes"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Benefits (Press Enter to add)</label>
              <input
                type="text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !ticket.benefits.includes(value)) {
                      handleTicketTypeChange(index, 'benefits', [...ticket.benefits, value]);
                      e.currentTarget.value = '';
                    }
                  }
                }}
                className="form-input"
                placeholder="e.g., Event access, Welcome drink, VIP seating"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {ticket.benefits.map((benefit, benefitIndex) => (
                  <span
                    key={benefitIndex}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm flex items-center"
                  >
                    {benefit}
                    <button
                      onClick={() => {
                        const newBenefits = ticket.benefits.filter((_, i) => i !== benefitIndex);
                        handleTicketTypeChange(index, 'benefits', newBenefits);
                      }}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Title:</span>
            <p className="font-medium">{eventData.title}</p>
          </div>
          <div>
            <span className="text-gray-600">Category:</span>
            <p className="font-medium">
              {categories.find(c => c.id === eventData.categoryId)?.name}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Venue:</span>
            <p className="font-medium">
              {venues.find(v => v.id === eventData.venueId)?.name}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Date & Time:</span>
            <p className="font-medium">
              {eventData.startDate} at {eventData.startTime}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Types</h3>
        <div className="space-y-3">
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{ticket.name}</p>
                <p className="text-sm text-gray-600">{ticket.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-purple-600">
                  {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(ticket.price)}
                </p>
                <p className="text-sm text-gray-600">Qty: {ticket.totalQuantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  const steps = [
    { number: 1, title: 'Event Details', component: EventDetailsStep },
    { number: 2, title: 'Date & Time', component: DateTimeStep },
    { number: 3, title: 'Tickets', component: TicketsStep },
    { number: 4, title: 'Review', component: ReviewStep }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="minimal" title="Create Event" showBackButton={true} />

      <div className="container py-6">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {steps[currentStep - 1].title}
            </h2>
            
            {React.createElement(steps[currentStep - 1].component)}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`btn ${currentStep === 1 ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-outline'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={handleNextStep}
                  className="btn btn-primary"
                >
                  Next
                  <Calendar className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Event
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}) {
      console.error('Failed to fetch data:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!eventData.title.trim()) newErrors.title = 'Event title is required';
      if (!eventData.description.trim()) newErrors.description = 'Event description is required';
      if (!eventData.categoryId) newErrors.categoryId = 'Category is required';
      if (!eventData.venueId) newErrors.venueId = 'Venue is required';
    }

    if (step === 2) {
      if (!eventData.startDate) newErrors.startDate = 'Start date is required';
      if (!eventData.startTime) newErrors.startTime = 'Start time is required';
      if (!eventData.endDate) newErrors.endDate = 'End date is required';
      if (!eventData.endTime) newErrors.endTime = 'End time is required';
      
      if (eventData.startDate && eventData.endDate && eventData.startDate > eventData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (step === 3) {
      if (ticketTypes.length === 0) {
        newErrors.ticketTypes = 'At least one ticket type is required';
      } else {
        ticketTypes.forEach((ticket, index) => {
          if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Ticket name is required';
          if (ticket.price < 0) newErrors[`ticket_${index}_price`] = 'Price must be positive';
          if (ticket.totalQuantity <= 0) newErrors[`ticket_${index}_quantity`] = 'Quantity must be greater than 0';
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleEventDataChange = (field: keyof EventFormData, value: any) => {
    setEventData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketTypeForm, value: any) => {
    setTicketTypes(prev =>
      prev.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  const addTicketType = () => {
    setTicketTypes(prev => [
      ...prev,
      {
        name: '',
        description: '',
        price: 0,
        totalQuantity: 100,
        maxPerOrder: 10,
        saleStartDate: eventData.startDate,
        saleEndDate: eventData.startDate,
        benefits: []
      }
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const eventPayload: CreateEventData = {
        ...eventData,
        tags: eventData.tags.filter(tag => tag.trim())
      };

      const createdEvent = await api.events.create(eventPayload);
      
      // Create ticket types for the event
      for (const ticketType of ticketTypes) {
        await api.tickets.createType({
          ...ticketType,
          eventId: createdEvent.id,
          benefits: ticketType.benefits.filter(benefit => benefit.trim())
        });
      }

      router.push(`/admin/events/${createdEvent.id}`);
    } catch (error
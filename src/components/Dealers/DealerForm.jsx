import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Button, Select,ModalContainer } from '../index'; 
import { useDealer } from '../../contexts/DealerContext';
import { selectUser } from '../../features/user/userSlice';
import dealerService from '../../firebase/dealers';
import toast from 'react-hot-toast';
import {setDealersStatus } from '../../features/dealers/dealersSlice';
import { useDispatch, useSelector } from 'react-redux';

function DealerForm({onSuccess}) {
  const { isDealerModalOpen, dealerToEdit, closeDealerModal } = useDealer();
  const { register, handleSubmit, control,reset, watch, setValue, formState: { errors } } = useForm({
  defaultValues: dealerToEdit || { status: 'Active' },
  shouldUnregister: true,
  });
  const dispatch = useDispatch();
  const userData = useSelector(selectUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedStateCode = watch('state');
  const [allIndianStates, setAllIndianStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [error, setError] = useState('');
  
  const loadStates = async (countryCode) => {
      const { State } = await import("country-state-city");
      return State.getStatesOfCountry(countryCode);
    };
    const loadCities = async (countryCode,stateCode) => {
      const { City } = await import("country-state-city");
      return City.getCitiesOfState(countryCode, stateCode);
    };
    
  
    useEffect(() => {
    if (isDealerModalOpen){
      loadStates("IN").then(setAllIndianStates)
      if (dealerToEdit) {
        reset(dealerToEdit);
        const countryCode = 'IN'; // Assuming a fixed country code for now
        const stateData = allIndianStates.find(
          (s) => s.isoCode === dealerToEdit.state
        );
        if (stateData) {
          loadCities(countryCode, stateData.isoCode).then(setDistricts);
          setValue('district', dealerToEdit.district, { shouldValidate: true });
        }
      } 
      }
      else{
        reset({ status: 'Active' });
      }
  }, [isDealerModalOpen, dealerToEdit, reset, setValue]);

    selectedStateCode ? loadCities('IN', selectedStateCode).then(setDistricts) : [];
    // const allIndianStates = loadStates('IN');
    

    useEffect(() => {
      if (dealerToEdit && districts.length > 0) {
        const defaultDistrict = districts.find(d => d.name == dealerToEdit.district);
        if (defaultDistrict) {
        setValue('district', defaultDistrict.name, { shouldDirty: true, shouldValidate: true });
        }
        else{
          setValue('district', '-- Select District --')
        }
      }
      
    }, [selectedStateCode, dealerToEdit, setValue]);


  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(dealerToEdit ? 'Updating dealer...' : 'Registering a dealer...');
    const transformedData = {
        ...data,
        state: allIndianStates.find(s => s.isoCode === data.state)?.name.toUpperCase(),
        district: data.district.toUpperCase(),
        trade_name: data.trade_name.toUpperCase()
      };
    try {
        if (dealerToEdit) {
          await dealerService.updateDealer(dealerToEdit.id, transformedData);
          toast.success('Dealer updated successfully!');
        } else {
          await dealerService.addDealer(transformedData, userData);
          toast.success('Dealer registered successfully!');
        }
      if (onSuccess) {
        onSuccess(transformedData);
      } else {
        closeDealerModal();
      }
      dispatch(setDealersStatus("idle"))
    } catch (error) {
      console.error('Dealer Form error:', error);
      setError(`Dealer Form error: ${error}`)
      toast.error(error.message || 'Failed to process Dealer');
    } finally {
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

    if (!isDealerModalOpen) return null;

  return (
    <ModalContainer isOpen={isDealerModalOpen} onClose={closeDealerModal} className='max-w-2xl !p-0'>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{dealerToEdit ? 'Edit Dealer' : 'Register New Dealer'}</h2>
        <p className="text-green-100">{dealerToEdit ? 'Edit Dealer' : 'Register New Dealer'} for creating performa invoices, post booking requests, etc</p>
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <Input label="Dealer Trade Name" required {...register('trade_name', { required: 'Trade/Firm name is required' })} error={errors.trade_name?.message}  />
          </div>
          <div>
              <Input label="GST No." required {...register('gst_no', { required: 'GST no. is required' })} error={errors.gst_no?.message} />
          </div>
          <div>
              <Input label="Contact Person" required {...register('contact_person', { required: 'Contact person name is required' })} error={errors.contact_person?.message} />
          </div>
          <div>
              <Input label="Contact Number" required type="tel" {...register('contact_number', { required: 'Dealer contact number is required' })} error={errors.contact_number?.message}/>
          </div>
          <Input label="Email Address" type="email" {...register('email')} error={errors.phone?.message} />
          <Input label="Pincode" type="text" {...register('pincode', { required: 'Dealer pincode is required' })} error={errors.pincode?.message} />
        </div>
          <Controller
              name="state"
              control={control}
              rules={{ required: 'Please select dealer state',
                      validate: value => value !== '-- Select State --' || 'Please select dealer state' }}
              render={({ field }) => (
              <Select
                  placeholder="-- Select State --"
                  {...field}
                  required
                  defaultValue="-- Select State --"
                  options={allIndianStates.map(state => ({value: state.isoCode, name: state.name}))}
                  error={errors.state?.message}
              />
              )}
          />
          <Controller
              name="district"
              control={control}
              required
              rules={{ required: 'Please select dealer District',
                      validate: value => value !== '-- Select District --' || 'Please select dealer district' }}
              render={({ field }) => (
              <Select
                  placeholder="-- Select District --"
                  {...field}
                  disabled={!selectedStateCode}
                  defaultValue="-- Select District --"
                  options={districts.map(district => ({value: district.isoCode, name: district.name}))}
                  error={errors.district?.message}
              />
              )}
          />
        <Input as="textarea" label="Full Address" {...register('address', {required: 'Dealer address is required'})} error={errors.address?.message}/>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant='secondary' disabled={isSubmitting} className='!w-full' onClick={closeDealerModal}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (dealerToEdit ? 'Update Dealer' : 'Register Dealer')}</Button>
        </div>
      </form>
    </ModalContainer>
  );
}

export default DealerForm;

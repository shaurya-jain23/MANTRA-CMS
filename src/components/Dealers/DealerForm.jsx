import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Button, Select,ModalContainer } from '../index'; 

function DealerForm({ dealerToEdit, onSubmit, onCancel, isOpen }) {
    const { register, handleSubmit, control,reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: dealerToEdit || { status: 'Active' },
    shouldUnregister: true,
    });

    const selectedStateCode = watch('state');
    const [allIndianStates, setAllIndianStates] = useState([])
    const [districts, setDistricts] = useState([])

    const loadStates = async (countryCode) => {
      const { State } = await import("country-state-city");
      return State.getStatesOfCountry(countryCode);
    };
    const loadCities = async (countryCode,stateCode) => {
      const { City } = await import("country-state-city");
      return City.getCitiesOfState(countryCode, stateCode);
    };

  
    useEffect(() => {
    if (isOpen){
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
  }, [isOpen, dealerToEdit, reset, setValue]);

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

//   useEffect(() => {
//     const pincode = watch('pincode');
//     if (pincode && /^[1-9][0-9]{5}$/.test(pincode)) {
//       fetch(`https://api.postalpincode.in/pincode/${pincode}`)
//         .then(res => res.json())
//         .then(data => {
//           if (data && data[0].Status === 'Success') {
//             const postOffice = data[0].PostOffice[0];
//             setValue('state', postOffice.State);
//             setValue('district', postOffice.District);
//           }
//         });
//     }
//   }, [watch('pincode'), setValue]);

  return (
    <ModalContainer isOpen={isOpen} className='max-w-2xl'>
      <h2 className="text-2xl font-bold mb-6">{dealerToEdit ? 'Edit Dealer' : 'Register New Dealer'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <Input label="Dealer Trade Name" required {...register('trade_name', { required: 'Trade/Firm name is required' })} />
              {errors.trade_name && <p className="text-sm text-red-500">{errors.trade_name.message}</p>}
          </div>
          <div>
              <Input label="GST No." required {...register('gst_no', { required: 'GST no. is required' })} />
              {errors.gst_no && <p className="text-sm text-red-500">{errors.gst_no.message}</p>}
          </div>
          <div>
              <Input label="Contact Person" required {...register('contact_person', { required: 'Contact person name is required' })} />
              {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person.message}</p>}
          </div>
          <div>
              <Input label="Contact Number" required type="tel" {...register('contact_number', { required: 'Dealer contact number is required' })} />
              {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number.message}</p>}
          </div>
          <Input label="Email Address" type="email" {...register('email')} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          <Input label="Pincode" type="text" {...register('pincode')} />
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
              />
              )}
          />
          {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
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
              />
              )}
          />
          {errors.district && <p className="text-sm text-red-500">{errors.district.message}</p>}
        <Input as="textarea" label="Full Address" {...register('address')} />
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" onClick={onCancel} bgColor="bg-gray-500">Cancel</Button>
          <Button type="submit">{dealerToEdit ? 'Update Dealer' : 'Register Dealer'}</Button>
        </div>
      </form>
    </ModalContainer>
  );
}

export default DealerForm;

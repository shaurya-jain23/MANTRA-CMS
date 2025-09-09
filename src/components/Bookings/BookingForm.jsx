import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../features/user/userSlice';
import dealerService from '../../firebase/dealers';
import containerService from '../../firebase/container';
import { Input, Button, ModalContainer,Select, CheckBox } from '../index';
import { setBookingsStatus } from "../../features/bookings/bookingsSlice";

function BookingFormModal({ container, onSubmit, onCancel, isOpen, bookingToEdit }) {
    const dispatch = useDispatch();
  const [dealers, setDealers] = useState([]);
  const userData = useSelector(selectUser);
  const userRole = userData?.role;
  const isAdmin = userRole === 'admin' || userRole === 'superuser';
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({});
  const [transportIncluded, settransportIncluded] = useState(true);
  const eta = container?.eta?.seconds ? new Date(container.eta.seconds * 1000).toLocaleDateString() :'N/A';
  const {register, handleSubmit ,control,reset, setValue ,watch,formState: { errors },} = useForm({
        defaultValues:  bookingToEdit || { 
            transport: { included: 'true', charges: 0 }
        },
  });

    useEffect(() => {
        reset(bookingToEdit || { status: 'Active' });
    }, [bookingToEdit, reset]);

    useEffect(()=> {
        const subscription = watch((value, {name})=> {
            if(name === 'dealerId'){
                setValue('placeOfDelivery', dealers.find(d => d.id === value.dealerId)?.district || '')
            }
        })
        return () =>{
            subscription.unsubscribe()
        }
    }, [watch, setValue, dealers])

    const goToPreview = (data) => {
        setFormData(data);
        setStep(2)
    };
    const goBackToForm = () => setStep(1);

    const transport = watch('transport.included');
    useEffect(() => settransportIncluded(transport === 'true' || transport === true), [transport]);


    useEffect(() => {
        if (userData?.uid) {
            dealerService.getDealers(userData.uid, userData.role).then(setDealers);
        }
    }, [userData]);

    const handleFormSubmit = () => {
        dispatch(setBookingsStatus("idle"))
        if(bookingToEdit) onSubmit(formData);
        else{
        const bookingData = {
            ...formData,
            containerId: container.id,
            registeredBy: userData.uid,
            requested_by_name: userData.displayName
        };
        onSubmit(bookingData);
        }
    };

  return (
        <ModalContainer isOpen={isOpen} title="Book Container" className='max-w-4xl'>
            {step === 1 && (
            <>
                <h2 className="text-2xl font-bold mb-2">Book Container</h2>
                <p className="text-lg font-semibold text-blue-600 mb-2">{container?.container_no}</p>
                <div className="mb-2 p-4 bg-gray-50 rounded-sm shadow-sm">
                <h3 className="font-medium text-md mb-3">Container Details</h3>
                <div className="flex flex-wrap sm:gap-4 md:gap-y-2 md:gap-x-6 text-sm">
                    {isAdmin && 
                        <>
                            <p><strong className="text-gray-600">Company:</strong> {container?.company_name}</p>
                            <p><strong className="text-gray-600">Status:</strong> {container?.status}</p>
                        </>
                    }
                    <p><strong className="text-gray-600">Model:</strong> {container?.model}</p>
                    <p><strong className="text-gray-600">Specifications:</strong> {container?.specifications}</p>
                    <p><strong className="text-gray-600">Quantity:</strong> {container?.qty}</p>
                    <p><strong className="text-gray-600">ETA:</strong>{eta}</p>
                    <p><strong className="text-gray-600">Status:</strong> {container?.status}</p>
                    <p><strong className="text-gray-600">Port:</strong> {container?.port}</p>
                </div>
                </div>
                <form onSubmit={handleSubmit(goToPreview)} className="space-y-4">
                    <Controller
                        name="dealerId"
                        control={control}
                        rules={{ required: 'Please select a dealer',
                                validate: value => value !== '-- Select Dealer --' || 'Please select dealer state' }}
                        render={({ field }) => (
                        <Select
                            placeholder="-- Select Dealer --"
                            {...field}
                            required
                            defaultValue="-- Select Dealer --"
                            options={dealers.map(d => ({value: d.id, name: d.trade_name}))}
                        />
                        )}
                    />
                {errors.dealerId && <p className="text-red-500 text-sm">{errors.dealerId.message}</p>}
                <div className="flex w-full gap-5">
                <Input
                    label="Price per Piece (₹): "
                    placeholder="Price per Piece of Container"
                    type="number"
                    required
                    className=""
                    {...register('pricePerPiece', { required: true, valueAsNumber: true })}
                />
                {errors.pricePerPiece && <p className="text-red-500 text-sm">{errors.pricePerPiece.message}</p>}
                
                <Input
                    label="Place of Delivery: "
                    placeholder="Place of Delivery"
                    type="text"
                    required
                    className=""
                    {...register('placeOfDelivery', { required: true})}
                    // onInput={(e) => {
                    //     setValue("placeOfDelivery", (e.currentTarget.value));
                    // }}
                />
                </div>
                
                {errors.placeOfDelivery && <p className="text-red-500 text-sm">{errors.placeOfDelivery.message}</p>}
                <div className="space-y-2">
                    <label className="font-normal text-md">Freight Charges</label>
                    <div className="flex items-center mt-2">
                    <input
                        type="radio"
                        id="transportYes"
                        {...register('transport.included')}
                        value='true'
                    />
                    <label htmlFor="transportYes" className="ml-2">
                        Included in Price
                    </label>
                    </div>
                    <div className="flex items-center mt-1">
                    <input
                        type="radio"
                        id="transportNo"
                        {...register('transport.included')}
                        value='false'
                    />
                    <label htmlFor="transportNo" className="ml-2">
                        Extra Charges
                    </label>
                    </div>
                    {!transportIncluded && (
                    <Input
                        label="Transport Charges (₹)"
                        type="number"
                        className="!w-1/4"
                        {...register('transport.charges', { valueAsNumber: true })}
                    />
                    )}
                </div>
                <div className="flex items-center space-x-6">
                    <label className="font-semibold">Extras:</label>
                    <div className="flex items-center">
                    <input type="checkbox" {...register('withBattery')} />
                    <span className="ml-2">Battery</span>
                    </div>
                    <div className="flex items-center">
                    <input type="checkbox" {...register('withCharger')} />
                    <span className="ml-2">Charger</span>
                    </div>
                    <div className="flex items-center">
                    <input type="checkbox" {...register('withTyre')} />
                    <span className="ml-2">Tyre</span>
                    </div>
                </div>

                <Input as="textarea" label="Remarks" {...register('remarks')} />

                <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" onClick={onCancel} bgColor="bg-gray-500">
                    Cancel
                    </Button>
                    <Button type="submit">Submit Request</Button>
                </div>
                </form>
            </>
            )}
            {step === 2 && (
                <div>
                    <h2 className="text-2xl font-bold mb-2">Confirm Your Booking</h2>
                    <p className="text-lg font-semibold text-blue-600 mb-4">{container?.container_no}</p>
                    <div className="mb-2 p-4 bg-gray-50 rounded-sm shadow-sm">
                        <h3 className="font-medium text-md mb-3">Booking Details</h3>
                        <div className="flex flex-wrap sm:gap-4 md:gap-y-2 md:gap-x-6 text-sm mb-2">
                            {isAdmin && 
                                <>
                                    <p><strong className="text-gray-600">Company:</strong> {container?.company_name}</p>
                                    <p><strong className="text-gray-600">Status:</strong> {container?.status}</p>
                                </>
                            }
                            <p><strong className="text-gray-600">Model:</strong> {container?.model}</p>
                            <p><strong className="text-gray-600">Specifications:</strong> {container?.specifications}</p>
                            <p><strong className="text-gray-600">Quantity:</strong> {container?.qty}</p>
                            <p><strong className="text-gray-600">ETA:</strong>{eta}</p>
                            <p><strong className="text-gray-600">Port:</strong> {container?.port}</p>
                        </div>
                        <div className='flex flex-col md:flex-row gap-1.5 flex-wrap sm:gap-4 md:gap-x-6 md:gap-y-2'>
                            <p className="text-sm text-gray-600"><strong>Dealer:</strong> {dealers.find(d => d.id === formData.dealerId)?.trade_name}</p>
                            <p className="text-sm text-gray-600"><strong>Place of Delivery:</strong> {formData.placeOfDelivery}</p>
                            <p className="text-sm text-gray-600"><strong>Price:</strong> ₹{formData.pricePerPiece}/psc</p>
                            <p className="text-sm text-gray-600"><strong>Freight:</strong> {formData.transport.included === 'true' ? 'Included' : `₹${formData.transport.charges} Extra`}</p>
                            <p className="text-sm text-gray-600">
                                {formData.withBattery || formData.withCharger || formData.withTyre ? (<strong>Extras:</strong>
                                ) : (
                                <strong>No Extras</strong>
                                )} 
                                {' '}
                                {formData.withBattery ? 'With Battery' : ''} {formData.withCharger ? 'With Charger' : ''} {formData.withTyre ? 'With Tyre' : ''} 
                            </p>
                            <p className="text-sm text-gray-500 w-full">Remarks: {formData.remarks || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" onClick={goBackToForm} bgColor="bg-gray-500">Back to Edit</Button>
                    <Button type="button" onClick={handleFormSubmit}>Confirm & Submit</Button>
                    </div>
                </div>
            )}
        </ModalContainer>
  );
}

export default BookingFormModal;

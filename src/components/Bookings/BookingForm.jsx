import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { selectUser } from '../../features/user/userSlice';
import {
  selectAllDealers,
  selectDealersStatus,
  fetchDealers,
} from '../../features/dealers/dealersSlice';
import { setBookingsStatus } from '../../features/bookings/bookingsSlice';
import { ModalContainer, Input, Button, Select, FormStepper as Stepper } from '../index';
import bookingService from '../../firebase/bookings';
import { useDealer } from '../../contexts/DealerContext';
import { parseISO, format, isValid } from 'date-fns';
import {
  Battery,
  Zap,
  Circle,
  ArrowRight,
  ArrowLeft,
  Package,
  FileText,
  ShieldCheck,
  IndianRupee,
  MapPinned,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  calculatePaymentStatus,
  getPaymentStatusColor,
  accessoryOptions,
} from '../../assets/utils';

const ContainerDetails = ({ container }) => {
  let processed = (c) => {
    let dateObject;
    if (c.eta?.seconds) {
      let isoString = new Date(c.eta.seconds * 1000).toISOString();
      dateObject = parseISO(isoString);
      if (!isValid(dateObject)) dateObject = 'N/A';
    } else {
      dateObject = c.eta;
    }
    return { ...c, eta: dateObject };
  };
  const processedContainer = processed(container);
  const eta = processedContainer.eta ? format(processedContainer.eta, 'dd-MMM') : 'N/A';

  const details = [
    { label: 'Container No.', value: container?.container_no },
    { label: 'Model', value: container?.model },
    { label: 'ETA', value: eta },
    { label: 'Specifications', value: container?.specifications },
    { label: 'Quantity', value: container?.qty },
    { label: 'Status', value: container?.status },
    { label: 'Port', value: container?.port },
  ];

  return (
    <div className="bg-white border-r border-gray-200 p-6 w-full md:w-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Container Details</h3>
      <div className="md:space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 md:gap-0">
        {details.map((detail, index) => (
          <div
            key={index}
            className="border-b border-gray-100 pb-1 md:pb-3 last:border-b-0 flex gap-2 md:gap-0 items-center md:items-start flex-row md:flex-col"
          >
            <div className="text-base md:text-sm font-medium text-gray-600 md:mb-1">
              {detail.label}
            </div>
            <div className="text-base font-semibold text-gray-900">{detail.value || 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};



const Step1BookingDetails = ({ register, control, errors, dealers, watch, handleDealerChange }) => {
  const transportIncluded =
    watch('transport.included') === 'true' || watch('transport.included') === true ? true : false;

  return (
    <div className="space-y-6">
      <div className="">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h3>
        <div className="flex flex-col gap-2">
          <Controller
            name="dealerId"
            control={control}
            rules={{
              required: 'Please select a dealer',
              validate: (value) => value !== '-- Select Dealer --' || 'Please select dealer',
            }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="-- Select Dealer --"
                defaultValue="-- Select Dealer --"
                label="Dealer Selection"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add_new__') {
                    handleDealerChange(value);
                  } else {
                    field.onChange(e);
                    handleDealerChange(value);
                  }
                }}
                required
                addOptionText="+ Add New Dealer"
                outerClasses="w-full"
                showAddOption={true}
                options={dealers.map((d) => ({ value: d.id, name: d.trade_name }))}
                error={errors.dealerId?.message}
              />
            )}
          />
          {dealers.length === 0 && (
            <div className="mt-3 p-4 flex flex-wrap gap-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">No dealers found:</span>
              </div>
              <p className="text-sm text-yellow-700 ">
                Use the dropdown above to add your first dealer.
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="space-y-4 flex-col flex justify-between">
            <Input
              placeholder="Enter delivery place"
              required
              icon={MapPinned}
              label="Place of Delivery"
              {...register('placeOfDelivery', { required: 'Delivery place is required' })}
              error={errors.placeOfDelivery?.message}
            />
            <div className="flex items-center gap-4 py-3">
              <label className="font-medium text-gray-700">Transport Included</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('transport.included')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <div className="space-y-4 flex gap-4 lg:gap-0 flex-col-reverse lg:flex-col">
            <Input
              type="number"
              label="Price per Piece (₹)"
              required
              icon={IndianRupee}
              placeholder="Enter price per piece"
              {...register('pricePerPiece', {
                required: 'Price/psc is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Price must be greater than 0' },
              })}
              error={errors.pricePerPiece?.message}
            />
            {!transportIncluded && (
              <Input
                label="Transport Charges (₹)"
                type="number"
                icon={IndianRupee}
                required={!transportIncluded}
                placeholder="Enter transport charges"
                {...register('transport.charges', { valueAsNumber: true })}
                error={errors.transport?.charges?.message}
              />
            )}
          </div>
        </div>
        <div className="mt-4">
          <Input
            as="textarea"
            label="Remarks"
            rows={3}
            placeholder="Add any additional notes here..."
            {...register('remarks')}
          />
        </div>
      </div>
    </div>
  );
};

const AddonCard = ({
  title,
  icon: Icon,
  register,
  watch,
  Field,
  errors,
  setValue,
  showIncludedInPrice = false,
}) => {
  const includedField = `${Field}.included`;
  const quantityField = `${Field}.quantity`;
  const priceField = `${Field}.price`;
  const typeField = `${Field}.type`;
  const camelCasedField = Field.charAt(0).toUpperCase() + Field.slice(1).toLowerCase();
  const priceIncludedField = `${Field}.price_included`;
  const isIncluded = watch(includedField);
  const ispriceIncluded = watch(priceIncludedField);

  useEffect(() => {
    if (setValue && !isIncluded) {
      setValue(quantityField, 0);
      setValue(priceField, 0);
      setValue(priceIncludedField, false);
    }
  }, [isIncluded, setValue, quantityField, priceField, priceIncludedField]);

  // Use another useEffect to reset price if price is included
  useEffect(() => {
    if (setValue && ispriceIncluded) {
      setValue(priceField, 0);
    }
  }, [ispriceIncluded, setValue, priceField]);

  // const quantity = watch(`${Field}.included`) || 0;
  // const price = watch(`${Field}.included`) || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="text-blue-600" size={24} />
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" {...register(includedField)} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {isIncluded ? 'With' : 'Without'}
          </span>
        </label>
      </div>

      {isIncluded && showIncludedInPrice && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <Input
            type="number"
            label="Quantity (psc)"
            placeholder="Enter quantity"
            {...register(quantityField, {
              required: isIncluded && 'Quantity is required',
              min: { value: 1, message: 'Quantity must be greater than 0' },
              valueAsNumber: true,
            })}
            className="w-full"
            error={errors[Field]?.quantity?.message}
          />
          <Input
            type="number"
            label="Price per Unit (₹)"
            disabled={ispriceIncluded}
            placeholder="Enter price"
            {...register(priceField, {
              required: isIncluded && !ispriceIncluded && 'Price is required',
              min: !ispriceIncluded && { value: 1, message: 'Price must be greater than 0' },
              valueAsNumber: true,
            })}
            className="w-full"
            error={errors[Field]?.price?.message}
          />
          <Select
            label={`${camelCasedField} Type`}
            outerClasses="md:col-span-2"
            placeholder={`-- Select ${camelCasedField} --`}
            defaultValue={`-- Select ${camelCasedField} --`}
            options={accessoryOptions[Field]?.options}
            {...register(typeField, {
              required: isIncluded && `${camelCasedField} type is required`,
              validate: (value) =>
                value !== `-- Select ${camelCasedField} --` || `Please select ${Field} description`,
            })}
            className="w-full"
            error={errors[Field]?.type?.message}
          />
          <div className="col-span-1 md:col-span-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register(`${priceIncludedField}`)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Included in Main Price</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

const Step2Addons = ({ register, watch, errors, setValue }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Add-ons</h3>
      <div className="space-y-4">
        <AddonCard
          title="Battery"
          icon={Battery}
          register={register}
          watch={watch}
          setValue={setValue}
          Field="battery"
          errors={errors}
          showIncludedInPrice={true}
        />

        <AddonCard
          title="Charger"
          icon={Zap}
          register={register}
          watch={watch}
          setValue={setValue}
          Field="charger"
          errors={errors}
          showIncludedInPrice={true}
        />
        <AddonCard
          title="Tyre"
          icon={Circle}
          register={register}
          watch={watch}
          Field="tyre"
          errors={errors}
          showIncludedInPrice={false}
        />
        <AddonCard
          title="Assembling"
          icon={Wrench}
          register={register}
          watch={watch}
          Field="assembling"
          errors={errors}
          showIncludedInPrice={false}
        />
      </div>
    </div>
  );
};

const PaymentSection = ({ register, watch, grandTotal, isEditMode = false, setValue }) => {
  const amountPaid = watch('payment.amountPaid') || 0;
  const paymentStatus = calculatePaymentStatus(amountPaid, grandTotal);

  useEffect(() => {
    setValue('payment.status', paymentStatus, { shouldValidate: false });
  }, [paymentStatus, setValue]);

  return (
    <div className="mt-2">
      <h4 className="font-semibold text-gray-900 mb-4">Payment Information</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="number"
          icon={IndianRupee}
          label="Amount Paid (₹)"
          placeholder="Enter amount paid"
          {...register('payment.amountPaid', {
            valueAsNumber: true,
            required: 'Amount paid is required',
            min: { value: 0, message: 'Amount cannot be negative' },
            max: { value: grandTotal, message: 'Amount cannot exceed grand total' },
          })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <div
            className={`px-3 py-2 flex justify-between text-sm rounded-md border ${getPaymentStatusColor(paymentStatus)}`}
          >
            <div className="font-semibold">{paymentStatus}</div>
            <div className="">
              Paid: ₹{amountPaid.toLocaleString()} / ₹{grandTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Input
          as="textarea"
          label="Payment Notes"
          rows={1}
          placeholder="Add payment notes or transaction details..."
          {...register('payment.notes')}
        />
      </div>
    </div>
  );
};

const Step3Confirmation = ({
  formData,
  dealers,
  container,
  register,
  watch,
  bookingToEdit,
  setValue,
}) => {
  const dealer = dealers.find((d) => d.id === formData.dealerId);

  const batteryIncluded = formData.battery?.included;
  const chargerIncluded = formData.charger?.included;
  const tyreIncluded = formData.tyre?.included;
  const assembleIncluded = formData.assembling?.included;

  const chargerPriceIncluded = formData.charger?.price_included;
  const batteryPriceIncluded = formData.battery?.price_included;
  const pricePerPiece = formData.pricePerPiece || 0;
  const batteryPrice = formData.battery?.price || 0;
  const batteryQty = formData.battery?.quantity || 0;
  const batteryType = formData.battery?.type?.split(/[-_ ]/).join(' ').toLowerCase() || 'NILL';
  const chargerPrice = formData.charger?.price || 0;
  const chargerQty = formData.charger?.quantity || 0;
  const chargerType = formData.charger?.type?.split(/[-_ ]/).join(' ').toLowerCase() || 'NILL';
  const transport =
    formData.transport?.included === 'true' || formData.transport?.included === true
      ? 'Included'
      : `₹ ${formData.transport?.charges || 0}`;
  const transportCharges =
    formData.transport?.included === 'true' || formData.transport?.included === true
      ? 0
      : formData.transport?.charges || 0;
  // Calculate totals
  const subtotal = pricePerPiece * (container?.qty || 0);
  const batteryTotal = formData.battery?.included ? batteryPrice * batteryQty : 0;
  const chargerTotal = formData.charger?.included ? chargerPrice * chargerQty : 0;
  const grandTotal = subtotal + batteryTotal + chargerTotal + transportCharges;

  useEffect(() => {
    const totals = {
      subtotal,
      batteryTotal,
      chargerTotal,
      transportCharges,
      grandTotal,
    };
    setValue('totals', totals, { shouldValidate: false });
  }, [subtotal, batteryTotal, chargerTotal, transportCharges, grandTotal, setValue]);

  return (
    <div className="space-y-6">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Booking</h3>
        <p className="text-gray-600 mb-6">
          Please review the details below before confirming the booking.
        </p>

        {/* Dealer and Price in table format */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600 mb-1">Dealer</div>
            <div className="font-semibold text-gray-900">{dealer?.trade_name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Price per Piece (Scooter)</div>
            <div className="font-semibold text-gray-900">₹{pricePerPiece}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Freight</div>
            <div className="font-semibold text-gray-900">{transport}</div>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Add-ons</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Battery</div>
                {batteryIncluded && (
                  <div className="text-sm text-gray-600">
                    Quantity: {batteryQty} psc | {batteryType} | Unit Price:{' '}
                    {batteryPriceIncluded ? 'Included in Main Price' : `₹${batteryPrice}`}
                  </div>
                )}
              </div>
              <div className="text-gray-900">
                {batteryIncluded
                  ? batteryPriceIncluded
                    ? 'Included'
                    : `₹${batteryTotal.toLocaleString()}`
                  : 'Without'}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Charger</div>
                {chargerIncluded && (
                  <div className="text-sm text-gray-600">
                    Quantity: {chargerQty} psc | {chargerType} | Unit Price:{' '}
                    {chargerPriceIncluded ? 'Included in Main Price' : `₹${chargerPrice}`}
                  </div>
                )}
              </div>
              <div className="text-gray-900">
                {chargerIncluded
                  ? chargerPriceIncluded
                    ? 'Included'
                    : `₹${chargerTotal.toLocaleString()}`
                  : 'Without'}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="font-medium text-gray-900">Tyre</div>
              <div className="text-gray-900">{tyreIncluded ? 'With' : 'Without'}</div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="font-medium text-gray-900">Assembling</div>
              <div className="text-gray-900">{assembleIncluded ? 'With' : 'Without'}</div>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        {formData.remarks && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Remarks</h4>
            <div className="">
              <p className="text-gray-500 text-sm leading-relaxed">{formData.remarks}</p>
            </div>
          </div>
        )}

        {/* Grand Total */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-blue-900">Grand Total</span>
            <span className="text-2xl font-bold text-blue-700">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
        <PaymentSection
          register={register}
          watch={watch}
          grandTotal={grandTotal}
          isEditMode={!!bookingToEdit}
          setValue={setValue}
        />
      </div>
    </div>
  );
};

// Main Component
function BookingFormModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    isBookingModalOpen,
    selectedContainer: container,
    bookingToEdit,
    closeBookingModal,
  } = useBooking();

  const userData = useSelector(selectUser);
  const dealersStatus = useSelector(selectDealersStatus);
  const dealersData = useSelector(selectAllDealers);
  // const isAdmin = userRole === 'admin' || userRole === 'superuser';
  const [dealers, setDealers] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const steps = [
    { number: 1, title: 'Booking Details', icon: FileText },
    { number: 2, title: 'Add-ons', icon: Package },
    { number: 3, title: 'Confirm', icon: ShieldCheck },
  ];

  const { openDealerModal } = useDealer();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      transport: { included: true, charges: 0 },
      battery: { included: false, quantity: undefined, price: undefined, price_included: false },
      charger: { included: false, quantity: undefined, price: undefined, price_included: false },
      tyre: { included: false, price_included: true },
      assembling: { included: false, price_included: true },
      payment: { amountPaid: 0, notes: '', status: 'not_received' },
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      reset(
        bookingToEdit || {
          transport: { included: true, charges: 0 },
          battery: {
            included: false,
            quantity: undefined,
            price: undefined,
            price_included: false,
          },
          charger: {
            included: false,
            quantity: undefined,
            price: undefined,
            price_included: false,
          },
          tyre: { included: false, price_included: true },
          assembling: { included: false, price_included: true },
          payment: { amountPaid: 0, notes: '', status: 'not_received' },
        }
      );
      setStep(1);
      setFormData({});
    }
  }, [isBookingModalOpen, bookingToEdit, reset]);

  useEffect(() => {
    if (dealersStatus === 'idle') {
      dispatch(fetchDealers({ role: userData?.role, userId: userData?.uid }));
    }
    if (dealersStatus === 'succeeded') {
      setDealers(dealersData);
    }
    if (dealersStatus === 'failed') {
      setError('Failed to fetch dealers.');
    }
  }, [dealersStatus, dispatch, userData]);

  // Watch form values
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'dealerId') {
        setValue('placeOfDelivery', dealers.find((d) => d.id === value.dealerId)?.district || '');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, setValue, dealers]);

  const handleDealerChange = (value) => {
    if (value === '__add_new__') {
      // Open dealer modal and set a callback to refresh dealers
      openDealerModal(null, {
        onSuccess: () => {
          dispatch(fetchDealers({ role: userData?.role, userId: userData?.uid }));
        },
      });
      // Reset the select value
      setValue('dealerId', '-- Select Dealer --');
    } else {
      setValue('dealerId', value);
    }
  };

  const validateStep1 = async () => {
    const fields = ['dealerId', 'pricePerPiece', 'placeOfDelivery'];
    const isValid = await trigger(fields);
    return isValid;
  };

  const validateStep2 = async () => {
    const Fields = [];
    const batteryFields = ['battery.quantity', 'battery.price'];
    const chargerFields = ['charger.price', 'charger.quantity'];
    return true;
  };

  const goToNextStep = async (data) => {
    if (step === 1) {
      const isValid = await validateStep1();
      if (!isValid) {
        setError('Complete the Booking Details');
        return;
      }
    } else if (step === 2) {
      const isValid = await validateStep2();
      if (!isValid) return;
    }
    setError('');
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };

  const goToPrevStep = () => {
    setStep(step - 1);
  };

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading(bookingToEdit ? 'Updating booking...' : 'Creating booking...');
    try {
      const finalData = { ...formData, ...data };
      let finalBookingData;
      if (bookingToEdit) {
        const { container, dealer, ...bookingData } = formData;
        await bookingService.updateBooking(bookingToEdit.id, bookingData);
        finalBookingData = { ...bookingToEdit, ...finalData };
        toast.success('Booking updated successfully!');
      } else {
        const bookingId = await bookingService.getBookingId();
        finalBookingData = {
          ...finalData,
          booking_id: bookingId,
          containerId: container.id,
          registeredBy: userData.uid,
          requested_by_name: userData.displayName,
        };
        await bookingService.createBooking(finalBookingData);
        const dealer = dealers.find((d) => d.id === finalData.dealerId);
        // const dealer = await dealerService.getDealerById(finalData.dealerId);
        await bookingService.updateContainerStatus(
          container.id,
          'Pending Approval',
          dealer.trade_name
        );
        toast.success('Booking created successfully!');
      }
      closeBookingModal();
      dispatch(setBookingsStatus('idle'));
      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      setError(`Booking error: ${error}`);
      toast.error(error.message || 'Failed to process booking');
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };

  if (!isBookingModalOpen) return null;

  return (
    <ModalContainer
      isOpen={isBookingModalOpen}
      onClose={closeBookingModal}
      className="max-w-6xl h-fit !p-0"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar - Container Details */}
        <ContainerDetails container={container} />

        {/* Right Content - Form */}
        <div className="flex-1 flex flex-col min-h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">
              {bookingToEdit ? 'Edit Booking' : 'Book Container'}
            </h2>
            <p className="text-blue-100">Follow the steps to book the container.</p>
          </div>

          <div className="flex-1 p-6">
            <Stepper steps={steps} currentStep={step} />
            <form
              onSubmit={handleSubmit(step === 3 ? handleFormSubmit : goToNextStep)}
              className=""
            >
              {step === 1 && (
                <Step1BookingDetails
                  register={register}
                  control={control}
                  errors={errors}
                  dealers={dealers}
                  watch={watch}
                  handleDealerChange={handleDealerChange}
                />
              )}

              {step === 2 && (
                <Step2Addons
                  register={register}
                  watch={watch}
                  errors={errors}
                  setValue={setValue}
                />
              )}

              {step === 3 && (
                <Step3Confirmation
                  formData={formData}
                  dealers={dealers}
                  container={container}
                  register={register}
                  watch={watch}
                  bookingToEdit={bookingToEdit}
                  setValue={setValue}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div>
                  <Button
                    type="button"
                    onClick={closeBookingModal}
                    variant="secondary"
                    className="rounded-full"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="flex gap-3">
                  {step > 1 && (
                    <Button
                      type="button"
                      onClick={goToPrevStep}
                      variant="secondary"
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-full"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-full"
                  >
                    {step === 3 ? (
                      <>
                        {isLoading ? 'Processing...' : 'Confirm Booking'}
                        <ShieldCheck size={16} />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default BookingFormModal;

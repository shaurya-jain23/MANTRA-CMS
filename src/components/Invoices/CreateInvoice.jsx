import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { selectUser } from '../../features/user/userSlice';
import { selectAllDealers, selectDealersStatus, fetchDealers } from '../../features/dealers/dealersSlice';
import { Input, Button, Select, Loading, Tooltip, CollapsibleSection } from '../index';
import InvoiceSummary from './InvoiceSummary';
import ItemRow from './ItemRow';
import PersistentSaveButton from './PersistentSaveButton';
import ProgressBar from './ProgressBar';
import toast from 'react-hot-toast';

function CreateInvoice({ piNumber, onSubmit, piToEdit = null }) {
  const { register, control, handleSubmit, watch, setValue, trigger, getValues,formState: { errors } } = useForm({
    defaultValues: piToEdit || {
      items: [{ qty: 0, unit_price: 0 }],
      transport: { included: 'true', charges: 0 },
      same_as_billing: true,
    },
  });

   const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const dispatch = useDispatch();
  // useSelectors: 
  const dealersStatus = useSelector(selectDealersStatus);
  const dealersData = useSelector(selectAllDealers);
  const userData = useSelector(selectUser);

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState("invoice");
  const sections = ['invoice', 'shipping', 'items', 'summary'];
  const [completedSections, setCompletedSections] = useState({
    invoice: false,
    shipping: false,
    items: false,
    summary: false
  });

  // const sections = [
  //   { number: 1, title: 'Invoice Details'},
  //   { number: 2, title: 'Billing & Shipping'},
  //   { number: 3, title: 'Item Details' },
  //   { number: 4, title: 'Summary & Terms'}
  // ];

  // Use useWatch only for UI-related values that need re-renders
  const sameAsBilling = useWatch({ control, name: 'same_as_billing' });
  const freightIncluded = useWatch({ control, name: 'transport.included' });
  const freightCharges = useWatch({ control, name: 'transport.charges' });


  const checkSectionCompletion = useCallback((section = null) => {
    const formValues = getValues();
    const items = formValues.items || [];

    const completion = {
      invoice: !!(piNumber && userData?.displayName),
      shipping: !!(formValues.dealerId && 
        formValues.billing?.district && 
        formValues.billing?.state && 
        formValues.billing?.address &&
        formValues.billing?.gst_no &&
        (formValues.same_as_billing || (
          formValues.shipping?.firm &&
          formValues.shipping?.district && 
          formValues.shipping?.state &&
          formValues.shipping?.address
        ))
      ),
      items: !!(items.length > 0 && 
        items.every(item => 
          item.model && 
          item.description && 
          item.qty > 0 && 
          item.unit_price > 0
        )
      ),
      summary: !!(formValues.delivery_terms && (formValues.delivery_terms !== '-- Delivery Days --'))
    };

    if (section) {
      return completion[section];
    } else {
      console.log(completion);
      
      setCompletedSections(completion);
      return completion;
    }
  }, [piNumber, userData, getValues]);
  
    // Fetch dealers - fixed useEffect
  useEffect(() => {
    if (dealersStatus === 'idle') {
      dispatch(fetchDealers({ role: userData?.role, userId: userData?.uid }));
    }
  }, [dealersStatus, dispatch, userData]);

  useEffect(() => {
    if (dealersStatus === 'succeeded') {
      setDealers(dealersData);
      setLoading(false);
      checkSectionCompletion('invoice');
    }
    if (dealersStatus === 'failed') {
      setError('Failed to fetch dealers.');
      setLoading(false);
    }
  }, [dealersStatus, dealersData]);

   // Side effects using subscription pattern (no re-renders)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      const dealer = dealers.find(d => d.id === value.dealerId);
      if (!dealer) return;

      if (name === 'dealerId' && value.dealerId) {
        if (dealer) {
          setValue('billing.address', `${dealer.address}, ${dealer.pincode}`);
          setValue('billing.gst_no', dealer.gst_no);
          setValue('billing.district', dealer.district);
          setValue('billing.state', dealer.state);
          
          if (value.same_as_billing) {
            setValue('shipping.firm', dealer.trade_name);
            setValue('shipping.district', dealer.district);
            setValue('shipping.state', dealer.state);
            setValue('shipping.address', `${dealer.address}, ${dealer.pincode}`);
          }
        }
        setTimeout(() => checkSectionCompletion(), 100);
      }
      if (name === 'same_as_billing' && value.same_as_billing && value.dealerId) {
        setValue('shipping.firm', dealer.trade_name);
        setValue('shipping.district', dealer.district);
        setValue('shipping.state', dealer.state);
        setValue('shipping.address', `${dealer.address}, ${dealer.pincode}`);
        setTimeout(() => checkSectionCompletion(), 100);
      }
      // Check items section completion when items change
      if (name?.startsWith('items')) {
        setTimeout(() => checkSectionCompletion('items'), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, dealers, sameAsBilling, checkSectionCompletion]);


  // Section completion status - optimized with selective watching
  // const sectionFields = useWatch({
  //   control,
  //   name: ['dealerId', 'billing.district', 'billing.state', 'billing.address', 'billing.gst_no', 'delivery_terms']
  // });

  // const completedSections = useMemo(() => {
  //   const [dealerId, billingDistrict, billingState, billingAddress, billingGstNo, deliveryTerms] = sectionFields;

  //   return {
  //     invoice: !!(piNumber && userData?.displayName),
  //     shipping: !!(dealerId && 
  //       billingDistrict && 
  //       billingState && 
  //       billingAddress &&
  //       billingGstNo  &&
  //       (sameAsBilling || (
  //         formValues.shipping?.firm &&
  //         formValues.shipping?.district && 
  //         formValues.shipping?.state &&
  //         formValues.shipping?.address
  //       ))
  //     ),
      
  //     items: !!(watchedItems && watchedItems.length > 0 && 
  //       watchedItems.every(item => 
  //         item.model && 
  //         item.description && 
  //         item.qty > 0 && 
  //         item.unit_price > 0
  //       )
  //     ),
      
  //     summary: !!(deliveryTerms) && (deliveryTerms !== '-- Delivery Days --')
  //   };
  // }, [sectionFields, watchedItems, piNumber, userData]);

  const isFormComplete = useMemo(() => 
    Object.values(completedSections).every(Boolean), 
    [completedSections]
  );

  // Memoized calculations based on watched items
  const { subTotal, taxAmount, grandTotal } = useMemo(() => {
    const formValues = getValues();
    const items = formValues.items || [];
    const freightCharges = Number(formValues.transport?.charges) || 0;
    const calculatedSubTotal = items.reduce((acc, item) => {
      const qty = Number(item?.qty) || 0;
      const price = Number(item?.unit_price) || 0;
      return acc + (qty * price);
    }, 0) * (100 / 105); // Exclude GST

    const freight = freightIncluded === "false" ? freightCharges : 0;
    const tax = calculatedSubTotal * 0.05;
    const total = calculatedSubTotal + tax + freight;

    return {
      subTotal: calculatedSubTotal,
      taxAmount: tax,
      grandTotal: total
    };
  }, [getValues, freightIncluded]);


    // Section validation
  const validateCurrentSection = async (section = null) => {
    const targetSection = section || currentSection;
    const sectionValidations = {
      invoice: async () => true, // Read-only section
      shipping: async () => {
        const fields = ['dealerId', 'billing.district', 'billing.state', 'billing.address', 'billing.gst_no'];
        if (!sameAsBilling) {
          fields.push('shipping.firm', 'shipping.district', 'shipping.state', 'shipping.address');
        }
        return await trigger(fields);
      },
      items: async () => {await trigger('items'); return checkSectionCompletion('items')},
      summary: async () => await trigger(['delivery_terms'])
    };
    let isValid = false;
    if(section && section !== currentSection){
      const sectionIndex = sections.indexOf(section);
      let count = 0;
      if (sectionIndex === 0) isValid=true;
      while (count<sectionIndex) {
        isValid= await sectionValidations[sections[count]]()
        if (!isValid) break;
        count++;
      }
    } else{
      isValid= await sectionValidations[targetSection]()
    }
    // const isValid = await sectionValidations[currentSection]();
    
    if (!isValid && currentSection === 'shipping') {
      // Scroll to first error in shipping section
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // Update completion status after validation
      checkSectionCompletion();
    return isValid;
  };


  const handleNextSection = async () => {
    const isValid = await validateCurrentSection();
    if (isValid) {
      const currentIndex = sections.indexOf(currentSection);
      if (currentIndex < sections.length - 1) {
        setCurrentSection(sections[currentIndex + 1]);
        // Auto-scroll to the new section
        setTimeout(() => {
          document.getElementById(sections[currentIndex + 1])?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    }
  };

  const hanlePrevSection = async ()=>{
    // Auto-scroll to the prev section
    const currentIndex = sections.indexOf(currentSection);
      if(currentIndex > 0){
        setCurrentSection(sections[currentIndex - 1]);
        setTimeout(() => {
          document.getElementById(sections[currentIndex - 1])?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
        
    };
    

  const handleSectionToggle = async (section) => {
    if (section !== currentSection) {
      const isValid = await validateCurrentSection(section);
      if (isValid) { 
        setCurrentSection(section);
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      } else{
          toast.error(`First complete the previous sections`);
      }
    } 
  };


  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const dealer = dealers.find(d => d.id === data.dealerId);
      const piData = piToEdit ? {
        ...data,
        billing: { ...data.billing, firm: dealer?.trade_name },
        shipping: data.same_as_billing ? 'same_as_billing' : { ...data.shipping },
        totals: { subTotal, taxAmount, grandTotal },
      } : {
        ...data,
        billing: { ...data.billing, firm: dealer?.trade_name },
        shipping: data.same_as_billing ? 'same_as_billing' : { ...data.shipping },
        pi_number: piNumber,
        pi_date: new Date().toLocaleDateString(),
        generated_by_id: userData?.uid,
        generated_by_name: userData?.displayName,
        totals: { subTotal, taxAmount, grandTotal },
      };
      await onSubmit(piData);
    } catch (error) {
      console.error("Form submission error:", error);
      setError('Failed to submit the form. Please try again.');
    }
     finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return <Loading isOpen={true} message="Loading Page..." />;
  }

  return (
    <div>
      {/* Progress Bar */}
      <ProgressBar 
        currentSection={currentSection}
        completedSections={completedSections}
        onSectionClick={handleSectionToggle}
      />
      <div className="bg-white py-6 px-2 sm:py-8 ">
        {/* Error Display */}
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3 w-fit flex items-center text-red-600 gap-2">
                <AlertCircle size={20}/> <p className="text-sm text-center ">{error}</p>
            </div>
        )}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className='text-xl font-semi-bold text-slate-900'>{piToEdit ? "Edit Performa Invoice" : "Create Performa Invoice"}</h2>
            </div>

            {/* Invoice Details Section */}
            <CollapsibleSection
              id="invoice"
              title="Invoice Details"
              isOpen={currentSection === 'invoice'}
              onToggle={() => handleSectionToggle('invoice')}
              isComplete={completedSections.invoice}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input 
                    label="Invoice Number" 
                    value={piNumber} 
                    readOnly 
                    disabled 
                  />
                  <Input 
                    label="PI Date" 
                    value={new Date().toLocaleDateString()} 
                    readOnly 
                    disabled 
                  />
                  <Input 
                    label="Sales Person" 
                    value={userData?.displayName} 
                    readOnly 
                    disabled 
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Billing & Shipping Section */}
            <CollapsibleSection
              id="shipping"
              title="Billing & Shipping"
              isOpen={currentSection === 'shipping'}
              onToggle={() => handleSectionToggle('shipping')}
              isComplete={completedSections.shipping}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bill To */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Bill To</h3>
                    
                    <Controller
                      name="dealerId"
                      control={control}
                      rules={{ required: 'Please select a dealer',validate: value => value !== '-- Select Dealer --' || 'Please select dealer' }}
                      render={({ field }) => (
                        <Select
                        placeholder="-- Select Dealer --"
                          label="Dealer"
                          {...field}
                          defaultValue="-- Select Dealer --"
                          required
                          options={dealers.map(d => ({value: d.id, name: d.trade_name}))}
                          error={errors.dealerId?.message}
                        />
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input 
                        label="Billing District" 
                        disabled 
                        {...register('billing.district', { required: 'Billing district is required' })} 
                        error={errors.billing?.district?.message}
                      />
                      <Input 
                        label="Billing State" 
                        disabled 
                        {...register('billing.state', { required: 'Billing state is required' })} 
                        error={errors.billing?.state?.message}
                      />
                    </div>
                    
                    <Input 
                      as="textarea" 
                      label="Billing Address" 
                      disabled 
                      {...register('billing.address', { required: 'Billing address is required' })} 
                      rows={3}
                      error={errors.billing?.address?.message}
                    />
                    
                    <Input 
                      label={
                        <Tooltip text="The Goods and Services Tax Identification Number is a unique 15-digit number">
                          GSTIN No.
                        </Tooltip>
                      } 
                      disabled 
                      placeholder="GSTIN Number of Dealer" 
                      {...register('billing.gst_no', { required: 'GSTIN number is required' })} 
                      error={errors.billing?.gst_no?.message}
                    />
                  </div>

                  {/* Ship To */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Ship To</h3>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          {...register('same_as_billing')} 
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <label className="ml-2 text-sm text-slate-600">
                          Same as billing address
                        </label>
                      </div>
                    </div>

                    <Input 
                      label="Shipping Firm" 
                      disabled={sameAsBilling}
                      {...register('shipping.firm', { 
                        required: sameAsBilling ? false : 'Shipping firm is required' 
                      })} 
                      error={errors.shipping?.firm?.message}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input 
                        label="Shipping District" 
                        disabled={sameAsBilling}
                        {...register('shipping.district', { 
                          required: sameAsBilling ? false : 'Shipping district is required' 
                        })} 
                        error={errors.shipping?.district?.message}
                      />
                      <Input 
                        label="Shipping State" 
                        disabled={sameAsBilling}
                        {...register('shipping.state', { 
                          required: sameAsBilling ? false : 'Shipping state is required' 
                        })} 
                        error={errors.shipping?.state?.message}
                      />
                    </div>
                    
                    <Input 
                      as="textarea" 
                      label="Shipping Address" 
                      disabled={sameAsBilling}
                      {...register('shipping.address', { 
                        required: sameAsBilling ? false : 'Shipping address is required' 
                      })} 
                      rows={3}
                      error={errors.shipping?.address?.message}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Item Details Section */}
            <CollapsibleSection
              id="items"
              title="Item Details"
              isOpen={currentSection === 'items'}
              onToggle={() => handleSectionToggle('items')}
              isComplete={completedSections.items}
            >
              <div className="p-6">
                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <ItemRow
                      key={item.id}
                      index={index}
                      control={control}
                      register={register}
                      errors={errors}
                      watch={watch}
                      remove={remove}
                    />
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant='secondary'
                  onClick={() => append({ qty: 0, unit_price: 0 })}
                  className="mt-4 rounded-full"
                >
                  <Plus size={20} />
                 Add Item
                </Button>
              </div>
            </CollapsibleSection>

            {/* Summary & Terms Section */}
            <CollapsibleSection
              id="summary"
              title="Summary & Terms"
              isOpen={currentSection === 'summary'}
              onToggle={() => handleSectionToggle('summary')}
              isComplete={completedSections.summary}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Input 
                      as="textarea" 
                      label={
                        <Tooltip text="Add any additional notes, terms and conditions for this invoice">
                          Remarks & Terms
                        </Tooltip>
                      } 
                      {...register('billing_remarks')} 
                      rows={4} 
                    />
                    
                    <div className='flex gap-10 w-full'>
                        <Select 
                          label="Delivery Terms" 
                          placeholder="-- Delivery Days --"
                          required
                          className='!w-fit !px-7'
                          defaultValue="-- Delivery Days --"
                          {...register('delivery_terms', {
                            validate: (value) => value !== '-- Delivery Days --' || 'Delivery terms are required'
                           })}
                          options={["After 5 days", "After 10 days", "After 15 days", "After 20 days", "After 40 days"]}
                          error={errors.delivery_terms?.message}
                        />
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          <Tooltip text="Specify if freight charges are included in the price, or to be charged extra">
                            Freight
                          </Tooltip>
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              value="true" 
                              {...register('transport.included')} 
                              className="text-blue-600 focus:ring-blue-500" 
                            />
                            Included
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              value="false" 
                              {...register('transport.included')} 
                              className="text-blue-600 focus:ring-blue-500" 
                            />
                            Extra
                          </label>
                        </div>
                      </div>
                    </div>
                    

                    {freightIncluded === "false" && (
                      <Input 
                        type="number" 
                        label="Freight Charges" 
                        required
                        {...register('transport.charges', { required: freightIncluded ? false : 'Freight charges is required' , valueAsNumber: true })} 
                        error={errors.transport?.charges?.message}
                      />
                    )}
                  </div>
                  <InvoiceSummary 
                    subtotal={subTotal}
                    taxAmount={taxAmount}
                    freightCharges={freightIncluded === "false" ? Number(freightCharges) || 0 : 0}
                    grandTotal={grandTotal}
                    freightIncluded={freightIncluded}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </form>
      </div>

      {/* Persistent Save Button */}
      <PersistentSaveButton
        currentSection={currentSection}
        onNext={handleNextSection}
        onBack= {hanlePrevSection}
        onConfirm={handleSubmit(handleFormSubmit)}
        isSummaryVisible={isFormComplete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default CreateInvoice;
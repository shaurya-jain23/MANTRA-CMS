import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { selectUser } from '../../features/user/userSlice';
import { selectAllDealers, selectDealersStatus, fetchDealers } from '../../features/dealers/dealersSlice';
import { Input, Button, Select, Loading, Tooltip, CollapsibleSection } from '../index';
import { format, parse } from 'date-fns';
import InvoiceSummary from './InvoiceSummary';
import ItemRow from './ItemRow';
import PersistentSaveButton from './PersistentSaveButton';
import ProgressBar from './ProgressBar';
import toast from 'react-hot-toast';
import {PI_TYPES, PI_STATUS} from '../../assets/utils'
import { useDealer } from '../../contexts/DealerContext';

function CreateInvoice({ piNumber, onSubmit, piToEdit = null }) {
  const { register, control, handleSubmit, watch, setValue, trigger, getValues,formState: { errors, dirtyFields } } = useForm({
    defaultValues: (() => {
      if (piToEdit) {
        const defaultShipping = piToEdit?.shipping === "same_as_billing"
          ? {
              firm: piToEdit?.billing?.firm,
              district: piToEdit.billing?.district,
              state: piToEdit.billing?.state,
              address: piToEdit.billing?.address,
            }
          : { ...piToEdit?.shipping };

        return {
          ...piToEdit,
          shipping: defaultShipping,
          type: piToEdit.type || PI_TYPES.NORMAL,
        };
      } else {
        return {
          type: PI_TYPES.NORMAL,
          items: [{ qty: 0, unit_price: 0 }],
          transport: { included: 'true', charges: 0 },
          same_as_billing: true,
        };
      }
    })(),
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
  const { openDealerModal } = useDealer();

  const [piDate, setPiDate] = useState(format(new Date(), 'dd/MM/yyyy'));

  useEffect(() => {
    if (piToEdit) {
      const parsedDate = parse(piToEdit.pi_date, 'dd/MM/yyyy', new Date());
      setPiDate(format(parsedDate, 'dd/MM/yyyy'));
    } 
  }, [piToEdit]);

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
    }

  // Use useWatch only for UI-related values that need re-renders
  const sameAsBilling = useWatch({ control, name: 'same_as_billing' });
  const freightIncluded = useWatch({ control, name: 'transport.included' });
  const freightCharges = useWatch({ control, name: 'transport.charges' });
  const warrantyIncluded = useWatch({ control, name: 'warranty_terms' });
  const piType = useWatch({ control, name: 'type' });
  

  const hasFormChanges = useMemo(() => {
    if (!piToEdit) return true; 
    const isDirty = Object.keys(dirtyFields).length > 0;
    if (piToEdit.items) {
      const currentItems = getValues('items') || [];
      if (currentItems.length !== piToEdit.items.length) {
        return true;
      }
      // Check if any item has changes
      for (let i = 0; i < currentItems.length; i++) {
        const currentItem = currentItems[i];
        const originalItem = piToEdit.items[i];
        if (!originalItem || 
            currentItem.model !== originalItem.model ||
            currentItem.qty !== originalItem.qty ||
            currentItem.unit_price !== originalItem.unit_price ||
            currentItem.with_battery !== originalItem.with_battery ||
            currentItem.with_charger !== originalItem.with_charger ||
            currentItem.with_tyre !== originalItem.with_tyre ||
            currentItem.with_assembling !== originalItem.with_assembling) {
          return true;
        }
      }
    }
    return isDirty;
  }, [piToEdit, Object.keys(dirtyFields).length, getValues]);


  const checkSectionCompletion = useCallback((section = null) => {
    const formValues = getValues();
    const items = formValues.items || [];

    const completion = {
      invoice: !!(piNumber && userData?.displayName && formValues.type),
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
      summary: piType === 'container' ? !!(formValues.delivery_terms && (formValues.delivery_terms !== '-- Delivery Days --')) : true
    };

    if (section) {
      return completion[section];
    } else {
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
  }, [getValues, freightIncluded, currentSection]);


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
      summary: (async () => {if(piType === 'container') return await trigger(['delivery_terms']); else return true})
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
    setError('')
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
    else {
      setError('current section not valid')
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

  const calculateTotals = (formData) => {
  const items = formData.items || [];
  const freightCharges = formData.transport?.included === "false" ? (Number(formData.transport?.charges) || 0) : 0;
  const subTotal = items.reduce((acc, item) => {
    const qty = Number(item?.qty) || 0;
    const price = Number(item?.unit_price) || 0;
    return acc + (qty * price);
  }, 0) * (100 / 105); // Exclude GST

  const taxAmount = subTotal * 0.05;
  const grandTotal = subTotal + taxAmount + freightCharges;

  return { subTotal, taxAmount, grandTotal };
};


  const handleSaveDraft = async (data = null) => {
  const formData = data || getValues();
  setIsSubmitting(true);
  try {
    const dealer = dealers.find(d => d.id === formData.dealerId);
    const piData = {
      ...formData,
      billing: { ...formData.billing, firm: dealer?.trade_name },
      shipping: formData.same_as_billing ? 'same_as_billing' : { ...formData.shipping },
      status: PI_STATUS.DRAFT,
      ...(piToEdit ? {} : {
        pi_number: piNumber,
        pi_date: piDate,
        generated_by_id: userData?.uid,
        generated_by_name: userData?.displayName,
        generated_by_role: userData?.role,
      }),
      totals: calculateTotals(formData),
    };
    await onSubmit(piData);
    if (piToEdit) {
      toast.success('PI draft updated successfully');
    } else {
      toast.success('PI draft saved successfully');
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error('Failed to save draft');
  } finally {
    setIsSubmitting(false);
  }
};

const handleSubmitForApproval = async (data = null) => {
  const formData = data || getValues();
  setIsSubmitting(true);
  
  try {
    const dealer = dealers.find(d => d.id === formData.dealerId);
    const piData = {
      ...formData,
      billing: { ...formData.billing, firm: dealer?.trade_name },
      shipping: formData.same_as_billing ? 'same_as_billing' : { ...formData.shipping },
      status: PI_STATUS.SUBMITTED,
      ...(piToEdit ? {} : {
        pi_number: piNumber,
        pi_date: piDate,
        generated_by_id: userData?.uid,
        generated_by_name: userData?.displayName,
        generated_by_role: userData?.role,
      }),
      totals: calculateTotals(formData),
    };
    await onSubmit(piData);
    if (piToEdit) {
      toast.success('PI submitted for approval successfully');
      await piService.submitPIForApproval(piToEdit.id, piToEdit.pi_number);
    } else {
      toast.success('PI created and submitted for approval successfully');
    }
    
    toast.success('PI submitted for approval successfully');
    navigate('/performa-invoices');
  } catch (error) {
    console.error("Error submitting for approval:", error);
    toast.error('Failed to submit for approval');
  } finally {
    setIsSubmitting(false);
  }
};

const handleFormSubmit = async () => {
  if (piToEdit && !hasFormChanges) {
    toast.success('No changes detected.');
    return;
  }
  
  setIsSubmitting(true);
  try {
    const formData = getValues();
    const dealer = dealers.find(d => d.id === formData.dealerId);
    const totals = calculateTotals(formData);
    
    const piData = {
      ...formData,
      billing: { ...formData.billing, firm: dealer?.trade_name },
      shipping: formData.same_as_billing ? 'same_as_billing' : { ...formData.shipping },
      totals: totals,
      ...(piToEdit ? {} : {
        pi_number: piNumber,
        pi_date: piDate,
        generated_by_id: userData?.uid,
        generated_by_name: userData?.displayName,
        generated_by_role: userData?.role,
        status: PI_STATUS.DRAFT, 
      }),
    };
    await onSubmit(piData);
    
    if (piToEdit) {
      toast.success('PI updated successfully');
    } else {
      toast.success('PI created successfully');
    }
  } catch (error) {
    console.error("Form submission error:", error);
    setError('Failed to save the PI. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  if (loading) {
    return <Loading isOpen={true} message="Loading Page..." />;
  }

  return (
    <div>
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
        {piToEdit && !hasFormChanges && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-3 w-fit flex items-center text-blue-600 gap-2">
            <AlertCircle size={20}/> 
            <p className="text-sm text-center">No changes made to the form.</p>
          </div>
        )}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className='text-xl font-semi-bold text-slate-900'>{piToEdit ? "Edit Performa Invoice" : "Create Performa Invoice"}</h2>
              {piToEdit && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  piToEdit.status === PI_STATUS.DRAFT ? 'bg-yellow-100 text-yellow-800' :
                  piToEdit.status === PI_STATUS.SUBMITTED ? 'bg-blue-100 text-blue-800' :
                  piToEdit.status === PI_STATUS.FINAL ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {piToEdit.status.replace(/_/g, ' ').toUpperCase()}
                </div>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Input 
                    label="Invoice Number" 
                    value={piNumber} 
                    readOnly 
                    disabled 
                  />
                  <Input 
                    label="PI Date" 
                    value={piDate} 
                    readOnly 
                    disabled 
                  />
                  <Input 
                    label="Sales Person" 
                    value={userData?.displayName} 
                    readOnly 
                    disabled 
                  />
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'PI type is required' }}
                    render={({ field }) => (
                      <Select
                        label="PI Type"
                        required
                        {...field}
                        options={[
                          { value: PI_TYPES.NORMAL, name: 'Normal Order PI' },
                          { value: PI_TYPES.CONTAINER, name: 'Container Order PI ' }
                        ]}
                        error={errors.type?.message}
                      />
                    )}
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
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '__add_new__') {
                              handleDealerChange(value);
                            } else {
                              field.onChange(e);
                              handleDealerChange(value);
                            }
                          }}
                          options={dealers.map(d => ({value: d.id, name: d.trade_name}))}
                          outerClasses="w-full"
                          showAddOption={true}
                          addOptionText="+ Add New Dealer"
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
                      piType={piType}
                      setValue={setValue}
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
                      {piType === 'container' && 
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
                        />}
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

                      {piType === 'normal' && <div className='flex gap-10 w-full'>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('warranty_terms')}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {warrantyIncluded ? 'With Warranty' : 'Without Without'}
                          </span>
                        </label>
                      </div>}

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
        onSaveDraft={handleSubmit(handleSaveDraft)}
        onSubmitApproval={handleSubmit(handleSubmitForApproval)}
        isSummaryVisible={isFormComplete}
        isSubmitting={isSubmitting}
        isDisabled={piToEdit && !hasFormChanges}
        piToEdit={piToEdit}
      />
    </div>
  );
}

export default CreateInvoice;
import React , {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom";
import {Plus, Trash2} from 'lucide-react';
import {toast} from 'react-hot-toast';
import { parseISO,format, isValid } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { selectUser } from '../../features/user/userSlice';
import { selectAllDealers ,selectDealersStatus, fetchDealers, setDealersStatus } from '../../features/dealers/dealersSlice';
import {Input, Button, Select, Loading} from '../index'
import {modelOptions} from "../../assets/utils"

function CreateInvoice({piNumber, onSubmit, piToEdit = null }) {
    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: piToEdit || {
            items: [{}],
            transport: {included: true, charges: 0},
            same_as_billing: true,
            extras: { battery: false, charger: false, tyre: false },
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dealers, setDealers] = useState([]);
    const dealersStatus = useSelector(selectDealersStatus);
    const dealersData = useSelector(selectAllDealers);
    const userData = useSelector(selectUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAdmin = ['admin', 'superuser'].includes(userData?.role);
    const [subTotal, setSubTotal] = useState(0)

    useEffect(() => {
        if (dealersStatus === 'idle') {
        dispatch(fetchDealers({ role: userData.role, userId: userData.uid }));
        }
        if(dealersStatus === 'succeeded'){
        setDealers(dealersData);
        setLoading(false);
        }
        if(dealersStatus === 'failed'){
        setError('Failed to fetch dealers.')
        setLoading(false)
        }
    }, [dealersStatus, dispatch, userData]);


    // --- Watchers for Dynamic UI ---
    const watchedItems = useWatch({ control, name: 'items' });
    const selectedDealerId = watch('dealerId');
    const sameAsBilling = watch('same_as_billing');
    const freightIncluded = watch('transport.included');
    
    
    let freightCharges = 0;
    if (freightIncluded === "false") {
        freightCharges = watch('transport.charges');
        if(Number.isNaN(freightCharges)){
            freightCharges = 0;
        }
    }
    

    // --- Live Calculations ---
    useEffect(() => {
        if (watchedItems && Array.isArray(watchedItems)) {
            setSubTotal(watchedItems.reduce((acc, item) => acc + (item?.qty || 0) * (item?.unit_price || 0), 0) * (100/105)) 
        }
    }, [watchedItems]);
    const taxAmount = (subTotal * 0.05); // 5% GST
    const grandTotal = subTotal + taxAmount + freightCharges;

    useEffect(() => {
        if (selectedDealerId) {
        const dealer = dealers.find(d => d.id === selectedDealerId);
        if (dealer) {
            setValue('billing.address', `${dealer.address}, ${dealer.pincode}`);
            setValue('billing.gst_no', dealer.gst_no);
            setValue('billing.district', dealer.district);
            setValue('billing.state', dealer.state);
            if(sameAsBilling){
                setValue('shipping.firm', dealer.trade_name);
                setValue('shipping.district', dealer.district);
                setValue('shipping.state', dealer.state);
                setValue('shipping.address', `${dealer.address}, ${dealer.pincode}`);
            }
        }
        }
    }, [selectedDealerId, dealers, setValue, sameAsBilling]);

    const handleOnSubmit = (data) =>{
        // dispatch(setDealersStatus("idle"))
                if(piToEdit) onSubmit(data);
                else{
                const dealer = dealers.find(d => d.id === selectedDealerId);
                const piData = {
                    ...data,
                    billing: {...data.billing, firm: dealer.trade_name},
                    shipping: data.same_as_billing 
                            ? 'same_as_billing' 
                            : {...data.shipping},
                    pi_number: piNumber,
                    pi_date: new Date().toLocaleDateString(),
                    generated_by_id: userData.uid,
                    generated_by_name: userData.displayName,
                    totals: { subTotal, taxAmount, grandTotal },
                };
                console.log(piData);
                
                onSubmit(piData);
                }
    }

    if (loading) {
        return <Loading isOpen={true} message="Loading Page..." />
    }

    return (
        <div>
            <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-semi-bold text-slate-900'>{piToEdit ? "Edit Performa Invoice" : "Create Performa Invoice"}</h2>
                    <Button type='submit' className=" hover:bg-blue-700 transition md:w-auto flex items-center">
                        {piToEdit ? "Save Changes": "Save Invoice"}
                    </Button>
                </div>

                {/* --- Header Info --- */}
                <div className='bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 '>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <Input label="Invoice Number" name="invoice_no" value={piNumber} readOnly disabled />
                        <Input label="PI Date" name= "invoiceDate" value={new Date().toLocaleDateString()} readOnly disabled />
                        <Input label="Sales Person" name= "salesPerson" value={userData?.displayName} readOnly disabled />
                    </div>
                </div>
                {/* --- Billing & Shipping --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bill To */}
                    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Bill To</h3>
                        <Controller
                            name="dealerId"
                            control={control}
                            rules={{ required: 'Please select a dealer',
                                    validate: value => value !== '-- Select Dealer --' || 'Please select dealer' }}
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
                        <Input label="Billing District" disabled required {...register('billing.district', { required: 'billing district is required' })} />
                        <Input label="Billing State" disabled required {...register('billing.state', { required: 'billing state is required' })} />
                        </div>
                        <Input as="textarea" disabled required label="Billing Address" {...register('billing.address', { required: 'billing address is required' })} rows={4} />
                        <Input label="GSTIN No." required readOnly disabled placeholder="GSTIN Number of Dealer" {...register('billing.gst_no', { required: 'GST no. is required' })} />
                    </div>
                    {/* Ship To */}
                    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200">
                    <h3 className="text-lg font-semibold">Ship To</h3>
                    <div className="flex items-center">
                        <input type="checkbox" {...register('same_as_billing')} className="h-4 w-4 rounded" />
                        <label className="ml-2 text-sm">Same as billing address</label>
                    </div>
                    <div className="space-y-4">
                        <Input label="Shipping Firm" disabled={sameAsBilling} {...register('shipping.firm', { required: 'shipping firm name is required' })} />
                        <div className="flex w-full gap-5">
                        <Input label="Shipping District" disabled={sameAsBilling} {...register('shipping.district', { required: 'shipping district is required' })} />
                        <Input label="Shipping State" disabled={sameAsBilling} {...register('shipping.state', { required: 'shipping state is required' })} />
                        </div>
                        
                        <Input as="textarea" label="Shipping Address" disabled={sameAsBilling} {...register('shipping.address')} rows={4} />
                    </div>
                    </div>
                </div>
                {/* --- Item Details --- */}
                <div className=' bg-white rounded-lg shadow-sm shadow-gray-100 border border-slate-200'>
                    <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-900">Item Details</h3>
                    </div>
                    <div className="overflox-x-auto">
                        <table className="w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-2 sm:px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">PRODUCT NAME</th>
                                    <th className="px-2 sm:px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider" colSpan="2">DESCRIPTION</th>
                                    <th className="px-2 sm:px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">QTY</th>
                                    <th className="px-2 sm:px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">UNIT PRICE (WITH GST)</th>
                                    <th className="px-2 sm:px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider" colSpan="2">TOTAL</th>
                                    <th className="px-2 sm:px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-slate-200'>
                                {fields.map((item, index) => {
                                    const selectedModel = watch(`items.${index}.model`);
                                    const descriptionOptions = selectedModel ? modelOptions[selectedModel] : [];
                                    const itemTotal = (watch(`items.${index}.qty`) || 0) * (watch(`items.${index}.unit_price`) || 0);
                                    return (<tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-2 sm:px-6 py-4">
                                            <Controller
                                                name={`items.${index}.model`}
                                                control={control}
                                                rules={{ required: 'Please select a model',
                                                        validate: value => value !== '-- Select Model --' || 'Please select model' }}
                                                render={({ field }) => (
                                                <Select
                                                    placeholder="-- Select Model --"
                                                    {...field}
                                                    required
                                                    defaultValue="-- Select Model --"
                                                    options={Object.keys(modelOptions).map(key => (key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')))}
                                                />
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 sm:px-8 py-4" colSpan="2">
                                            <Controller
                                                name={`items.${index}.description`}
                                                control={control}
                                                required
                                                rules={{ required: 'Please select product description',
                                                        validate: value => value !== '-- Product Description --' || 'Please select product description' }}
                                                render={({ field }) => (
                                                <Select
                                                    placeholder="-- Product Description --"
                                                    {...field}
                                                    required
                                                    disabled={!selectedModel}
                                                    defaultValue="-- Product Description --"
                                                    options={descriptionOptions}
                                                />
                                                )}
                                            />
                                        </td>
                                        <td className="px-2 sm:px-6 py-4">
                                            <Input placeholder="Product Qty" type="number"  className="" required
                                                {...register(`items.${index}.qty`, { valueAsNumber: true, min: 1 })}
                                            />
                                        </td>
                                        <td className="px-2 sm:px-6 py-4">
                                            <Input type="number" required placeholder="Unit Price (with GST)" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} />
                                        </td>
                                        <td className="px-2 sm:px-6 py-4 w-3xs" colSpan={2}>₹{itemTotal.toFixed(2)}</td>
                                        <td className="px-2 sm:px-6 py-4">
                                            <Button type="button" bgColor='bg-white' onClick={() => remove(index)} className="!w-fit !p-0"><Trash2 className='w-4 h-4 text-red-500'/></Button>
                                        </td>
                                    </tr>)
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col md:flex-row gap-6 justify-between">
                        <Button type="button" bgColor='bg-white' textColor='text-slate-600' onClick={() => append({})} className=" md:w-auto flex items-center border border-slate-200 hover:bg-gray-100 transition-all duration-200"><Plus size={20} className="mr-2"/> Add Item</Button>
                       {/* Freight */}
                        <div className='flex items-center gap-6'><legend className="font-semibold">Freight: </legend>
                            <div className="flex space-x-4"><input type="radio" id="transportYes" value={true} {...register('transport.included')} /><label>Included in Price</label></div>
                            <div className="flex space-x-4"><input type="radio" id="transportNo" value={false} {...register('transport.included')} /><label>Extra Charges</label></div>
                            {freightIncluded === 'false' && <Input type="number" placeholder="Transport Charges (₹)" className="!w-3/4 !py-1" {...register('transport.charges', {valueAsNumber: true, setValueAs: (value) => Number.isNaN(value) ? value : 0 })} />}
                        </div>
                        {/* Extras */}
                        <div className='flex items-center gap-6'><legend className="font-semibold">Extras:</legend>
                            <div className="flex gap-2"><input type="checkbox" {...register('extras.battery')} /><label>With Battery</label></div>
                            <div className="flex gap-2"><input type="checkbox" {...register('extras.charger')} /><label>With Charger</label></div>
                            <div className="flex gap-2"><input type="checkbox" {...register('extras.tyre')} /><label>With Tyre</label></div>
                        </div>
                        
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">Remarks & Terms</h3>
                        <Input as="textarea" label="Remarks" {...register('billing_remarks')} rows={2} />
                        <Select 
                            placeholder="-- Delivery Days --"
                            label="Delivery Terms" 
                            required
                            defaultValue="-- Delivery Days --"
                            {...register('delivery_terms')}
                            options={["After 5 days", "After 10 days", "After 15 days", "After 20 days", "After 40 days"]}
                            />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="flex justify-between text-md text-slate-600"><p>Subtotal (Without GST):</p><p>₹{subTotal.toFixed(2)}</p></div>
                            <div className="flex justify-between text-md text-slate-600"><p>Tax Amount (5% GST):</p><p>₹{taxAmount.toFixed(2)}</p></div>
                            {(freightIncluded === "false") && <div className="flex justify-between text-md text-slate-600"><p>Freight Charges:</p><p>₹{freightCharges.toFixed(2)}</p></div>}
                            <div className="flex justify-between text-md text-slate-900 border-t border-slate-200 pt-4 mt-4"><p>Total Amount:</p><p>₹{grandTotal.toFixed(2)}</p></div>
                        </div>
                    </div>
                </div>
                
            </form>
        </div>
    )
}

export default CreateInvoice
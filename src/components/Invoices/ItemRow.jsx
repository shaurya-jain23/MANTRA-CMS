import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Select, Input, Button } from '../index';
import { modelOptions, accessoryOptions } from '../../assets/utils';


const ItemRow = ({ index, control, register, errors, watch, remove }) => {
  const selectedModel = watch(`items.${index}.model`);
  const descriptionOptions = selectedModel ? modelOptions[selectedModel] : [];
  const qty = watch(`items.${index}.qty`) || 0;
  const unitPrice = watch(`items.${index}.unit_price`) || 0;
  const itemTotal = qty * unitPrice;

  // Watch accessory checkboxes
  const withBattery = watch(`items.${index}.with_battery`);
  const withCharger = watch(`items.${index}.with_charger`);

  const getGridClass = () => {
  if (withBattery && withCharger) {
    return 'lg:grid-cols-10 md:grid-cols-3';
  }
  else if ((withBattery || withCharger) && !(withBattery && withCharger)) {
    return 'lg:grid-cols-8 md:grid-cols-3';
  }
  return 'lg:grid-cols-6 md:grid-cols-2';
};

  return (
    <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
      <button type="button" className="handle text-slate-400 mt-8 cursor-move hidden md:block">
        <GripVertical size={20} />
      </button>
      <div className="flex-grow">
        <div className={`grid grid-cols-1 ${getGridClass()} gap-4 items-start`}>
          {/* Product Name */}
            <Controller
              name={`items.${index}.model`}
              control={control}
              rules={{ required: 'Please select a model', validate: value => value !== '-- Select Model --' || 'Please select model' }}
              render={({ field }) => (
                <Select
                  label='Product Name'
                  outerClasses='lg:col-span-2'
                  placeholder="-- Select Model --"
                  {...field}
                  required
                  defaultValue="-- Select Model --"
                  options={Object.keys(modelOptions).map(key => (key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')))}
                  error={errors.items?.[index]?.model?.message}
                />
              )}
            />

          {/* Description */}
            <Controller
              name={`items.${index}.description.model`}
              control={control}
              rules={{ required: 'Please select product description',validate: value => value !== '-- Product Description --' || 'Please select product description' }}
              render={({ field }) => (
                <Select
                  label='Description'
                  outerClasses='lg:col-span-2'
                  placeholder="-- Product Description --"
                  {...field}
                  required
                  disabled={!selectedModel}
                  defaultValue="-- Product Description --"
                  options={descriptionOptions}
                  error={errors.items?.[index]?.description?.model?.message}
                />
              )}
            />
          {withBattery && (
                <Controller
                  name={`items.${index}.description.battery`}
                  control={control}
                  rules={{ required: 'Please select battery description',validate: value => value !== '-- Select Battery --' || 'Please select battery description' }}
                  render={({ field }) => (
                    <Select
                      label='Battery Type'
                      outerClasses='lg:col-span-2'
                      placeholder="-- Select Battery --"
                      defaultValue="-- Select Battery --"
                      {...field}
                      options={accessoryOptions.battery.options}
                      error={errors.items?.[index]?.description?.battery.message}
                    />
                  )}
                />
            )}
          {withCharger && (
                <Controller
                  name={`items.${index}.description.charger`}
                  control={control}
                  rules={{ required: 'Please select charger description',validate: value => value !== "-- Select Charger --" || 'Please select charger description' }}
                  render={({ field }) => (
                    <Select
                      label='Charger Type'
                      outerClasses='lg:col-span-2'
                      placeholder="-- Select Charger --"
                      defaultValue="-- Select Charger --"
                      {...field}
                      options={accessoryOptions.charger.options}
                      error={errors.items?.[index]?.description?.charger.message}
                    />
                  )}
                />
            )}
          {/* Quantity */}
          <div className="w-full col-span-1">
            <Input
              type="number"
              label="Qty."
              placeholder="Product Qty"
              required
              {...register(`items.${index}.qty`, { 
                valueAsNumber: true, 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be greater than 0' } 
              })}
              error={errors.items?.[index]?.qty?.message} 
            />
          </div>

          {/* Unit Price */}
          <div className="w-full col-span-1">
            <Input
              type="number"
              label="Unit Price (Inc. GST)"
              placeholder="Unit Price"
              required
              {...register(`items.${index}.unit_price`, { 
                valueAsNumber: true,
                required: 'Unit price is required',
                min: { value: 1, message: 'Unit price must be greater than 0' } 
              })}
              error={errors.items?.[index]?.unit_price?.message}
            />
          </div>
        </div>

        {/* Options and Total */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 md:col-span-2">
            <span className="text-sm font-medium text-slate-600">Options:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(`items.${index}.with_battery`)} />
                With Battery
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(`items.${index}.with_charger`)} />
                With Charger
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(`items.${index}.with_tyre`)} />
                With Tyre
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(`items.${index}.with_assembling`)} />
                With Assembling
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-self-end">
            <span className="text-sm font-medium text-slate-900">
              Total: ₹{itemTotal.toFixed(2)}
            </span>
            <Button 
              type="button" 
              variant='ghost'
              size='small'
              onClick={() => remove(index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemRow;
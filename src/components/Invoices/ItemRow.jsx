import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Select, Input, Button } from '../index';
import { modelOptions } from '../../assets/utils';

const ItemRow = ({ index, control, register, errors, watch, remove }) => {
  const selectedModel = watch(`items.${index}.model`);
  const descriptionOptions = selectedModel ? modelOptions[selectedModel] : [];
  const qty = watch(`items.${index}.qty`) || 0;
  const unitPrice = watch(`items.${index}.unit_price`) || 0;
  const itemTotal = qty * unitPrice;

  return (
    <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
      <button type="button" className="handle text-slate-400 mt-8 cursor-move">
        <GripVertical size={20} />
      </button>
      
      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Product Name */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Product Name
            </label>
            <Controller
              name={`items.${index}.model`}
              control={control}
              rules={{ required: 'Please select a model', validate: value => value !== '-- Select Model --' || 'Please select model' }}
              render={({ field }) => (
                <Select
                  placeholder="-- Select Model --"
                  {...field}
                  required
                  defaultValue="-- Select Model --"
                  options={Object.keys(modelOptions).map(key => (key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')))}
                  error={errors.items?.[index]?.model?.message}
                />
              )}
            />
          </div>

          {/* Description */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Description
            </label>
            <Controller
              name={`items.${index}.description`}
              control={control}
              rules={{ required: 'Please select product description',validate: value => value !== '-- Product Description --' || 'Please select product description' }}
              render={({ field }) => (
                <Select
                  placeholder="-- Product Description --"
                  {...field}
                  required
                  disabled={!selectedModel}
                  defaultValue="-- Product Description --"
                  options={descriptionOptions}
                  error={errors.items?.[index]?.description?.message}
                />
              )}
            />
          </div>

          {/* Quantity */}
          <div className="w-full">
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
          <div className="w-full">
            <Input
              type="number"
              label="Unit Price (with GST)"
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-6">
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
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-self-end">
            <span className="text-sm font-medium text-slate-900">
              Total: ₹{itemTotal.toFixed(2)}
            </span>
            <Button 
              type="button" 
              variant='ghost'
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
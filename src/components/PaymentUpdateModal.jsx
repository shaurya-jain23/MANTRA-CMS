import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ModalContainer, Input, Button } from './index';
import { IndianRupee, Calendar, FileText } from 'lucide-react';
import { calculatePaymentStatus, getPaymentStatusColor } from '../assets/utils';

const PaymentUpdateModal = ({ booking, isOpen, onClose, onUpdate }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      amountPaid: booking?.payment?.amountPaid || 0,
      notes: booking?.payment?.notes || '',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionId: ''
    }
  });
  useEffect(() => {
      if (isOpen) {
        reset({
          amountPaid: booking?.payment?.amountPaid || 0,
          notes: booking?.payment?.notes || '',
          transactionDate: new Date().toISOString().split('T')[0],
          transactionId: ''
        });
      }
    }, [isOpen, booking, reset]);
  
  const amountPaid = watch('amountPaid') || 0;
  const grandTotal = (booking?.totals?.grandTotal) || 0
  const paymentStatus = calculatePaymentStatus(amountPaid, grandTotal);

  const onSubmit = (data) => {
    onUpdate({
      ...data,
      status: paymentStatus,
      previousAmount: booking?.payment?.amountPaid || 0,
    });
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} className="max-w-4xl !p-0">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Update Payment</h2>
        <p className="text-green-100">Update payment information for {booking?.container?.container_no}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              type="number"
              label='Amount Paid (₹)'
              {...register('amountPaid', { 
                valueAsNumber: true,
                required: 'Amount paid is required',
                min: { value: 0, message: 'Amount cannot be negative' },
                max: { value: grandTotal, message: 'Amount cannot exceed grand total' }
              })}
            />
            <Input
              type="date"
              label='Transaction Date'
              {...register('transactionDate', { required: 'Transaction date is required' })}
            />
            <Input
            label='Transaction ID'
            placeholder="Enter transaction ID"
            {...register('transactionId')}
            />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <div className={`px-3 py-2 flex justify-between text-sm rounded-md border ${getPaymentStatusColor(paymentStatus)}`}>
              <div className="font-semibold">{paymentStatus}</div>
              <div className="">
                Paid: ₹{amountPaid.toLocaleString()} / ₹{grandTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <Input
            as="textarea"
            label='Payment Notes'
            rows={2}
            placeholder="Add payment notes or transaction details..."
            {...register('notes')}
          />
        </div>

        {/* Payment History (if any) */}
        {booking?.payment?.transactions?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Payment History</h4>
            <div className="space-y-2">
              {booking.payment.transactions.map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">₹{transaction.amount}</div>
                    <div className="text-sm text-gray-600">{transaction.date}</div>
                  </div>
                  <div className="text-sm text-gray-500">{transaction.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button type="button" variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant='primary' className="w-fit flex items-center gap-2">
            <IndianRupee size={16} />
            Update Payment
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default PaymentUpdateModal;
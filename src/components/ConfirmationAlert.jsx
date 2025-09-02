import React, { useState } from 'react';
import { Button } from './';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {ModalContainer} from './index'

function ConfirmationAlert({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  requiresReason = false,
  confirmText = "Confirm",
  confirmColor = "bg-indigo-600",
  icon = <AlertTriangle className="h-12 w-12 text-red-500" />
}) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(requiresReason ? reason : undefined);
  };

  return (
    <ModalContainer  isOpen={isOpen} title="Book Container" className='max-w-2xl'r>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            {requiresReason && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full p-2 border rounded-md mt-4"
                rows="3"
              />
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button onClick={onClose} bgColor="bg-gray-200" textColor="text-gray-800">Cancel</Button>
          <Button onClick={handleConfirm} bgColor={confirmColor}>{confirmText}</Button>
        </div>
    </ModalContainer>
    )
}

export default ConfirmationAlert
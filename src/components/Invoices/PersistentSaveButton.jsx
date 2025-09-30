import React from 'react';
import {CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import {Button} from '../index'
import { useNavigate } from 'react-router-dom';

const PersistentSaveButton = ({ 
  currentSection, 
  onNext,
  onBack, 
  onConfirm, 
  isSummaryVisible,
  isSubmitting,
  isDisabled = false
}) => {
  const navigate = useNavigate();
  const getButtonConfig = () => {
    if (isSummaryVisible) {
      return {
        text: isDisabled ? 'No Changes Made' : 'Confirm & Update PI',
        icon: CheckCircle,
        onClick: onConfirm,
        variant: 'success'
      };
    }

    switch (currentSection) {
      case 'summary':
        return {
          text: 'Review Invoice',
          icon: ChevronRight,
          onClick: onNext,
          variant: 'primary'
        };
      case 'items':
        return {
          text: 'Next: Summary & Terms',
          icon: ChevronRight,
          onClick: onNext,
          variant: 'primary'
        };
      case 'shipping':
        return {
          text: 'Next: Item Details',
          icon: ChevronRight,
          onClick: onNext,
          variant: 'primary'
        };
      case 'invoice':
      default:
        return {
          text: 'Next: Billing & Shipping',
          icon: ChevronRight,
          onClick: onNext,
          variant: 'primary'
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-4">
        <div className="flex w-full justify-between items-center">
          <div className="text-md text-slate-600 ">
            {!isSummaryVisible && `Step ${['invoice', 'shipping', 'items', 'summary'].indexOf(currentSection) + 1} of 4`}
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant='secondary'
              className="gap-2"
              onClick={isDisabled ? ()=> {navigate('/performa-invoices')} : onBack}
            >
              {!isDisabled &&<ChevronLeft size={18} className="mr-2"/>}
              {isDisabled? 'Cancel' : 'Back'}
            </Button>  
            <Button
              type="button"
              variant='primary'
              disabled={isSubmitting || isDisabled}
              onClick={buttonConfig.onClick}
              className={`${
                buttonConfig.variant === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : ''
              } w-fit gap-2`}
            > {isSubmitting ? 'Submitting...' :<>
            <span>{buttonConfig.text}</span>
              {buttonConfig.variant !== 'disabled' && <IconComponent size={18} />}
              </> }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentSaveButton;
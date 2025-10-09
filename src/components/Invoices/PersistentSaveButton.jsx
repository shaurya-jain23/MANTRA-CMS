import React from 'react';
import {CheckCircle, ChevronRight, ChevronLeft, Send, Save } from 'lucide-react';
import {Button} from '../index'
import { useNavigate } from 'react-router-dom';
import {PI_STATUS} from '../../assets/utils'

const PersistentSaveButton = ({ 
  currentSection, 
  onNext,
  onBack, 
  onConfirm, 
  onSaveDraft,
  onSubmitApproval,
  isSummaryVisible,
  isSubmitting,
  isDisabled = false,
  piToEdit = null
}) => {
  const navigate = useNavigate();
  const getButtonConfig = () => {
    if (piToEdit) {
      const isDraft = piToEdit.status === PI_STATUS.DRAFT;
      const isSubmitted = piToEdit.status === PI_STATUS.SUBMITTED;
      
      if (isSummaryVisible) {
        if (isDraft) {
          return {
            primaryText: 'Save & Submit for Approval',
            primaryIcon: Send,
            primaryOnClick: onSubmitApproval,
            primaryVariant: 'primary',
            secondaryText: 'Save as Draft',
            secondaryIcon: Save,
            secondaryOnClick: onSaveDraft,
            showSecondary: true
          };
        } else if (isSubmitted) {
          return {
            primaryText: 'Update PI',
            primaryIcon: CheckCircle,
            primaryOnClick: onConfirm,
            primaryVariant: 'primary',
            secondaryText: 'Cancel',
            secondaryOnClick: () => navigate('/performa-invoices'),
            showSecondary: true
          };
        } else {
          // For approved/final PIs, only allow updates
          return {
            primaryText: isDisabled ? 'No Changes Made' : 'Update PI',
            primaryIcon: CheckCircle,
            primaryOnClick: onConfirm,
            primaryVariant: 'primary',
            secondaryText: 'Cancel',
            secondaryOnClick: () => navigate('/performa-invoices'),
            showSecondary: true
          };
        }
      }
    }
    if (isSummaryVisible) {
      return {
        primaryText: 'Save & Submit for Approval',
        primaryIcon: Send,
        primaryOnClick: onSubmitApproval,
        primaryVariant: 'primary',
        secondaryText: 'Save as Draft',
        secondaryIcon: Save,
        secondaryOnClick: onSaveDraft,
        showSecondary: true
      };
    }
    switch (currentSection) {
      case 'summary':
        return {
          primaryText: 'Review Invoice',
          primaryIcon: ChevronRight,
          primaryOnClick: onNext,
          primaryVariant: 'primary',
          showSecondary: false
        };
      case 'items':
        return {
          primaryText: 'Next: Summary & Terms',
          primaryIcon: ChevronRight,
          primaryOnClick: onNext,
          primaryVariant: 'primary',
          showSecondary: false
        };
      case 'shipping':
        return {
          primaryText: 'Next: Item Details',
          primaryIcon: ChevronRight,
          primaryOnClick: onNext,
          primaryVariant: 'primary',
          showSecondary: false
        };
      case 'invoice':
      default:
        return {
          primaryText: 'Next: Billing & Shipping',
          primaryIcon: ChevronRight,
          primaryOnClick: onNext,
          primaryVariant: 'primary',
          showSecondary: false
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const PrimaryIcon = buttonConfig.primaryIcon;
  const SecondaryIcon = buttonConfig.secondaryIcon;

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
            {buttonConfig.showSecondary && (
              <Button
                type="button"
                variant='secondary'
                disabled={isSubmitting}
                onClick={buttonConfig.secondaryOnClick}
                className="gap-2"
              >
                {buttonConfig.secondaryIcon && <SecondaryIcon size={18} />}
                {isSubmitting ? 'Saving...' : buttonConfig.secondaryText}
              </Button>
            )}
            <Button
              type="button"
              variant={buttonConfig.primaryVariant}
              disabled={isSubmitting || isDisabled}
              onClick={buttonConfig.primaryOnClick}
              className={`gap-2 ${
                buttonConfig.primaryVariant === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : ''
              } w-fit gap-2`}
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <span>{buttonConfig.primaryText}</span>
                  {buttonConfig.primaryIcon && <PrimaryIcon size={18} />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentSaveButton;
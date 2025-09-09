import { Loader2 } from 'lucide-react'; 
import {ModalContainer} from './index'

function Loading({ isOpen, message = "Processing..." }) {
  if (!isOpen) return null;

  return (
    <ModalContainer isOpen={isOpen} title="loading" className='max-w-fit flex gap-4'>
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
    </ModalContainer>
    
  );
}

export default Loading;

import { Loader2 } from 'lucide-react'; 
import {ModalContainer} from './index'
import './stylesheets/loader.css'

function Loading({ isOpen, message = "Processing..." }) {
  if (!isOpen) return null;

  return (
    <ModalContainer isOpen={isOpen} title="loading" className='max-w-fit flex gap-4'>
        <div className="container"><div className="line"></div></div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
    </ModalContainer>
    
  );
}

export default Loading;

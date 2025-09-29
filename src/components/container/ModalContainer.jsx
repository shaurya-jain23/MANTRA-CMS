import { useEffect } from 'react';

const useScrollLock = (isModalOpen) => {
      useEffect(() => {
        if (isModalOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset'; // or 'auto'
        }

        // Clean up when component unmounts or modal closes
        return () => {
          document.body.style.overflow = 'unset'; // Ensure scroll is restored
        };
      }, [isModalOpen]);
    };

function ModalContainer({children, isOpen, className = ''}) {
  useScrollLock(isOpen);
  return (
    <div className={`fixed inset-0 bg-stone-800/40 flex justify-center overflow-y-auto md:overflow-y-scroll items-center z-50 transition-opacity m-0 duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white p-8 rounded-md shadow-xl w-full max-h-[90vh] transform ${className} transition-all duration-500 ease-out origin-center md:overflow-scroll overflow-auto ${isOpen ? 'scale-100' : 'scale-80'}` }>
            {children}
        </div>
    </div>
  )
}
export default ModalContainer

function ModalContainer({children, isOpen, className = ''}) {
  return (
    <div className={`fixed inset-0 bg-stone-800/60 flex justify-center items-center z-50 transition-opacity m-0 duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white p-8 rounded-md shadow-xl w-full max-h-[90vh] transform ${className} transition-all duration-500 ease-out origin-center overflow-auto ${isOpen ? 'scale-100' : 'scale-80'}` }>
            {children}
        </div>
    </div>
  )
}
export default ModalContainer
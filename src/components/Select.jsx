import React, { useId } from 'react'

function Select({
    options,
    label,
    className,
    placeholder,
    required=false,
    ...props
}, ref) {
    const id = useId()
    
  return (
    <>
        {label && <label className=' pl-1 text-sm font-medium text-gray-700' htmlFor={id}>
            {label}{required && <span className='text-red-500'> *</span>}</label>}
        <select name="" {...props} id={id} ref={ref} required className={`h-10 px-3 py-2 mt-1 border border-slate-200 rounded-md text-slate-900  focus:outline-none focus:bg-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent duration-200 w-full ${className} ${props.disabled ? 'bg-gray-100' : 'bg-white'}`}>
            <option key={placeholder} value={placeholder} disabled>{placeholder || 'Please select an option'}</option>
            {options?.map((option)=>{
                const value = typeof option === 'object' ? option.value : option.trim().toLowerCase().replace(/\s+/g, '_')
                return(
                <option key = {value} value={value} option={option.name || option}>
                    {option.name || option }
                </option>)
            })}
        </select>
    </>
  )
}

export default React.forwardRef(Select)
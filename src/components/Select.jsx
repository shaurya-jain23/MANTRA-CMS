import React, { useId } from 'react'

function Select({
    options,
    label,
    className,
    placeholder,
    ...props
}, ref) {
    const id = useId()
    
  return (
    <div>
        {label && <label className='inline-block pl-1 text-sm font-medium text-gray-700' htmlFor={id}>{label}</label>}
        <select name="" {...props} id={id} ref={ref} className={`px-3 py-2 mt-1 rounded-md shadow-sm bg-white text-black outline-none focus:bg-gray-100 duration-200 w-full ${className}`}>
            <option value={placeholder} disabled>{placeholder || 'Please select an option'}</option>
            {options?.map((option)=>{
                const value = option.trim().toLowerCase().replace(/\s+/g, '_')
                return(
                <option key={value} value={value}>
                    {option}
                </option>)
            })}
        </select>
    </div>
  )
}

export default React.forwardRef(Select)
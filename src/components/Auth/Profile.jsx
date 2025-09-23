import React, {useState, useEffect} from 'react'
import { Mail, Phone, UserRound, BookUser ,Calendar} from 'lucide-react';
import {Input, Button} from '../index'
import { useForm } from 'react-hook-form';

function Profile({isEditing, onSubmit, loading, userData, formatDate, setIsEditing}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      displayName: userData?.displayName || '',
      username: userData?.username || '',
      phone: userData?.phone || '',
    }
  });

   const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };
  useEffect(() => {
    reset({
      displayName: userData?.displayName || '',
      username: userData?.username || '',
      phone: userData?.phone || '',
    });
  }, [isEditing])
  
  return (
    <>
       {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    icon={UserRound}
                    className='md:w-1/2'
                    {...register('displayName', { required: 'Full Name is required' })}
                  />
                  {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}

                  <Input
                    label="Username"
                    type="text"
                    icon={BookUser}
                    className='md:w-1/2'
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}

                  <Input
                    label="Phone Number"
                    type="tel"
                    icon={Phone}
                    className='md:w-1/2'
                    {...register('phone', { 
                      required: 'Phone Number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="secondary" className='w-full' onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{userData?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{userData?.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <BookUser className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{userData?.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(userData?.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}
    </>
  )
}

export default Profile
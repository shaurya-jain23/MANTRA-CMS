import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, login } from '../../features/user/userSlice';
import userService from '../../firebase/user';
import officeService from '../../firebase/office';
import departmentService from '../../firebase/departments';
import { Input, Button, Select } from '../index';
import { ArrowRight, BookUser, FileText, Mail, Phone, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

function UpdateProfile() {
  const userData = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      displayName: userData?.displayName || '',
      username: userData?.username || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      department: userData?.department || 'Select your department',
      officeId: userData?.officeId || 'Choose your office location',
    },
  });

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        // You'll need to create an officeService similar to userService
        const officesList = await officeService.getAllOffices();
        setOffices(officesList);
      } catch (error) {
        console.error('Error fetching offices:', error);
      }
    };
    fetchOffices();
  }, []);

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'officeId') {
        const fetchDepartments = async () => {
          try {
            const departmentsForOffice = await departmentService.getDepartmentsByOffice(
              value.officeId
            );
            setDepartments(departmentsForOffice);
          } catch (error) {
            console.error('Error fetching departments:', error);
          }
        };
        fetchDepartments();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, setDepartments]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const profileData = {
        ...data,
        profileComplete: true,
        status: 'pending', // Set status to pending for approval
      };
      await userService.updateUser(userData.uid, profileData);

      const updatedUser = { ...userData, ...profileData };
      dispatch(login(updatedUser));
      
      // Redirect to pending approval page
      toast.success('Profile completed! Waiting for admin approval...');
      navigate('/pending-approval');
    } catch (error) {
      console.error('Profile completion error:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-grow items-center justify-center bg-gray-50">
      <div className="w-19/20 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white " />
          </div>
          <h1 className="text-xl sm:text-2xl font-semi-bold text-gary-900">
            Complete Your Profile
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900 mb-2">
            MANTRA-CMS
          </h2>
          <p className="text-gray-600 text-sm">Please provide a few more details to continue.</p>
        </div>
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-center text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={UserRound}
            placeholder="Enter your full name"
            {...register('displayName', { required: 'Full Name is required' })}
            error={errors.displayName?.message}
          />
          <Input
            label="Username"
            type="text"
            icon={BookUser}
            placeholder="Enter your username"
            {...register('username', { required: 'Username is required' })}
            error={errors.username?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            disabled
            icon={Mail}
            className="bg-gray-100 cursor-not-allowed"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Email address must be a valid address',
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="Enter your phone number"
            {...register('phone', { required: 'Phone Number is required' })}
            error={errors.phone?.message}
          />
          <Select
            label="Working Office"
            placeholder="Choose your office location"
            defaultValue="Choose your office location"
            value={formData.officeId}
            {...register('officeId', {
              required: 'Please select your office location',
              validate: (value) =>
                value !== 'Choose your office location' || 'Please select your office location',
            })}
            options={offices.map((office) => ({
              value: office.officeId,
              name: office.officeName,
            }))}
            error={errors.officeId?.message}
          />
          <Select
            label="Department"
            disabled={departments.length === 0}
            options={departments.map((dept) => ({
              value: dept.departmentId,
              name: dept.departmentName,
            }))}
            {...register('department', {
              required: 'Please select your department',
              validate: (value) =>
                value !== 'Select your department' || 'Please select your department',
            })}
            defaultValue="Select your department"
            placeholder="Select your department"
          />
          <Button
            type="submit"
            variant="primary"
            className="!mt-6 group text-md"
            disabled={loading || isSubmitting}
          >
            {loading ? (
              'Saving Details...'
            ) : (
              <>
                Save and Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;

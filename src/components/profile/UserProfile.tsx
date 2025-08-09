// src/components/profile/UserProfile.tsx
'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  Shield, 
  CreditCard, 
  MapPin, 
  Settings,
  LogOut,
  Edit3,
  Camera,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function UserProfile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    // Redirect will be handled by auth state change
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ProfileHeader = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-purple-600">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`badge ${user.role === 'organizer' ? 'badge-secondary' : 'badge-primary'}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            {user.isEmailVerified && (
              <div className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-sm">Verified</span>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-outline"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </button>
      </div>
    </div>
  );

  const ProfileTabs = () => (
    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
      {[
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'payments', label: 'Payments', icon: CreditCard }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <tab.icon className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const ProfileContent = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{user.firstName}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{user.lastName}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
            </div>
            {user.isEmailVerified ? (
              <span className="badge badge-success">Verified</span>
            ) : (
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Verify
              </button>
            )}
          </div>
        </div>
        
        {user.phone && (
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.phone}</span>
              </div>
              {user.isPhoneVerified ? (
                <span className="badge badge-success">Verified</span>
              ) : (
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Verify
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Language</label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">
              {user.preferences.language === 'en' ? 'English' : 'Kiswahili'}
            </span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Currency</label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">{user.preferences.currency}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Member Since</label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">{formatDate(user.createdAt)}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Last Login</label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">{formatDate(user.lastLoginAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsContent = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive event updates and confirmations via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              defaultChecked={user.preferences.notifications.email}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">SMS Notifications</h3>
            <p className="text-sm text-gray-600">Receive important updates via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              defaultChecked={user.preferences.notifications.sms}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-600">Receive push notifications in the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              defaultChecked={user.preferences.notifications.push}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const SecurityContent = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div>
            <h3 className="font-medium text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
          <button className="btn btn-outline">
            Change Password
          </button>
        </div>
        
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div>
            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button className="btn btn-outline">
            Enable 2FA
          </button>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="font-medium text-gray-900">Account Deletion</h3>
            <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
          </div>
          <button className="btn text-red-600 border-red-200 hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const PaymentsContent = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h2>
      
      <div className="space-y-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">M</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">M-Pesa</h3>
                <p className="text-sm text-gray-600">+254 7** *** 123</p>
              </div>
            </div>
            <span className="badge badge-primary">Primary</span>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">•••• 1234</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Visa Card</h3>
                <p className="text-sm text-gray-600">Expires 12/26</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <button className="btn btn-outline w-full">
        <CreditCard className="w-4 h-4 mr-2" />
        Add Payment Method
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent />;
      case 'notifications':
        return <NotificationsContent />;
      case 'security':
        return <SecurityContent />;
      case 'payments':
        return <PaymentsContent />;
      default:
        return <ProfileContent />;
    }
  };

  return (
    <div className="container py-6">
      <ProfileHeader />
      <ProfileTabs />
      {renderContent()}
      
      {/* Logout Button */}
      <div className="mt-8">
        <button 
          onClick={handleLogout}
          className="btn text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
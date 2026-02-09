import React from 'react';


const StatCard = ({ label, value, icon: Icon, iconBg, img, iconColor }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#343C6A] mb-2">{label}</p>
          <p className="text-3xl font-bold text-[#343C6A]">{value}</p>
        </div>

        {Icon ? (
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={iconColor} size={24} />
          </div>
        ) : img ? (
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <img src={img} alt={label} className="w-[40%]  rounded-lg object-cover flex-shrink-0" />
          </div>
        ) : null}
      </div>
    </div>
  );
};





export default StatCard;
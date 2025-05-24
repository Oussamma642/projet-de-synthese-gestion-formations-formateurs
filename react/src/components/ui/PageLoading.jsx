import React from 'react';

export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

export default PageLoading; 
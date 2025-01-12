import React, { useState } from 'react';

const TestInterface = () => {
  const [clicked, setClicked] = useState(0);

  // Different ways to handle clicks
  const handleClick1 = () => {
    console.log('Regular button clicked');
    setClicked(prev => prev + 1);
  };

  const handleClick2 = (e) => {
    e.preventDefault();
    console.log('Button with preventDefault clicked');
    setClicked(prev => prev + 1);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Test Interface</h1>
      <div>Clicks: {clicked}</div>
      
      <div className="space-y-2">
        <button 
          onClick={handleClick1}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Regular HTML Button
        </button>
        <br />
        
        <button 
          onClick={handleClick2}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          HTML Button with preventDefault
        </button>
        
        <br />
        
        <div 
          onClick={handleClick1}
          className="px-4 py-2 bg-red-500 text-white rounded inline-block cursor-pointer"
        >
          Clickable Div
        </div>
      </div>
    </div>
  );
};

export default TestInterface;
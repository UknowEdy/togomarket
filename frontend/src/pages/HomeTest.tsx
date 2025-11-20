import { useEffect, useState } from 'react';

export const HomeTest = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/listings')
      .then(r => r.json())
      .then(d => {
        console.log('Data received:', d);
        setData(d);
      })
      .catch(e => console.error('Error:', e));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Listings</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

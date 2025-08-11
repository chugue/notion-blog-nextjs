import Image from 'next/image';
import React from 'react';

const Threads = () => {
  return (
    <Image src={'/icons/threads.svg'} alt="threads" width={20} height={20} className="h-5 w-5" />
  );
};

export default Threads;

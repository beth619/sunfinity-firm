import Link from 'next/link';
import Image from 'next/image';

 export default function Logo(){
    return(
  <Link href="/" className="flex items-center">
   <Image 
        src="/16Sunfinity_Primary_Gold..svg" 
        alt="Logo" 
        width={100} 
        height={10} 
      />
  </Link>
    );

 }
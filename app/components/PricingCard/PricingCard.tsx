
'use client';

   export interface PricingCardProps{
     tierName:string;
     price:number;
     billingPeriod:string;
     description?:string;
     features:{text:string; icon:string}[];
     isPopular?:boolean;
     priceId:string;
     ctaLabel:string;
   }


   export default function PricingCard(
    {
        tierName,
        price,
        billingPeriod,
        description,
        features,
        isPopular,
        priceId,
        ctaLabel,
    } :PricingCardProps
   )
   {
    const handleCheckout=async()=>{

        try{
            
         const response=await fetch ('/api/checkout',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ priceId}),
         });
          const data=await response.json();
       if (data.url) {
        window.location.href = data.url;
          } else {
        console.error('No checkout URL returned', data);
        }
       } catch (error) {
      console.error('Checkout error:', error);
       }
     };

      return(
      <div className="relative rounded-xl border-2 border-gray-300 dark:border-gray-600 p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" >
        {isPopular && (
             <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-green text-white text-xs px-3 py-1 rounded-full">
          Most Popular
        </span>
        )}
        <p className="text-lg font-semibold text-primary-navy dark:text-white">
            {tierName}
        </p>
          <p className="text-2xl font-bold text-primary-navy dark:text-white">
            ${price}/{billingPeriod}
        </p>
           
           {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                 {description}
              </p>
           )}
        <ul className="flex flex-col gap-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <img src={feature.icon} alt="" className="w-4 h-4" />
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {feature.text}
            </p>
          </li>
        ))}
      </ul>
             <button
        onClick={handleCheckout}
        className="mt-auto bg-primary-green text-white rounded-lg py-2 px-4 font-medium hover:opacity-90"
      >
        {ctaLabel}
      </button>

      </div>
      );

   }
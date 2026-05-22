
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ProductListWrapper from './components/product-list-wrapper';
import ProductListSkeleton from './components/product-list-skeleton';
import { Suspense } from 'react';

export default async function Home() {
    return (
        <>
            <section className="bg-white">
                <div className="container flex flex-col md:flex-row items-center justify-between py-12 md:py-24 gap-10 md:gap-0">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-black font-sans leading-tight">
                            Super Delicious Pizza in <br />
                            <span className="text-primary italic">Only 45 Minutes!</span>
                        </h1>
                        <p className="text-xl md:text-2xl mt-6 md:mt-8 max-w-lg leading-snug mx-auto md:mx-0">
                            Enjoy a Free Meal if Your Order Takes More Than 45 Minutes!
                        </p>
                        <Button className="mt-6 md:mt-8 text-lg rounded-full py-6 px-6 font-bold">
                            Get your pizza now
                        </Button>
                    </div>
                    <div className="flex-shrink-0">
                        <Image alt="pizza-main" src={'/pizza-main.png'} width={400} height={400} className="w-64 md:w-[400px] h-auto object-contain" />
                    </div>
                </div>
            </section>
            <Suspense fallback={<ProductListSkeleton />}>
                <ProductListWrapper />
            </Suspense>
        </>
    );
}

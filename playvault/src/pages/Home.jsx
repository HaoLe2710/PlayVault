import React from 'react';
import Slideshow from '../components/home/slideshow/slideshow.jsx';
import ProductCategories from '../components/home/product/ProductCategories.jsx';
import ProductList from '../components/home/product/ProductList.jsx';
import ProductListNgang from '../components/home/product/ProductListNgang.jsx';

const Home = () => {
    return (
        <>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 w-full h-full">
                <Slideshow />
            </div>
            <ProductCategories />

        </>


    );
};

export default Home;
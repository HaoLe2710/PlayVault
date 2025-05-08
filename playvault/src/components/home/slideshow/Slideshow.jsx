import { useState, useEffect } from 'react';
import Slide from './Slide';

const slides = [
    {
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        title: 'Beautiful Beach',
        description: 'Relax by the serene ocean waves'
    },
    {
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        title: 'Mountain Adventure',
        description: 'Explore breathtaking peaks'
    },
    {
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
        title: 'Starry Night',
        description: 'Marvel at the cosmic beauty'
    }
];

const Slideshow = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [direction, setDirection] = useState('next');

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection('next');
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
                setIsFlipping(false);
            }, 600);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index, dir) => {
        if (!isFlipping) {
            setDirection(dir);
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentSlide(index);
                setIsFlipping(false);
            }, 600);
        }
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % slides.length, 'next');
    };

    const prevSlide = () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length, 'prev');
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[500px] overflow-hidden rounded-lg shadow-xl perspective-1000">
            <div className="relative w-full h-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full transition-transform duration-600 ease-in-out transform ${index === currentSlide
                            ? 'translate-x-0 rotate-y-0'
                            : direction === 'next'
                                ? index === (currentSlide - 1 + slides.length) % slides.length
                                    ? isFlipping
                                        ? '-translate-x-full rotate-y-90'
                                        : '-translate-x-full rotate-y-90'
                                    : 'translate-x-full rotate-y-90'
                                : index === (currentSlide + 1) % slides.length
                                    ? isFlipping
                                        ? 'translate-x-full rotate-y-90'
                                        : 'translate-x-full rotate-y-90'
                                    : '-translate-x-full rotate-y-90'
                            }`}
                        style={{
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        <Slide slide={slide} isActive={index === currentSlide} />
                    </div>
                ))}
            </div>
            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
                <button
                    onClick={prevSlide}
                    className="bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition"
                    disabled={isFlipping}
                >
                    ←
                </button>
                <button
                    onClick={nextSlide}
                    className="bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition"
                    disabled={isFlipping}
                >
                    →
                </button>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
                        className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-gray-400'
                            }`}
                        disabled={isFlipping}
                    />
                ))}
            </div>
        </div>
    );
};

export default Slideshow;
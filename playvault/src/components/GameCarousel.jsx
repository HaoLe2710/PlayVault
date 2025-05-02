import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"

function GameCarousel({ images, gameName }) {
  return (
    <Carousel className="w-full max-w-5xl mx-auto">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative overflow-hidden rounded-xl aspect-video">
              <img
                src={image || "/placeholder.svg"}
                alt={`${gameName} screenshot ${index + 1}`}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent pointer-events-none"></div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="bg-purple-600 hover:bg-purple-700 text-white border-none" />
      <CarouselNext className="bg-purple-600 hover:bg-purple-700 text-white border-none" />
    </Carousel>
  )
}

export default GameCarousel

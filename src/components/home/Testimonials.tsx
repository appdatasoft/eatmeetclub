
const Testimonials = () => {
  return (
    <section className="section-padding bg-teal-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">What People Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from restaurant owners and attendees who have used Eat Meet Club.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <img 
                src="https://randomuser.me/api/portraits/women/45.jpg" 
                alt="Restaurant Owner" 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-medium">Sarah Johnson</h4>
                <p className="text-sm text-gray-500">Owner, Urban Bistro</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Eat Meet Club has transformed our slow Tuesday nights into one of our busiest evenings! 
              The platform is easy to use and we've built a loyal community of regulars through our monthly chef's table events."
            </p>
            <div className="mt-4 flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Event Attendee" 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-medium">Michael Chen</h4>
                <p className="text-sm text-gray-500">Regular Attendee</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "As someone new to the city, Eat Meet Club has been amazing for discovering local restaurants and meeting people. 
              The breakfast networking events are perfect for professionals, and I've made both business connections and friends!"
            </p>
            <div className="mt-4 flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

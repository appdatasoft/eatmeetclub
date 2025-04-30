
interface MemoryContentProps {
  photoUrl?: string | null;
  title: string;
}

const MemoryContent = ({ photoUrl, title }: MemoryContentProps) => {
  return (
    <div className="w-full md:w-1/2">
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt={title}
          className="w-full h-64 object-cover rounded-md"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
          <span className="text-gray-500">No image</span>
        </div>
      )}
    </div>
  );
};

export default MemoryContent;

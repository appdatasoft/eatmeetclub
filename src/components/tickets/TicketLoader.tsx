
interface TicketLoaderProps {
  message: string;
}

const TicketLoader = ({ message }: TicketLoaderProps) => {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-3">{message}</span>
    </div>
  );
};

export default TicketLoader;

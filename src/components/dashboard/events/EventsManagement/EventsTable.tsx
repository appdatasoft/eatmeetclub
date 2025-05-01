
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Event } from "./types";
import EventRow from "./EventRow";

interface EventsTableProps {
  events: Event[];
  onRefresh: () => void;
}

const EventsTable = ({ events, onRefresh }: EventsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <EventRow key={event.id} event={event} onRefresh={onRefresh} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventsTable;

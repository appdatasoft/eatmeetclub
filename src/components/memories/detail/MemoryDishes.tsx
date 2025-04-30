
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemoryDish } from "@/types/memory";

interface MemoryDishesProps {
  dishes: MemoryDish[] | undefined;
}

const MemoryDishes = ({ dishes }: MemoryDishesProps) => {
  if (!dishes || dishes.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-medium">Favorite Dishes</h3>
      <Separator className="my-2" />
      <div className="flex flex-wrap gap-2 mt-2">
        {dishes.map(dish => (
          <Badge key={dish.id} variant="secondary">
            {dish.dish_name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default MemoryDishes;

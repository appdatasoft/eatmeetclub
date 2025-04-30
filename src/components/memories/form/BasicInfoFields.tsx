
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { MemoryFormValues } from '../schema/memoryFormSchema';
import DatePickerField from './DatePickerField';

interface BasicInfoFieldsProps {
  form: UseFormReturn<MemoryFormValues>;
}

const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Memory Title*</FormLabel>
            <FormControl>
              <Input placeholder="Enter a title for your memory" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location*</FormLabel>
            <FormControl>
              <Input placeholder="Where did this memory take place?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DatePickerField form={form} />
    </>
  );
};

export default BasicInfoFields;

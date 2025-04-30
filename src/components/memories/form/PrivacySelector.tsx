
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { MemoryFormValues } from '../schema/memoryFormSchema';

interface PrivacySelectorProps {
  form: UseFormReturn<MemoryFormValues>;
}

const PrivacySelector = ({ form }: PrivacySelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="privacy"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Privacy Setting*</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="public" />
                </FormControl>
                <FormLabel className="font-normal">
                  Public - Anyone can see this memory
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="unlisted" />
                </FormControl>
                <FormLabel className="font-normal">
                  Unlisted - Only people with the link and attendees can see this memory
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="private" />
                </FormControl>
                <FormLabel className="font-normal">
                  Private - Only you can see this memory
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PrivacySelector;

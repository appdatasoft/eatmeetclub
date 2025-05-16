
import ImageEditorDialog from "./image-editor/ImageEditorDialog";

interface BackgroundImageEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage: string;
  onSave: (url: string) => Promise<void>;
}

const BackgroundImageEditor = (props: BackgroundImageEditorProps) => {
  return <ImageEditorDialog {...props} />;
};

export default BackgroundImageEditor;

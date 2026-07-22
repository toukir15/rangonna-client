import Image from "next/image";
import Icon from "../Icon/Icon";

type ModalProps = {
  selectedImage: string;
  closeModal: () => void;
};

const ImagePreviewModal: React.FC<ModalProps> = ({
  selectedImage,
  closeModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-[2px] md:px-0 px-4">
      <div className="relative">
        <Image
          src={selectedImage}
          alt="High-Resolution Preview"
          width={600}
          height={600}
          className="rounded-lg max-h-[80vh]"
        />
        <Icon
          onClick={closeModal}
          name="close"
          variant="outlined"
          className="absolute top-2 right-2 text-white text-xl bg-gray-800 rounded-full p-1 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;

import { Input } from "@/components/ui/input";

const ContentEditorPreviewInput = ({ ...rest }) => {
  return (
    <Input
      className="text-2xl  disabled:placeholder:text-gray-600 disabled:border-gray-600 rounded-none border-0 border-b outline-0 ring-0 focus:outline-0 focus:ring-0 focus-visible:outline-0 focus-visible:ring-0 focus-within:ring-0 focus-within:outline-0 disabled:cursor-default"
      disabled={true}
      {...rest}
    />
  );
};

export default ContentEditorPreviewInput;

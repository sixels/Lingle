import { Toast } from "solid-toast";

type ToastOption = {
  name: string;
  callback: (toast: Toast) => void;
};

interface MyToastProps {
  toast: Toast;
  message: string;
  options?: ToastOption[];
}
export const MyToast = ({ toast, message, options }: MyToastProps) => {
  const optionList =
    options && options.length > 0
      ? options.map((opt) => (
          <button class="option" onClick={() => opt.callback(toast)}>
            <div class="option-text">{opt.name}</div>
          </button>
        ))
      : null;

  return (
    <div class="my-toast">
      {message}
      {optionList && <div class="options">{optionList}</div>}
    </div>
  );
};

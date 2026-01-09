export type ImagePickerResult = { uri: string; canceled: false } | { canceled: true };

export async function pickImage(_useCamera: boolean): Promise<ImagePickerResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ canceled: true });
        return;
      }
      const uri = URL.createObjectURL(file);
      resolve({ uri, canceled: false });
    };
    input.oncancel = () => resolve({ canceled: true });
    input.click();
  });
}

let fileInputRef: HTMLInputElement | null = null;
let pendingCallback: ((uri: string) => void) | null = null;

export function createImageInput(onSelect: (uri: string) => void): HTMLInputElement {
  if (typeof document === 'undefined') return null as unknown as HTMLInputElement;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      (pendingCallback ?? onSelect)(uri);
    }
    input.value = '';
  };
  document.body.appendChild(input);
  fileInputRef = input;
  return input;
}

export function triggerImageInput(input: HTMLInputElement | null, _useCamera: boolean, onSelect: (uri: string) => void): void {
  const target = input ?? fileInputRef;
  if (!target) {
    pickImage(false).then((result) => {
      if (!result.canceled) onSelect(result.uri);
    });
    return;
  }
  pendingCallback = onSelect;
  target.click();
}
